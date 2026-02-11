"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCw, Home, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CheckoutFailPage() {
    const router = useRouter();
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const checkedRef = useRef(false);

    useEffect(() => {
        if (checkedRef.current) return;
        checkedRef.current = true;

        // Get order info from sessionStorage
        const storedNumber = sessionStorage.getItem("lastOrderNumber");
        const storedId = sessionStorage.getItem("lastOrderId");

        if (storedNumber) {
            setOrderNumber(storedNumber);
        }
        if (storedId) {
            setOrderId(storedId);
        }
    }, []);

    const handleRetryPayment = async () => {
        if (!orderId) {
            router.push("/");
            return;
        }

        setIsRetrying(true);

        try {
            const response = await fetch("/api/payment/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
            });

            const result = await response.json();

            if (result.paymentUrl) {
                window.location.href = result.paymentUrl;
            } else {
                throw new Error(result.error || "Не удалось создать платёж");
            }
        } catch (error) {
            console.error("Retry payment error:", error);
            setIsRetrying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center">
                <div className="mb-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Оплата не прошла
                    </h1>
                    <p className="text-gray-600">
                        К сожалению, платёж не был завершён. Вы можете попробовать оплатить снова.
                    </p>
                </div>

                {orderNumber && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-500 mb-1">Номер заказа</p>
                        <p className="text-lg font-mono font-semibold">{orderNumber}</p>
                    </div>
                )}

                <div className="space-y-3">
                    {orderId && (
                        <Button
                            onClick={handleRetryPayment}
                            disabled={isRetrying}
                            className="w-full"
                        >
                            {isRetrying ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Создание платежа...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Попробовать снова
                                </>
                            )}
                        </Button>
                    )}

                    <Link href="/account" className="block">
                        <Button variant="outline" className="w-full">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Мои заказы
                        </Button>
                    </Link>

                    <Link href="/" className="block">
                        <Button variant="ghost" className="w-full">
                            <Home className="w-4 h-4 mr-2" />
                            На главную
                        </Button>
                    </Link>
                </div>

                <p className="mt-6 text-xs text-gray-500">
                    Если проблема повторяется, свяжитесь с поддержкой
                </p>
            </Card>
        </div>
    );
}
