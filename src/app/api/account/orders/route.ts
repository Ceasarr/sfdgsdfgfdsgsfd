import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

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

// GET /api/account/orders - Fetch orders for the current user
export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    // Fetch orders with items
    const orders = await prisma.order.findMany({
      where: { userId: sessionUser.id },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            quantity: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Batch-fetch all product details (fix N+1)
    const allProductIds = orders
      .flatMap((o) => o.items)
      .filter((i) => !i.productId.startsWith('robux-'))
      .map((i) => i.productId);

    const uniqueProductIds = [...new Set(allProductIds)];

    const products = uniqueProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: uniqueProductIds } },
          select: { id: true, name: true, slug: true, image: true, category: true, rarity: true },
        })
      : [];

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Map orders with product details
    const ordersWithProducts = orders.map((order) => ({
      ...order,
      status: normalizeStatus(order.status),
      orderNumber: 'RBX' + order.id.slice(-8).toUpperCase(),
      items: order.items.map((item) => {
        const isRobux = item.productId.startsWith('robux-');

        if (isRobux) {
          return {
            ...item,
            product: {
              id: item.productId,
              name: item.productName || 'Robux',
              slug: '',
              image: '',
              category: 'Robux',
              rarity: 'common',
            },
          };
        }

        const product = productMap.get(item.productId);
        return {
          ...item,
          product: product || {
            id: item.productId,
            name: item.productName || 'Товар удалён',
            slug: '',
            image: '',
            category: 'unknown',
            rarity: 'common',
          },
        };
      }),
    }));

    return NextResponse.json({
      success: true,
      orders: ordersWithProducts,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    
    return NextResponse.json(
      { error: 'Ошибка при загрузке заказов' },
      { status: 500 }
    );
  }
}
