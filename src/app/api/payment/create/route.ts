import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { createPayment } from "@/lib/tochka";

/**
 * POST /api/payment/create
 * Create a payment for an existing order (retry flow)
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

        const body = await req.json();
        const { orderId } = body as { orderId: string };

        if (!orderId) {
            return NextResponse.json(
                { error: "orderId обязателен" },
                { status: 400 }
            );
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) {
            return NextResponse.json(
                { error: "Заказ не найден" },
                { status: 404 }
            );
        }

        if (order.userId !== sessionUser.id) {
            return NextResponse.json(
                { error: "Доступ запрещён" },
                { status: 403 }
            );
        }

        if (order.paymentStatus === "paid") {
            return NextResponse.json(
                { error: "Заказ уже оплачен" },
                { status: 400 }
            );
        }

        // If order already has a valid payment URL, return it
        if (order.paymentUrl && order.paymentStatus === "pending") {
            return NextResponse.json({
                success: true,
                paymentUrl: order.paymentUrl,
                operationId: order.operationId,
            });
        }

        // Build description
        const itemsDescription = order.items
            .map((item) => item.productName || item.productId)
            .slice(0, 3)
            .join(", ");
        const orderNumber = "RBX" + order.id.slice(-8).toUpperCase();
        const purpose = `Заказ ${orderNumber}: ${itemsDescription}`.slice(0, 140);

        // Create payment via Tochka
        const result = await createPayment({
            orderId: order.id,
            amount: order.total, // Rubles
            purpose,
        });

        if (!result.success || !result.paymentLink) {
            return NextResponse.json(
                { error: result.error || "Ошибка создания платежа" },
                { status: 500 }
            );
        }

        // Update order
        await prisma.order.update({
            where: { id: orderId },
            data: {
                operationId: result.operationId,
                paymentUrl: result.paymentLink,
                paymentStatus: "pending",
            },
        });

        return NextResponse.json({
            success: true,
            paymentUrl: result.paymentLink,
            operationId: result.operationId,
        });
    } catch (error) {
        console.error("Error creating payment:", error);
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        );
    }
}
