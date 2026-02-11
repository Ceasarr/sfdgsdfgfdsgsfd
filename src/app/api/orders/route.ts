import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { createPayment } from '@/lib/tochka';

// POST /api/orders - Create a new order
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { robloxUsername, items, promoCode } = body as {
      robloxUsername: string;
      items: { productId: string; quantity: number; productName?: string }[];
      promoCode?: string | null;
    };

    // Validate required fields
    if (!robloxUsername || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Не указаны обязательные поля (robloxUsername, items)' },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Каждый товар должен содержать productId и quantity > 0' },
          { status: 400 }
        );
      }
    }

    // Separate robux items from regular product items
    // Robux product IDs: "robux-instant-{amount}" or "robux-gamepass-{amount}"
    const robuxItems = items.filter((item) => item.productId.startsWith('robux-'));
    const regularItems = items.filter((item) => !item.productId.startsWith('robux-'));

    // Helper: parse amount from robux productId like "robux-instant-1000" or "robux-gamepass-500"
    function parseRobuxAmount(productId: string): { type: 'instant' | 'gamepass'; amount: number } | null {
      const instantMatch = productId.match(/^robux-instant-(\d+)$/);
      if (instantMatch) return { type: 'instant', amount: parseInt(instantMatch[1], 10) };

      const gamepassMatch = productId.match(/^robux-gamepass-(\d+)$/);
      if (gamepassMatch) return { type: 'gamepass', amount: parseInt(gamepassMatch[1], 10) };

      return null;
    }

    // Use a transaction to create order and update stock atomically
    // Increased timeout for remote DB (Render Frankfurt)
    const order = await prisma.$transaction(async (tx) => {
      // === Validate and get prices for regular products ===
      let serverTotal = 0;
      const regularProductPrices: Map<string, number> = new Map();

      for (const item of regularItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, stock: true, name: true, price: true },
        });

        if (!product) {
          throw new Error(`Товар не найден: ${item.productId}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Недостаточно товара "${product.name}" на складе`);
        }

        regularProductPrices.set(item.productId, product.price);
        serverTotal += product.price * item.quantity;
      }

      // === Get prices for robux items (server-side calculation) ===
      const robuxPrices: Map<string, number> = new Map();

      // Fetch gamepass rate from settings (needed for gamepass items)
      let gamepassRate = 0.9; // default fallback
      const hasGamepassItems = robuxItems.some((item) => item.productId.includes('-gamepass-'));
      if (hasGamepassItems) {
        const rateSetting = await tx.setting.findUnique({ where: { key: 'gamepass_rate' } });
        if (rateSetting) {
          gamepassRate = parseFloat(rateSetting.value);
        }
      }

      for (const item of robuxItems) {
        const parsed = parseRobuxAmount(item.productId);
        if (!parsed || isNaN(parsed.amount) || parsed.amount <= 0) {
          throw new Error(`Некорректный robux item: ${item.productId}`);
        }

        let itemPrice: number;

        if (parsed.type === 'instant') {
          // Instant items have fixed prices from RobuxItem table
          const robuxItem = await tx.robuxItem.findUnique({
            where: { amount: parsed.amount },
            select: { price: true, active: true },
          });

          if (!robuxItem || !robuxItem.active) {
            throw new Error(`Robux пакет ${parsed.amount} не найден или неактивен`);
          }
          itemPrice = robuxItem.price;
        } else {
          // Gamepass items: price = amount * gamepassRate (calculated server-side)
          if (parsed.amount < 1 || parsed.amount > 5000) {
            throw new Error(`Количество Robux через геймпасс должно быть от 1 до 5000`);
          }
          itemPrice = Math.round(parsed.amount * gamepassRate);
        }

        robuxPrices.set(item.productId, itemPrice);
        serverTotal += itemPrice * item.quantity;
      }

      // === Apply promo code discount ===
      let discountPercent = 0;
      if (promoCode) {
        const promo = await tx.promoCode.findUnique({
          where: { code: promoCode.toUpperCase().trim() },
        });

        if (promo && promo.active) {
          const notExpired = !promo.expiresAt || new Date(promo.expiresAt) >= new Date();
          const notExhausted = promo.maxUses === 0 || promo.usedCount < promo.maxUses;

          if (notExpired && notExhausted) {
            discountPercent = promo.discountPercent;

            // Increment usage count
            await tx.promoCode.update({
              where: { id: promo.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }
      }

      const discount = Math.round((serverTotal * discountPercent) / 100);
      const finalTotal = Math.max(0, serverTotal - discount);

      // === Create the order with server-calculated prices ===
      const allOrderItems = [
        ...regularItems.map((item) => ({
          productId: item.productId,
          productName: item.productName || null,
          quantity: item.quantity,
          price: regularProductPrices.get(item.productId) || 0,
        })),
        ...robuxItems.map((item) => ({
          productId: item.productId,
          productName: item.productName || item.productId,
          quantity: item.quantity,
          price: robuxPrices.get(item.productId) || 0,
        })),
      ];

      const newOrder = await tx.order.create({
        data: {
          userId: sessionUser.id,
          robloxUsername,
          total: finalTotal,
          status: 'new',
          items: {
            create: allOrderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Decrement stock for regular products only
      for (const item of regularItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    }, { timeout: 30000 }); // 30s timeout for remote DB

    // Generate a readable order number
    const orderNumber = 'RBX' + order.id.slice(-8).toUpperCase();

    // ── Create payment via Tochka Bank ────────────────────────────────────
    const itemsDescription = order.items
      .map((item) => item.productName || item.productId)
      .slice(0, 3)
      .join(', ');
    const purpose = `Заказ ${orderNumber}: ${itemsDescription}${order.items.length > 3 ? '...' : ''}`;

    const paymentResult = await createPayment({
      orderId: order.id,
      amount: order.total, // Amount in RUBLES (Tochka expects rubles)
      purpose: purpose.slice(0, 140), // Max 140 chars
    });

    if (paymentResult.success && paymentResult.paymentLink) {
      // Update order with payment info
      await prisma.order.update({
        where: { id: order.id },
        data: {
          operationId: paymentResult.operationId,
          paymentUrl: paymentResult.paymentLink,
          paymentStatus: 'pending',
        },
      });

      return NextResponse.json({
        success: true,
        order: {
          ...order,
          orderNumber,
        },
        paymentUrl: paymentResult.paymentLink,
        operationId: paymentResult.operationId,
      });
    }

    // Payment creation failed, but order is created
    // Return order without payment URL (user can retry payment later)
    console.error('Failed to create payment:', paymentResult.error);
    
    return NextResponse.json({
      success: true,
      order: {
        ...order,
        orderNumber,
      },
      paymentError: paymentResult.error || 'Ошибка создания платежа. Повторите позже.',
    });
  } catch (error) {
    console.error('Error creating order:', error);
    
    const message = error instanceof Error ? error.message : 'Ошибка при создании заказа';
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
