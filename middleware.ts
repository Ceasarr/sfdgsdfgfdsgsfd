import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Lightweight token verification for Edge Runtime ──────────────────────
// Uses the Web Crypto API (available in Edge Runtime) instead of Node.js crypto.

interface TokenPayload {
    sub: string;
    exp: number;
    iat: number;
}

// Helper: base64url encode a Uint8Array
function base64urlEncode(buf: Uint8Array): string {
    let binary = '';
    for (const byte of buf) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Helper: base64url decode to Uint8Array
function base64urlDecode(str: string): Uint8Array {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// Timing-safe comparison for two Uint8Arrays
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
    }
    return result === 0;
}

async function verifyTokenInMiddleware(tokenValue: string): Promise<string | null> {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return null;

    const dotIndex = tokenValue.indexOf('.');
    if (dotIndex === -1) return null;

    const payloadB64 = tokenValue.slice(0, dotIndex);
    const signature = tokenValue.slice(dotIndex + 1);

    // Import the secret key for HMAC-SHA256
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    // Recompute expected signature
    const data = encoder.encode(payloadB64);
    const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
    const expected = base64urlEncode(new Uint8Array(sigBuffer));

    // Length comparison first (fast path)
    if (signature.length !== expected.length) return null;

    // Timing-safe comparison
    try {
        const sigBytes = base64urlDecode(signature);
        const expBytes = base64urlDecode(expected);
        if (!timingSafeEqual(sigBytes, expBytes)) return null;
    } catch {
        return null;
    }

    // Decode payload and check expiry
    try {
        const decoder = new TextDecoder();
        const payload: TokenPayload = JSON.parse(
            decoder.decode(base64urlDecode(payloadB64))
        );
        const now = Math.floor(Date.now() / 1000);
        if (!payload.sub || !payload.exp || payload.exp <= now) {
            return null;
        }
        return payload.sub;
    } catch {
        return null;
    }
}

// ─── Middleware ──────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ── Protect /admin routes server-side ───────────────────────────────
    if (pathname.startsWith('/admin')) {
        const sessionToken = request.cookies.get('session_token')?.value;

        if (!sessionToken) {
            // No session → redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        const userId = await verifyTokenInMiddleware(sessionToken);
        if (!userId) {
            // Invalid/expired token → redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            const response = NextResponse.redirect(loginUrl);
            // Clear the invalid cookie
            response.cookies.delete('session_token');
            return response;
        }

        // Token is valid — allow access. 
        // Note: admin role check is still done in API routes/pages 
        // because middleware cannot query the DB.
        return NextResponse.next();
    }

    // ── Security headers for all responses ──────────────────────────────
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes — have their own auth)
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico, robots.txt, sitemap.xml
         */
        '/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)',
    ],
};
