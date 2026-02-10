import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

/* ── GET — list all promo codes ───────────────────── */

export async function GET() {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
        }

        const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
        return NextResponse.json({ success: true, codes });
    } catch (error) {
        console.error("Error fetching promo codes:", error);
        return NextResponse.json({ error: "Ошибка при загрузке" }, { status: 500 });
    }
}

/* ── POST — create promo code ─────────────────────── */

export async function POST(req: NextRequest) {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
        }

        const body = await req.json();
        const { code, discountPercent, maxUses, expiresAt, active } = body as {
            code: string;
            discountPercent: number;
            maxUses: number;
            expiresAt: string | null;
            active: boolean;
        };

        if (!code || !discountPercent) {
            return NextResponse.json({ error: "Код и скидка обязательны" }, { status: 400 });
        }

        // Check uniqueness
        const existing = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
        if (existing) {
            return NextResponse.json({ error: "Промокод с таким кодом уже существует" }, { status: 409 });
        }

        const created = await prisma.promoCode.create({
            data: {
                code: code.toUpperCase(),
                discountPercent,
                maxUses: maxUses || 0,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                active: active ?? true,
            },
        });

        return NextResponse.json({ success: true, promo: created }, { status: 201 });
    } catch (error) {
        console.error("Error creating promo code:", error);
        return NextResponse.json({ error: "Ошибка при создании" }, { status: 500 });
    }
}

/* ── PUT — update promo code ──────────────────────── */

export async function PUT(req: NextRequest) {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
        }

        const body = await req.json();
        const { id, code, discountPercent, maxUses, expiresAt, active } = body as {
            id: string;
            code: string;
            discountPercent: number;
            maxUses: number;
            expiresAt: string | null;
            active: boolean;
        };

        if (!id) {
            return NextResponse.json({ error: "ID промокода обязателен" }, { status: 400 });
        }

        // Check code uniqueness (excluding self)
        if (code) {
            const existing = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
            if (existing && existing.id !== id) {
                return NextResponse.json({ error: "Промокод с таким кодом уже существует" }, { status: 409 });
            }
        }

        const updated = await prisma.promoCode.update({
            where: { id },
            data: {
                ...(code && { code: code.toUpperCase() }),
                ...(discountPercent !== undefined && { discountPercent }),
                ...(maxUses !== undefined && { maxUses }),
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                ...(active !== undefined && { active }),
            },
        });

        return NextResponse.json({ success: true, promo: updated });
    } catch (error) {
        console.error("Error updating promo code:", error);
        return NextResponse.json({ error: "Ошибка при обновлении" }, { status: 500 });
    }
}

/* ── DELETE — remove promo code ───────────────────── */

export async function DELETE(req: NextRequest) {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
        }

        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "ID промокода обязателен" }, { status: 400 });
        }

        await prisma.promoCode.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting promo code:", error);
        return NextResponse.json({ error: "Ошибка при удалении" }, { status: 500 });
    }
}
