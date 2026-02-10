import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
    try {
        await clearSessionCookie();
        return NextResponse.json({ message: "Выход выполнен" });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { error: "Ошибка при выходе" },
            { status: 500 }
        );
    }
}
