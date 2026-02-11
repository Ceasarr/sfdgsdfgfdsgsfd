import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as jose from "jose";

/**
 * POST /api/payment/webhook
 * Handle Tochka Bank payment notifications (acquiringInternetPayment)
 *
 * The body is a JWT string (RS256), NOT JSON.
 * We decode the JWT, extract the payload, and update the order.
 *
 * IMPORTANT: ALWAYS return HTTP 200, even on errors (prevents retries up to 30x).
 */

// Tochka public key for webhook JWT verification
// Obtained from: https://enter.tochka.com/uapi/open-banking/v1.0/.well-known/openid-configuration
// or Tochka documentation. Replace with real key when available.
const TOCHKA_JWKS_URL = "https://enter.tochka.com/uapi/open-banking/v1.0/.well-known/jwks.json";

interface TochkaWebhookPayload {
    webhookType?: string;
    status?: string;       // "APPROVED" | "AUTHORIZED" | "DECLINED" | "REFUNDED"
    operationId?: string;
    amount?: number;
    paymentType?: string;  // "card" | "sbp" | "dolyame"
    customerCode?: string;
    merchantId?: string;
    purpose?: string;
    consumerId?: string;
    orderId?: string;
    // Allow any other fields
    [key: string]: unknown;
}

export async function POST(req: NextRequest) {
    try {
        // Tochka sends the webhook body as a raw JWT string
        const token = await req.text();

        if (!token || token.trim().length === 0) {
            console.error("[Webhook] Empty body received");
            return new Response("OK", { status: 200 });
        }

        let payload: TochkaWebhookPayload;

        // Try to verify the JWT with Tochka's public key
        try {
            // Fetch JWKS from Tochka
            const jwks = jose.createRemoteJWKSet(new URL(TOCHKA_JWKS_URL));

            const { payload: jwtPayload } = await jose.jwtVerify(token.trim(), jwks, {
                algorithms: ["RS256"],
            });

            payload = jwtPayload as unknown as TochkaWebhookPayload;
            console.log("[Webhook] JWT verified successfully");
        } catch (jwtError) {
            console.warn("[Webhook] JWT verification failed, trying to decode without verification:", jwtError);

            // Fallback: try to decode without verifying (for development/testing)
            // In production, you should fix the public key and reject unverified webhooks
            try {
                const decoded = jose.decodeJwt(token.trim());
                payload = decoded as unknown as TochkaWebhookPayload;
                console.warn("[Webhook] Using UNVERIFIED JWT payload (fix public key for production!)");
            } catch {
                // Last resort: try to parse as JSON
                try {
                    payload = JSON.parse(token) as TochkaWebhookPayload;
                    console.warn("[Webhook] Parsed as plain JSON");
                } catch {
                    console.error("[Webhook] Cannot parse body:", token.substring(0, 200));
                    return new Response("OK", { status: 200 });
                }
            }
        }

        // Log the payload
        console.log("[Webhook] Payload:", JSON.stringify(payload, null, 2));

        const {
            webhookType,
            status,
            operationId,
            orderId,
        } = payload;

        // Only process acquiringInternetPayment webhooks
        if (webhookType && webhookType !== "acquiringInternetPayment") {
            console.log(`[Webhook] Ignoring webhookType: ${webhookType}`);
            return new Response("OK", { status: 200 });
        }

        if (!operationId) {
            console.error("[Webhook] Missing operationId in payload");
            return new Response("OK", { status: 200 });
        }

        console.log(
            `[Webhook] operationId=${operationId}, status=${status}, orderId=${orderId}`
        );

        // Find the order by operationId or orderId
        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    { operationId: operationId },
                    ...(orderId ? [{ id: orderId }] : []),
                ],
            },
        });

        if (!order) {
            console.error(
                `[Webhook] Order not found: operationId=${operationId}, orderId=${orderId}`
            );
            return new Response("OK", { status: 200 });
        }

        // Map Tochka status → our status
        let newPaymentStatus: string;
        let newOrderStatus: string;

        switch (status) {
            case "APPROVED":
                newPaymentStatus = "paid";
                newOrderStatus = "paid";
                break;
            case "AUTHORIZED":
                newPaymentStatus = "paid";
                newOrderStatus = "paid";
                break;
            case "DECLINED":
                newPaymentStatus = "failed";
                newOrderStatus = "cancelled";
                break;
            case "REFUNDED":
                newPaymentStatus = "refunded";
                newOrderStatus = "refunded";
                break;
            default:
                console.warn(`[Webhook] Unknown status: ${status}`);
                return new Response("OK", { status: 200 });
        }

        // Update order in DB
        await prisma.order.update({
            where: { id: order.id },
            data: {
                paymentStatus: newPaymentStatus,
                status: newOrderStatus,
                operationId: operationId || order.operationId,
            },
        });

        console.log(
            `[Webhook] Order ${order.id} updated → paymentStatus=${newPaymentStatus}, status=${newOrderStatus}`
        );

        return new Response("OK", { status: 200 });
    } catch (error) {
        console.error("[Webhook] Unhandled error:", error);
        // ALWAYS 200 to prevent infinite retries
        return new Response("OK", { status: 200 });
    }
}

// Tochka may send GET to verify the endpoint is alive
export async function GET() {
    return NextResponse.json({ status: "ok" });
}
