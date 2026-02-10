import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

/** Admin: get all banners */
export async function GET() {
    try {
        const admin = await getAdminUser();
        if (!admin) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

        const banners = await prisma.banner.findMany({ orderBy: { position: "asc" } });
        return NextResponse.json({ success: true, banners });
    } catch (error) {
        console.error("Error fetching banners:", error);
        return NextResponse.json({ error: "Ошибка при загрузке баннеров" }, { status: 500 });
    }
}

/**
 * Admin: upsert banners
 * Body: { banners: { position: number, image: string, link?: string }[] }
 */
export async function PUT(req: NextRequest) {
    try {
        const admin = await getAdminUser();
        if (!admin) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });

        const body = await req.json();
        const { banners } = body as {
            banners: { position: number; image: string; link?: string }[];
        };

        if (!Array.isArray(banners) || banners.length === 0) {
            return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
        }

        // Upsert each banner by position
        const results = await prisma.$transaction(
            banners
                .filter((b) => b.image) // skip empty slots
                .map((b) =>
                    prisma.banner.upsert({
                        where: { position: b.position },
                        update: { image: b.image, link: b.link || null },
                        create: { position: b.position, image: b.image, link: b.link || null },
                    })
                )
        );

        // Delete banners for positions with empty images
        const emptyPositions = banners.filter((b) => !b.image).map((b) => b.position);
        if (emptyPositions.length > 0) {
            await prisma.banner.deleteMany({ where: { position: { in: emptyPositions } } });
        }

        return NextResponse.json({ success: true, count: results.length });
    } catch (error) {
        console.error("Error saving banners:", error);
        return NextResponse.json({ error: "Ошибка при сохранении баннеров" }, { status: 500 });
    }
}
