import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public GET /api/robux
 * Returns active instant top-up items + gamepass rate
 */
export async function GET() {
    try {
        const [items, gamepassSetting] = await Promise.all([
            prisma.robuxItem.findMany({
                where: { active: true },
                orderBy: { amount: "asc" },
            }),
            prisma.setting.findUnique({ where: { key: "gamepass_rate" } }),
        ]);

        const gamepassRate = gamepassSetting ? parseFloat(gamepassSetting.value) : 0.9;

        return NextResponse.json({
            items,
            gamepassRate,
        });
    } catch (error) {
        console.error("Error fetching robux data:", error);
        return NextResponse.json(
            { error: "Не удалось загрузить данные" },
            { status: 500 }
        );
    }
}
