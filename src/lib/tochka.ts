/**
 * Tochka Bank Acquiring API Client
 * https://developers.tochka.com/docs/pay-gateway/
 */

const TOCHKA_BASE_URL = "https://enter.tochka.com/uapi";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

function getConfig() {
    const jwtToken = process.env.TOCHKA_JWT_TOKEN;
    const clientId = process.env.TOCHKA_CLIENT_ID;
    const customerCode = process.env.TOCHKA_CUSTOMER_CODE;
    const merchantId = process.env.TOCHKA_MERCHANT_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://enotik.net";

    if (!jwtToken || !clientId || !customerCode) {
        throw new Error(
            "Missing Tochka Bank environment variables (TOCHKA_JWT_TOKEN, TOCHKA_CLIENT_ID, TOCHKA_CUSTOMER_CODE)"
        );
    }

    return { jwtToken, clientId, customerCode, merchantId, baseUrl };
}

function getHeaders() {
    const { jwtToken } = getConfig();
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Universal request wrapper
// ─────────────────────────────────────────────────────────────────────────────

async function tochkaRequest<T = unknown>(
    method: "GET" | "POST" | "PUT",
    path: string,
    body?: unknown
): Promise<{ ok: boolean; status: number; data: T }> {
    const url = `${TOCHKA_BASE_URL}${path}`;
    const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = (await response.json()) as T;
    return { ok: response.ok, status: response.status, data };
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreatePaymentParams {
    /** Internal order ID */
    orderId: string;
    /** Amount in RUBLES (not kopecks!) */
    amount: number;
    /** Payment description */
    purpose: string;
    /** Allowed payment methods */
    paymentModes?: string[];
    /** Override success redirect */
    redirectUrl?: string;
    /** Override fail redirect */
    failRedirectUrl?: string;
}

export interface CreatePaymentResult {
    success: boolean;
    paymentLink?: string;
    operationId?: string;
    error?: string;
}

export interface PaymentInfo {
    operationId: string;
    status: string;
    amount: number;
    purpose: string;
    paymentType?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Methods
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a payment link
 * POST /acquiring/v1.0/payments
 */
export async function createPayment(
    params: CreatePaymentParams
): Promise<CreatePaymentResult> {
    const { customerCode, merchantId, baseUrl } = getConfig();

    const operation: Record<string, unknown> = {
        customerCode,
        amount: params.amount, // RUBLES, not kopecks
        purpose: params.purpose,
        paymentMode: params.paymentModes || ["card", "sbp"],
        redirectUrl:
            params.redirectUrl ||
            `${baseUrl}/checkout/success`,
        failRedirectUrl:
            params.failRedirectUrl ||
            `${baseUrl}/checkout/fail`,
    };

    if (merchantId) operation.merchantId = merchantId;

    const requestBody = {
        Data: {
            Operation: [operation],
        },
    };

    console.log("[Tochka] createPayment request:", JSON.stringify(requestBody, null, 2));

    try {
        const { ok, data } = await tochkaRequest<Record<string, unknown>>(
            "POST",
            "/acquiring/v1.0/payments",
            requestBody
        );

        console.log("[Tochka] createPayment response:", JSON.stringify(data, null, 2));

        if (!ok) {
            return {
                success: false,
                error:
                    (data as { message?: string })?.message ||
                    JSON.stringify(data),
            };
        }

        // Response structure: Data.Operation[0].paymentLink / operationId
        const respData = data as {
            Data?: {
                Operation?: Array<{
                    paymentLink?: string;
                    operationId?: string;
                    payment_link?: string;
                    operation_id?: string;
                }>;
            };
        };

        const op = respData?.Data?.Operation?.[0];
        const paymentLink =
            op?.paymentLink || op?.payment_link || undefined;
        const operationId =
            op?.operationId || op?.operation_id || undefined;

        if (!paymentLink) {
            return {
                success: false,
                error: "API не вернул paymentLink. Ответ: " + JSON.stringify(data),
            };
        }

        return { success: true, paymentLink, operationId };
    } catch (error) {
        console.error("[Tochka] createPayment exception:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Network error",
        };
    }
}

/**
 * Get payment info
 * GET /acquiring/v1.0/payments/{operationId}
 */
export async function getPaymentInfo(
    operationId: string
): Promise<PaymentInfo | null> {
    try {
        const { ok, data } = await tochkaRequest<Record<string, unknown>>(
            "GET",
            `/acquiring/v1.0/payments/${operationId}`
        );

        if (!ok) {
            console.error("[Tochka] getPaymentInfo error:", data);
            return null;
        }

        const respData = data as {
            Data?: {
                Operation?: Array<{
                    operationId?: string;
                    status?: string;
                    amount?: number;
                    purpose?: string;
                    paymentType?: string;
                }>;
            };
        };

        const op = respData?.Data?.Operation?.[0];
        if (!op) return null;

        return {
            operationId: op.operationId || operationId,
            status: op.status || "UNKNOWN",
            amount: op.amount || 0,
            purpose: op.purpose || "",
            paymentType: op.paymentType,
        };
    } catch (error) {
        console.error("[Tochka] getPaymentInfo exception:", error);
        return null;
    }
}

/**
 * Refund a payment
 * POST /acquiring/v1.0/refunds
 */
export async function refundPayment(
    operationId: string,
    amount?: number
): Promise<{ success: boolean; error?: string }> {
    const { customerCode } = getConfig();

    const refundOp: Record<string, unknown> = {
        customerCode,
        operationId,
    };
    if (amount !== undefined) {
        refundOp.amount = amount; // Partial refund in rubles
    }

    try {
        const { ok, data } = await tochkaRequest(
            "POST",
            "/acquiring/v1.0/refunds",
            { Data: { Operation: [refundOp] } }
        );

        if (!ok) {
            console.error("[Tochka] refundPayment error:", data);
            return {
                success: false,
                error:
                    (data as { message?: string })?.message ||
                    JSON.stringify(data),
            };
        }

        return { success: true };
    } catch (error) {
        console.error("[Tochka] refundPayment exception:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Network error",
        };
    }
}

/**
 * Register webhook for payment notifications
 * PUT /webhook/v1.0/{client_id}
 */
export async function createWebhook(
    webhookUrl: string,
    webhookTypes: string[] = ["acquiringInternetPayment"]
): Promise<{ success: boolean; error?: string }> {
    const { clientId } = getConfig();

    try {
        const { ok, data } = await tochkaRequest(
            "PUT",
            `/webhook/v1.0/${clientId}`,
            {
                url: webhookUrl,
                webhookType: webhookTypes,
            }
        );

        console.log("[Tochka] createWebhook response:", data);

        if (!ok) {
            return {
                success: false,
                error:
                    (data as { message?: string })?.message ||
                    JSON.stringify(data),
            };
        }

        return { success: true };
    } catch (error) {
        console.error("[Tochka] createWebhook exception:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Network error",
        };
    }
}
