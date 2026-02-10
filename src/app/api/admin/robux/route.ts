import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

/* ── GET /api/admin/robux ─────────────────────────── */

export async function GET() {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
        }

        const [items, gamepassSetting] = await Promise.all([
            prisma.robuxItem.findMany({ orderBy: { amount: "asc" } }),
            prisma.setting.findUnique({ where: { key: "gamepass_rate" } }),
        ]);

        const gamepassRate = gamepassSetting ? parseFloat(gamepassSetting.value) : 0.9;

        return NextResponse.json({ success: true, items, gamepassRate });
    } catch (error) {
        console.error("Error fetching admin robux:", error);
        return NextResponse.json({ error: "Ошибка при загрузке" }, { status: 500 });
    }
}

/* ── PUT /api/admin/robux ─────────────────────────── */

interface RobuxItemPayload {
    id?: string;
    amount: number;
    price: number;
    active: boolean;
}

export async function PUT(req: NextRequest) {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
        }

        const body = await req.json();
        const { items, gamepassRate } = body as {
            items: RobuxItemPayload[];
            gamepassRate: number;
        };

        // Upsert each robux item
        const ops = items.map((item) =>
            prisma.robuxItem.upsert({
                where: { amount: item.amount },
                update: { price: item.price, active: item.active },
                create: { amount: item.amount, price: item.price, active: item.active },
            })
        );

        // Update gamepass rate
        ops.push(
            prisma.setting.upsert({
                where: { key: "gamepass_rate" },
                update: { value: String(gamepassRate) },
                create: { key: "gamepass_rate", value: String(gamepassRate) },
            }) as any
        );

        await prisma.$transaction(ops);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving robux settings:", error);
        return NextResponse.json({ error: "Ошибка при сохранении" }, { status: 500 });
    }
}

/* ── DELETE /api/admin/robux ───────────────────────── */

export async function DELETE(req: NextRequest) {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
        }

        const amount = req.nextUrl.searchParams.get("amount");

        if (!amount) {
            return NextResponse.json({ error: "Не указан amount" }, { status: 400 });
        }

        await prisma.robuxItem.delete({ where: { amount: parseInt(amount, 10) } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting robux item:", error);
        return NextResponse.json({ error: "Ошибка при удалении" }, { status: 500 });
    }
}
