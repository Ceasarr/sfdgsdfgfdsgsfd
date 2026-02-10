import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

const ALLOWED_STATUSES = new Set(["new", "processing", "completed"]);

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json().catch(() => null);
    const status = body?.status as string | undefined;

    if (!status || !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "Некорректный статус заказа" },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Ошибка при обновлении статуса" }, { status: 500 });
  }
}

