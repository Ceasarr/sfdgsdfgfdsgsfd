import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
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
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Текущий и новый пароль обязательны" },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "Новый пароль должен быть не короче 6 символов" },
                { status: 400 }
            );
        }

        // Find user with password
        const user = await prisma.user.findUnique({
            where: { id: sessionUser.id },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Пользователь не найден" },
                { status: 404 }
            );
        }

        // Verify current password
        const passwordValid = await bcrypt.compare(currentPassword, user.password);

        if (!passwordValid) {
            return NextResponse.json(
                { error: "Неверный текущий пароль" },
                { status: 401 }
            );
        }

        // Hash new password (12 rounds for better security)
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await prisma.user.update({
            where: { id: sessionUser.id },
            data: { password: hashedPassword },
        });

        return NextResponse.json({
            message: "Пароль успешно изменён",
        });
    } catch (error) {
        console.error("Change password error:", error);
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        );
    }
}
