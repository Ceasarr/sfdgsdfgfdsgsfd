import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getPaymentInfo } from "@/lib/tochka";

/**
 * GET /api/payment/status?orderId=xxx
 * Check payment status for an order
 */
export async function GET(req: NextRequest) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) {
            return NextResponse.json(
                { error: "Необходима авторизация" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get("orderId");

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

        // Verify ownership (unless admin)
        const user = await prisma.user.findUnique({
            where: { id: sessionUser.id },
            select: { role: true },
        });

        if (order.userId !== sessionUser.id && user?.role !== "admin") {
            return NextResponse.json(
                { error: "Доступ запрещён" },
                { status: 403 }
            );
        }

        // If we have an operationId, check Tochka for fresh status
        let tochkaStatus: string | null = null;
        if (order.operationId) {
            const info = await getPaymentInfo(order.operationId);
            if (info) {
                tochkaStatus = info.status;

                // Sync: if Tochka says APPROVED/AUTHORIZED but we still show pending
                let newPaymentStatus = order.paymentStatus;
                if (
                    (info.status === "APPROVED" || info.status === "AUTHORIZED") &&
                    order.paymentStatus !== "paid"
                ) {
                    newPaymentStatus = "paid";
                } else if (info.status === "DECLINED" && order.paymentStatus !== "failed") {
                    newPaymentStatus = "failed";
                } else if (info.status === "REFUNDED" && order.paymentStatus !== "refunded") {
                    newPaymentStatus = "refunded";
                }

                if (newPaymentStatus !== order.paymentStatus) {
                    await prisma.order.update({
                        where: { id: orderId },
                        data: { paymentStatus: newPaymentStatus },
                    });
                    order.paymentStatus = newPaymentStatus;
                }
            }
        }

        return NextResponse.json({
            orderId: order.id,
            paymentStatus: order.paymentStatus,
            orderStatus: order.status,
            operationId: order.operationId,
            total: order.total,
            tochkaStatus,
        });
    } catch (error) {
        console.error("Error checking payment status:", error);
        return NextResponse.json(
            { error: "Внутренняя ошибка сервера" },
            { status: 500 }
        );
    }
}
