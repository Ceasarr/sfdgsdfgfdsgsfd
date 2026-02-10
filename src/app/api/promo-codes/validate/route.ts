import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/promo-codes/validate
 * Body: { code: string }
 * Returns the promo code if valid, or an error message.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code } = body as { code: string };

        if (!code || !code.trim()) {
            return NextResponse.json({ error: "Введите промокод" }, { status: 400 });
        }

        const promo = await prisma.promoCode.findUnique({
            where: { code: code.toUpperCase().trim() },
        });

        if (!promo) {
            return NextResponse.json({ error: "Промокод не найден" }, { status: 404 });
        }

        if (!promo.active) {
            return NextResponse.json({ error: "Промокод неактивен" }, { status: 400 });
        }

        // Check expiry
        if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
            return NextResponse.json({ error: "Срок действия промокода истёк" }, { status: 400 });
        }

        // Check usage limit
        if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
            return NextResponse.json({ error: "Промокод уже исчерпан" }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            promo: {
                id: promo.id,
                code: promo.code,
                discountPercent: promo.discountPercent,
            },
        });
    } catch (error) {
        console.error("Error validating promo code:", error);
        return NextResponse.json({ error: "Ошибка при проверке промокода" }, { status: 500 });
    }
}
