import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { createWebhook } from "@/lib/tochka";

/**
 * POST /api/setup/webhook
 * One-time webhook registration for Tochka Bank (admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) {
            return NextResponse.json(
                { error: "Необходима авторизация" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: sessionUser.id },
            select: { role: true },
        });

        if (user?.role !== "admin") {
            return NextResponse.json(
                { error: "Требуются права администратора" },
                { status: 403 }
            );
        }

        const body = await req.json().catch(() => ({}));
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://enotik.net";
        const webhookUrl =
            (body as { webhookUrl?: string }).webhookUrl ||
            `${baseUrl}/api/payment/webhook`;

        console.log(`[Setup] Registering Tochka webhook: ${webhookUrl}`);

        const result = await createWebhook(webhookUrl, ["acquiringInternetPayment"]);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Ошибка настройки вебхука" },
                { status: 500 }
            );
        }

        // Remember the URL
        await prisma.setting.upsert({
            where: { key: "tochka_webhook_url" },
            update: { value: webhookUrl },
            create: { key: "tochka_webhook_url", value: webhookUrl },
        });

        return NextResponse.json({
            success: true,
            webhookUrl,
            message: "Вебхук зарегистрирован",
        });
    } catch (error) {
        console.error("Error setting up webhook:", error);
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        );
    }
}

export async function GET() {
    const setting = await prisma.setting.findUnique({
        where: { key: "tochka_webhook_url" },
    });

    return NextResponse.json({
        configured: !!setting,
        webhookUrl: setting?.value || null,
    });
}
