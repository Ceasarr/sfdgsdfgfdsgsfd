import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

export async function GET() {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        // Count orders per user
        const orderCounts = await prisma.order.groupBy({
            by: ["userId"],
            _count: { id: true },
            _sum: { total: true },
        });

        const orderMap = new Map(
            orderCounts
                .filter((o): o is typeof o & { userId: string } => o.userId !== null)
                .map((o) => [o.userId, { count: o._count.id, totalSpent: o._sum.total ?? 0 }])
        );

        const payload = users.map((u) => {
            const stats = orderMap.get(u.id);
            return {
                ...u,
                createdAt: u.createdAt.toISOString(),
                ordersCount: stats?.count ?? 0,
                totalSpent: stats?.totalSpent ?? 0,
            };
        });

        return NextResponse.json({ success: true, customers: payload });
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json({ error: "Ошибка при загрузке клиентов" }, { status: 500 });
    }
}
