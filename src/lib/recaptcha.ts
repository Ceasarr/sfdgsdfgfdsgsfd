interface RecaptchaVerifyResult {
    success: boolean;
    score?: number;
    action?: string;
    error?: string;
}

export async function verifyRecaptcha(
    token: string,
    expectedAction: string
): Promise<RecaptchaVerifyResult> {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
        console.error("RECAPTCHA_SECRET_KEY is not set");
        return { success: false, error: "reCAPTCHA not configured" };
    }

    try {
        const response = await fetch(
            "https://www.google.com/recaptcha/api/siteverify",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    secret: secretKey,
                    response: token,
                }),
            }
        );

        const data = await response.json();

        if (!data.success) {
            return {
                success: false,
                error: "reCAPTCHA verification failed",
            };
        }

        if (data.action && data.action !== expectedAction) {
            return {
                success: false,
                score: data.score,
                action: data.action,
                error: `Action mismatch: expected "${expectedAction}", got "${data.action}"`,
            };
        }

        if (data.score < 0.5) {
            return {
                success: false,
                score: data.score,
                action: data.action,
                error: "Score too low",
            };
        }

        return {
            success: true,
            score: data.score,
            action: data.action,
        };
    } catch (error) {
        console.error("reCAPTCHA verification error:", error);
        return { success: false, error: "Failed to verify reCAPTCHA" };
    }
}
