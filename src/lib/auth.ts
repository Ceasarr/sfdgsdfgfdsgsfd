import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// ─── Constants ──────────────────────────────────────────────────────────────
const SESSION_COOKIE = "session_token";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

/**
 * Get the session secret. Throws at startup if not configured.
 * NEVER use a fallback — a missing secret is a fatal misconfiguration.
 */
function getSecret(): string {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error(
            "[auth] SESSION_SECRET is missing or too short (min 32 chars). " +
            "Generate one with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
        );
    }
    return secret;
}

// ─── Token format: base64url(JSON{userId, exp}).signature ───────────────────

interface TokenPayload {
    /** User ID */
    sub: string;
    /** Expiry timestamp (seconds since epoch) */
    exp: number;
    /** Issued-at timestamp (seconds since epoch) */
    iat: number;
}

/**
 * Create a signed session token with expiry.
 * Format: base64url(payload).hmac_signature
 */
export function createSessionToken(userId: string): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: TokenPayload = {
        sub: userId,
        exp: now + SESSION_MAX_AGE,
        iat: now,
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto
        .createHmac("sha256", getSecret())
        .update(payloadB64)
        .digest("base64url");
    return `${payloadB64}.${signature}`;
}

/**
 * Verify token signature and expiry. Returns userId or null.
 */
function verifySessionToken(token: string): string | null {
    const dotIndex = token.indexOf(".");
    if (dotIndex === -1) return null;

    const payloadB64 = token.slice(0, dotIndex);
    const signature = token.slice(dotIndex + 1);

    // Recompute expected signature
    const expected = crypto
        .createHmac("sha256", getSecret())
        .update(payloadB64)
        .digest("base64url");

    // Timing-safe comparison
    if (signature.length !== expected.length) return null;
    try {
        const sigBuf = Buffer.from(signature, "base64url");
        const expBuf = Buffer.from(expected, "base64url");
        if (sigBuf.length !== expBuf.length) return null;
        if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    } catch {
        return null;
    }

    // Decode payload and check expiry
    try {
        const payload: TokenPayload = JSON.parse(
            Buffer.from(payloadB64, "base64url").toString("utf-8")
        );
        const now = Math.floor(Date.now() / 1000);
        if (!payload.sub || !payload.exp || payload.exp <= now) {
            return null; // expired or malformed
        }
        return payload.sub;
    } catch {
        return null;
    }
}

// ─── Cookie helpers ─────────────────────────────────────────────────────────

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
};

/**
 * Set the session cookie (call after successful login).
 */
export async function setSessionCookie(userId: string) {
    const token = createSessionToken(userId);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, COOKIE_OPTIONS);
}

/**
 * Clear the session cookie (call on logout).
 */
export async function clearSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
}

// ─── Session retrieval ──────────────────────────────────────────────────────

export interface SessionUser {
    id: string;
    email: string;
    name: string | null;
    role: string;
}

/**
 * Get the currently authenticated user from the session cookie.
 * Returns null if not authenticated, token expired, or session is invalid.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE)?.value;
        if (!token) return null;

        const userId = verifySessionToken(token);
        if (!userId) return null;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true },
        });

        return user;
    } catch {
        return null;
    }
}

/**
 * Get the currently authenticated admin user.
 * Returns null if not authenticated or not admin.
 */
export async function getAdminUser(): Promise<SessionUser | null> {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") return null;
    return user;
}

/**
 * Lightweight check: verify session token from a cookie value WITHOUT a DB query.
 * Useful for middleware where DB access is not available.
 * Returns userId if the token is valid and not expired, null otherwise.
 */
export function verifySessionTokenFromValue(tokenValue: string): string | null {
    return verifySessionToken(tokenValue);
}
