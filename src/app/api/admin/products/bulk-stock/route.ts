import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

/**
 * POST /api/admin/products/bulk-stock
 * Body: { productIds: string[], quantity: number }
 * Increments stock for every listed product by `quantity`.
 */
export async function POST(request: Request) {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
        }

        const body = await request.json();
        const { productIds, quantity } = body as {
            productIds: string[];
            quantity: number;
        };

        if (
            !Array.isArray(productIds) ||
            productIds.length === 0 ||
            typeof quantity !== "number" ||
            quantity <= 0
        ) {
            return NextResponse.json(
                { error: "Некорректные данные. Укажите товары и количество > 0." },
                { status: 400 }
            );
        }

        // Atomic batch update inside a transaction
        const result = await prisma.$transaction(
            productIds.map((id) =>
                prisma.product.update({
                    where: { id },
                    data: { stock: { increment: quantity } },
                })
            )
        );

        return NextResponse.json({
            message: `Остатки обновлены для ${result.length} товаров (+${quantity})`,
            updated: result.length,
        });
    } catch (error) {
        console.error("Error bulk-updating stock:", error);
        return NextResponse.json(
            { error: "Не удалось обновить остатки" },
            { status: 500 }
        );
    }
}
