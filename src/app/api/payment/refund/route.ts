import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { refundPayment } from "@/lib/tochka";

/**
 * POST /api/payment/refund
 * Refund a payment (admin only)
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

        // Admin check
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

        const body = await req.json();
        const { orderId, amount } = body as {
            orderId: string;
            amount?: number; // Optional: partial refund in rubles
        };

        if (!orderId) {
            return NextResponse.json(
                { error: "orderId обязателен" },
                { status: 400 }
            );
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json(
                { error: "Заказ не найден" },
                { status: 404 }
            );
        }

        if (order.paymentStatus !== "paid") {
            return NextResponse.json(
                { error: "Можно вернуть только оплаченные заказы" },
                { status: 400 }
            );
        }

        if (!order.operationId) {
            return NextResponse.json(
                { error: "Нет данных о платеже для возврата" },
                { status: 400 }
            );
        }

        // Call Tochka refund API (amount in rubles, or undefined for full)
        const result = await refundPayment(order.operationId, amount);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Ошибка возврата платежа" },
                { status: 500 }
            );
        }

        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: "refunded",
                status: "refunded",
            },
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            message: "Платёж возвращён",
        });
    } catch (error) {
        console.error("Error refunding payment:", error);
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        );
    }
}
