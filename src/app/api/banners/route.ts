import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public: returns banner images ordered by position */
export async function GET() {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: { position: "asc" },
        });

        return NextResponse.json(banners);
    } catch (error) {
        console.error("Error fetching banners:", error);
        return NextResponse.json([], { status: 200 });
    }
}
