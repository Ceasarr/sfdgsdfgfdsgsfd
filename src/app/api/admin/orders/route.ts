import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

function toOrderNumber(orderId: string) {
  return "RBX" + orderId.slice(-8).toUpperCase();
}

function normalizeStatus(status: string): "new" | "processing" | "completed" {
  switch (status) {
    case "new":
    case "pending":
    case "paid":
      return "new";
    case "processing":
      return "processing";
    case "completed":
    case "issued":
    case "delivered":
      return "completed";
    default:
      return "new";
  }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      include: {
        items: {
          select: { id: true, productId: true, productName: true, quantity: true, price: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const userIds = Array.from(
      new Set(orders.map((o) => o.userId).filter((id): id is string => typeof id === "string" && id.length > 0))
    );
    const productIds = Array.from(
      new Set(
        orders
          .flatMap((o) => o.items.map((i) => i.productId))
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      )
    );

    const [users, products] = await Promise.all([
      userIds.length
        ? prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true, role: true },
          })
        : Promise.resolve([]),
      productIds.length
        ? prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, slug: true, image: true, category: true, rarity: true },
          })
        : Promise.resolve([]),
    ]);

    const userById = new Map(users.map((u) => [u.id, u]));
    const productById = new Map(products.map((p) => [p.id, p]));

    const payload = orders.map((order) => ({
      id: order.id,
      orderNumber: toOrderNumber(order.id),
      userId: order.userId ?? null,
      user: order.userId ? userById.get(order.userId) ?? null : null,
      status: normalizeStatus(order.status),
      total: order.total,
      robloxUsername: order.robloxUsername,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => {
        const isRobux = item.productId.startsWith("robux-");
        const dbProduct = productById.get(item.productId);

        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          product: dbProduct ?? {
            id: item.productId,
            name: item.productName || (isRobux ? "Robux" : "Товар удалён"),
            slug: "",
            image: "",
            category: isRobux ? "Robux" : "unknown",
            rarity: "common",
          },
        };
      }),
    }));

    return NextResponse.json({ success: true, orders: payload });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json({ error: "Ошибка при загрузке заказов" }, { status: 500 });
  }
}

