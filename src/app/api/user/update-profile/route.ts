import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function PUT(request: Request) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) {
            return NextResponse.json(
                { error: "Необходима авторизация" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { email, name } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email обязателен" },
                { status: 400 }
            );
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: "Некорректный формат email" },
                { status: 400 }
            );
        }

        // Check if email is already used by another user
        const existingUser = await prisma.user.findFirst({
            where: {
                email,
                NOT: {
                    id: sessionUser.id,
                },
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Этот email уже используется" },
                { status: 409 }
            );
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: sessionUser.id },
            data: {
                email,
                name: name || null,
            },
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = updatedUser;

        return NextResponse.json({
            message: "Профиль успешно обновлён",
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        );
    }
}
