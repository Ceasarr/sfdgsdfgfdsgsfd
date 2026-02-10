import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

/* ── helpers ──────────────────────────────────────── */

function daysAgo(n: number): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return d;
}

/** Today 00:00 Moscow time (UTC+3) using Intl */
function todayMoscowMidnight(): Date {
    // Format current date in Moscow timezone to get the Moscow "today"
    const mskDateStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Moscow",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date()); // "YYYY-MM-DD"
    // Parse as midnight Moscow, then convert to UTC
    // Midnight MSK = 21:00 UTC previous day
    const midnightMsk = new Date(mskDateStr + "T00:00:00+03:00");
    return midnightMsk;
}

function toDateKey(d: Date): string {
    return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function formatDateLabel(key: string): string {
    const d = new Date(key);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

/* ── GET /api/admin/dashboard ─────────────────────── */

export async function GET(req: NextRequest) {
    try {
        const admin = await getAdminUser();
        if (!admin) {
            return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
        }

        const range = req.nextUrl.searchParams.get("range") || "30d";

        // Compute date ranges
        let days: number;
        let periodStart: Date;
        let prevPeriodStart: Date;

        if (range === "today") {
            days = 1;
            periodStart = todayMoscowMidnight();
            prevPeriodStart = new Date(periodStart.getTime() - 24 * 60 * 60 * 1000);
        } else {
            const daysMap: Record<string, number> = { "3d": 3, "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
            days = daysMap[range] ?? 30;
            periodStart = daysAgo(days);
            prevPeriodStart = daysAgo(days * 2);
        }

        // Fetch all data in parallel
        const [
            allOrders,
            totalUsers,
            totalProducts,
            usersInPeriod,
            usersInPrevPeriod,
        ] = await Promise.all([
            prisma.order.findMany({
                where: { createdAt: { gte: prevPeriodStart } },
                include: {
                    items: {
                        select: { productId: true, quantity: true, price: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.user.count(),
            prisma.product.count(),
            prisma.user.count({ where: { createdAt: { gte: periodStart } } }),
            prisma.user.count({ where: { createdAt: { gte: prevPeriodStart, lt: periodStart } } }),
        ]);

        // Split orders into current & previous period
        const currentOrders = allOrders.filter((o) => o.createdAt >= periodStart);
        const prevOrders = allOrders.filter((o) => o.createdAt >= prevPeriodStart && o.createdAt < periodStart);

        // === KEY METRICS ===
        const totalRevenue = currentOrders.reduce((s, o) => s + o.total, 0);
        const prevRevenue = prevOrders.reduce((s, o) => s + o.total, 0);
        const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

        const totalOrdersCount = currentOrders.length;
        const prevOrdersCount = prevOrders.length;
        const ordersChange = prevOrdersCount > 0 ? ((totalOrdersCount - prevOrdersCount) / prevOrdersCount) * 100 : 0;

        const customersChange = usersInPrevPeriod > 0 ? ((usersInPeriod - usersInPrevPeriod) / usersInPrevPeriod) * 100 : 0;

        const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
        const prevAvgOrder = prevOrdersCount > 0 ? Math.round(prevRevenue / prevOrdersCount) : 0;
        const avgOrderChange = prevAvgOrder > 0 ? ((avgOrderValue - prevAvgOrder) / prevAvgOrder) * 100 : 0;

        // === REVENUE CHART (daily) ===
        const revenueByDay: Record<string, number> = {};
        const ordersByDay: Record<string, number> = {};
        for (let i = days - 1; i >= 0; i--) {
            const key = toDateKey(daysAgo(i));
            revenueByDay[key] = 0;
            ordersByDay[key] = 0;
        }
        for (const o of currentOrders) {
            const key = toDateKey(o.createdAt);
            if (key in revenueByDay) {
                revenueByDay[key] += o.total;
                ordersByDay[key] += 1;
            }
        }

        // Decide how to bucket based on range
        let chartLabels: string[] = [];
        let chartRevenue: number[] = [];
        let chartOrders: number[] = [];

        if (days <= 30) {
            // Daily
            chartLabels = Object.keys(revenueByDay).map(formatDateLabel);
            chartRevenue = Object.values(revenueByDay);
            chartOrders = Object.values(ordersByDay);
        } else {
            // Weekly buckets
            const keys = Object.keys(revenueByDay);
            const bucketSize = 7;
            for (let i = 0; i < keys.length; i += bucketSize) {
                const chunk = keys.slice(i, i + bucketSize);
                chartLabels.push(formatDateLabel(chunk[0]));
                chartRevenue.push(chunk.reduce((s, k) => s + (revenueByDay[k] || 0), 0));
                chartOrders.push(chunk.reduce((s, k) => s + (ordersByDay[k] || 0), 0));
            }
        }

        // === ORDERS BY STATUS ===
        const statusCounts: Record<string, number> = { new: 0, processing: 0, completed: 0 };
        for (const o of currentOrders) {
            const s = o.status === "completed" || o.status === "issued" || o.status === "delivered"
                ? "completed"
                : o.status === "processing"
                    ? "processing"
                    : "new";
            statusCounts[s] = (statusCounts[s] || 0) + 1;
        }

        // === TOP PRODUCTS ===
        const productSales: Record<string, { productId: string; quantity: number; revenue: number }> = {};
        for (const o of currentOrders) {
            for (const item of o.items) {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = { productId: item.productId, quantity: 0, revenue: 0 };
                }
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += item.price * item.quantity;
            }
        }

        const topProductIds = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const pIds = topProductIds.map((p) => p.productId);
        const productsInfo = pIds.length > 0
            ? await prisma.product.findMany({ where: { id: { in: pIds } }, select: { id: true, name: true, image: true, category: true } })
            : [];
        const prodMap = new Map(productsInfo.map((p) => [p.id, p]));

        const topProducts = topProductIds.map((ps) => {
            const info = prodMap.get(ps.productId);
            return {
                name: info?.name ?? "Товар удалён",
                image: info?.image ?? "",
                category: info?.category ?? "unknown",
                sales: ps.quantity,
                revenue: ps.revenue,
            };
        });

        // === RECENT ORDERS ===
        const recentOrders = currentOrders.slice(0, 8);
        const recentUserIds = [...new Set(recentOrders.map((o) => o.userId).filter(Boolean))] as string[];
        const recentUsers = recentUserIds.length > 0
            ? await prisma.user.findMany({ where: { id: { in: recentUserIds } }, select: { id: true, name: true, email: true } })
            : [];
        const userMap = new Map(recentUsers.map((u) => [u.id, u]));

        const recentActivity = recentOrders.map((o) => {
            const u = o.userId ? userMap.get(o.userId) : null;
            return {
                id: o.id,
                customer: u?.email ?? o.robloxUsername,
                robloxUsername: o.robloxUsername,
                amount: o.total,
                status: o.status,
                date: o.createdAt.toISOString(),
                itemCount: o.items.length,
            };
        });

        // === SALES BY CATEGORY ===
        const categorySales: Record<string, { count: number; revenue: number }> = {};
        for (const o of currentOrders) {
            for (const item of o.items) {
                const info = prodMap.get(item.productId);
                const cat = info?.category ?? "other";
                if (!categorySales[cat]) categorySales[cat] = { count: 0, revenue: 0 };
                categorySales[cat].count += item.quantity;
                categorySales[cat].revenue += item.price * item.quantity;
            }
        }
        const totalCategorySales = Object.values(categorySales).reduce((s, c) => s + c.count, 0) || 1;
        const salesByCategory = Object.entries(categorySales).map(([cat, data]) => ({
            category: cat,
            count: data.count,
            revenue: data.revenue,
            percentage: Math.round((data.count / totalCategorySales) * 100),
        })).sort((a, b) => b.revenue - a.revenue);

        return NextResponse.json({
            success: true,
            stats: {
                totalRevenue,
                revenueChange: Math.round(revenueChange * 10) / 10,
                totalOrders: totalOrdersCount,
                ordersChange: Math.round(ordersChange * 10) / 10,
                totalCustomers: totalUsers,
                newCustomers: usersInPeriod,
                customersChange: Math.round(customersChange * 10) / 10,
                avgOrderValue,
                avgOrderChange: Math.round(avgOrderChange * 10) / 10,
                totalProducts,
            },
            chart: {
                labels: chartLabels,
                revenue: chartRevenue,
                orders: chartOrders,
            },
            statusCounts,
            topProducts,
            recentActivity,
            salesByCategory,
        });
    } catch (error) {
        console.error("Error in dashboard API:", error);
        return NextResponse.json({ error: "Ошибка при загрузке дашборда" }, { status: 500 });
    }
}
