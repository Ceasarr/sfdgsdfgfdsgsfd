"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const checkedRef = useRef(false);

    useEffect(() => {
        // Гарантируем, что эффект срабатывает только один раз
        if (checkedRef.current) return;
        checkedRef.current = true;

        const stored = sessionStorage.getItem("lastOrderNumber");
        if (!stored) {
            // Нет номера заказа — значит пользователь зашёл напрямую
            router.replace("/");
            return;
        }
        setOrderNumber(stored);
        // Удаляем после прочтения, чтобы нельзя было перезагрузить повторно
        sessionStorage.removeItem("lastOrderNumber");
    }, [router]);

    if (!orderNumber) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md text-center">
                {/* Success icon */}
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                    <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Спасибо за покупку!</h1>
                <p className="text-muted-foreground mb-8">
                    Ваш заказ успешно оформлен и ожидает обработки
                </p>

                {/* Order number card */}
                <div className="rounded-2xl border border-border bg-card p-5 mb-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Номер заказа
                    </p>
                    <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        #{orderNumber}
                    </p>
                </div>

                {/* Telegram instruction card */}
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 mb-8 text-left">
                    <div className="flex gap-3.5">
                        <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 shadow-md shadow-blue-500/25">
                            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-blue-900 text-sm mb-1">
                                Как получить заказ
                            </h3>
                            <p className="text-sm text-blue-800 leading-relaxed">
                                Напишите нам в Telegram и отправьте номер заказа{" "}
                                <span className="font-bold">#{orderNumber}</span>.
                                Мы обработаем его и доставим товары на ваш аккаунт.
                            </p>
                            <a
                                href="https://t.me/robuxstore_support"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-3 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white shadow shadow-blue-500/20 transition-all hover:bg-blue-600 hover:shadow-lg active:scale-95"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                </svg>
                                Написать в Telegram
                            </a>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Link
                        href="/"
                        className="flex-1 flex items-center justify-center rounded-xl border border-border py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
                    >
                        На главную
                    </Link>
                    <Link
                        href="/account/orders"
                        className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-xl active:scale-[0.98]"
                    >
                        Мои заказы
                    </Link>
                </div>
            </div>
        </main>
    );
}
