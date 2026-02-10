import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email и пароль обязательны" },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Неверный email или пароль" },
                { status: 401 }
            );
        }

        // Verify password
        const passwordValid = await bcrypt.compare(password, user.password);

        if (!passwordValid) {
            return NextResponse.json(
                { error: "Неверный email или пароль" },
                { status: 401 }
            );
        }

        // Set httpOnly session cookie
        await setSessionCookie(user.id);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            message: "Вход выполнен успешно",
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        );
    }
}
