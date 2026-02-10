import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, code } = body;

        // ── Validation ───────────────────────────────────────────────────
        if (!email || !code) {
            return NextResponse.json(
                { error: "Email и код подтверждения обязательны" },
                { status: 400 }
            );
        }

        // ── Find valid OTP ───────────────────────────────────────────────
        const otpRecord = await prisma.otpCode.findFirst({
            where: {
                email,
                code,
                expiresAt: { gt: new Date() },
            },
        });

        if (!otpRecord) {
            return NextResponse.json(
                { error: "Неверный или просроченный код" },
                { status: 400 }
            );
        }

        // ── Check if user already exists (race condition guard) ──────────
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // Clean up OTP codes
            await prisma.otpCode.deleteMany({ where: { email } });
            return NextResponse.json(
                { error: "Пользователь с таким email уже существует" },
                { status: 400 }
            );
        }

        // ── Create user (password already hashed in send-otp) ────────────
        const user = await prisma.user.create({
            data: {
                email,
                password: otpRecord.password,
                name: otpRecord.name,
                role: "user",
            },
        });

        // ── Clean up all OTP codes for this email ────────────────────────
        await prisma.otpCode.deleteMany({ where: { email } });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(
            {
                message: "Пользователь успешно зарегистрирован",
                user: userWithoutPassword,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        );
    }
}
