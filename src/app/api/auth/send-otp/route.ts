import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mailer";
import { verifyRecaptcha } from "@/lib/recaptcha";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name, recaptchaToken } = body;

        // ── reCAPTCHA verification ───────────────────────────────────────
        if (!recaptchaToken) {
            return NextResponse.json(
                { error: "Проверка безопасности не пройдена" },
                { status: 403 }
            );
        }

        const captchaResult = await verifyRecaptcha(recaptchaToken, "register");
        if (!captchaResult.success) {
            console.warn("reCAPTCHA failed:", captchaResult.error, "score:", captchaResult.score);
            return NextResponse.json(
                { error: "Проверка безопасности не пройдена. Попробуйте ещё раз." },
                { status: 403 }
            );
        }

        // ── Validation ───────────────────────────────────────────────────
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email и пароль обязательны" },
                { status: 400 }
            );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: "Некорректный формат email" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Пароль должен быть не короче 6 символов" },
                { status: 400 }
            );
        }

        // ── Check if email is already registered ─────────────────────────
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Пользователь с таким email уже существует" },
                { status: 400 }
            );
        }

        // ── Rate limit: max 1 code per 60 seconds per email ─────────────
        const recentOtp = await prisma.otpCode.findFirst({
            where: {
                email,
                createdAt: { gt: new Date(Date.now() - 60 * 1000) },
            },
        });

        if (recentOtp) {
            return NextResponse.json(
                { error: "Подождите минуту перед повторной отправкой кода" },
                { status: 429 }
            );
        }

        // ── Generate OTP & hash password ─────────────────────────────────
        const code = crypto.randomInt(100000, 999999).toString();
        const hashedPassword = await bcrypt.hash(password, 12);

        // Delete old OTP codes for this email
        await prisma.otpCode.deleteMany({ where: { email } });

        // Save new OTP (15 min expiry)
        await prisma.otpCode.create({
            data: {
                email,
                code,
                password: hashedPassword,
                name: name || null,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });

        // ── Send email ───────────────────────────────────────────────────
        await sendOtpEmail(email, code);

        return NextResponse.json(
            { message: "Код подтверждения отправлен на email" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Send OTP error:", error);
        return NextResponse.json(
            { error: "Не удалось отправить код. Попробуйте позже." },
            { status: 500 }
        );
    }
}
