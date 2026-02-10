"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { useAuth } from "@/components/ui/auth-context";
import { useToast } from "@/components/ui/toast-context";
import { useRouter } from "next/navigation";
import { ShoppingCart, Sparkles } from "@/components/icons";
import type { Product } from "@/types";

/* ── helpers ──────────────────────────────────────── */

function formatPrice(price: number) {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", minimumFractionDigits: 0 }).format(price);
}

/* ── virtual product builders ─────────────────────── */

function makeInstantProduct(amount: number, price: number): Product {
    return {
        id: `robux-instant-${amount}`,
        slug: `robux-instant-${amount}`,
        name: `${amount} Robux (цифровой код)`,
        description: `Пополнение ${amount} Robux через цифровой код на ваш аккаунт Roblox.`,
        price,
        rarity: "common",
        category: "Robux",
        stock: 9999,
        image: "",
        createdAt: new Date(),
    };
}

function makeGamepassProduct(amount: number, rate: number): Product {
    return {
        id: `robux-gamepass-${amount}`,
        slug: `robux-gamepass-${amount}`,
        name: `${amount} Robux (геймпасс)`,
        description: `Пополнение ${amount} Robux через геймпасс.`,
        price: Math.round(amount * rate),
        rarity: "common",
        category: "Robux",
        stock: 9999,
        image: "",
        createdAt: new Date(),
    };
}

/* ── types ────────────────────────────────────────── */

interface RobuxItemData {
    id: string;
    amount: number;
    price: number;
    active: boolean;
}

type Tab = "instant" | "gamepass";

/* ── Instant Robux section ───────────────────────── */

function InstantSection({
    items,
    onAdd,
    variant,
}: {
    items: RobuxItemData[];
    onAdd: (amount: number, price: number) => void;
    variant: "mobile" | "desktop";
}) {
    if (variant === "desktop") {
        return (
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Пополнение через цифровой код</h2>
                        <p className="text-xs text-muted-foreground">Получите цифровой код для активации Robux</p>
                    </div>
                </div>

                {items.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-10">Позиции временно недоступны</p>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                                <div
                                    key={item.amount}
                                    className="group flex items-center justify-between rounded-xl border border-border bg-background p-4 transition-all hover:border-purple-200 hover:shadow-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 text-xl font-bold transition-transform group-hover:scale-110">
                                            💎
                                        </div>
                                        <p className="font-bold text-base">{item.amount.toLocaleString("ru-RU")} Robux</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-foreground">{formatPrice(item.price)}</span>
                                        <button
                                            onClick={() => onAdd(item.amount, item.price)}
                                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow shadow-purple-500/20 transition-all hover:shadow-lg hover:shadow-purple-500/30 active:scale-95"
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                            В корзину
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </section>
        );
    }

    /* Mobile variant */
    return (
        <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 rounded-xl bg-yellow-50 border border-yellow-200/60 px-3.5 py-2.5 mb-1">
                <Sparkles className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <p className="text-xs text-yellow-700">Получите цифровой код для активации Robux на вашем аккаунте</p>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-sm text-muted-foreground">Позиции временно недоступны</p>
                </div>
            ) : (
                items.map((item) => (
                        <button
                            key={item.amount}
                            onClick={() => onAdd(item.amount, item.price)}
                            className="group w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 transition-all hover:border-purple-200 hover:shadow-md active:scale-[0.98]"
                        >
                            <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 text-lg transition-transform group-hover:scale-110">
                                💎
                            </div>
                            <p className="flex-1 text-left font-bold text-sm text-foreground">{item.amount.toLocaleString("ru-RU")} Robux</p>
                            <div className="flex items-center gap-2.5 flex-shrink-0">
                                <span className="text-sm font-bold text-foreground">{formatPrice(item.price)}</span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow shadow-purple-500/20 transition-all group-hover:shadow-lg group-hover:shadow-purple-500/30">
                                    <ShoppingCart className="h-4 w-4" />
                                </div>
                            </div>
                        </button>
                    ))
            )}
        </div>
    );
}

/* ── Gamepass section ─────────────────────────────── */

function GamepassSection({
    gpValue,
    gpInput,
    gamepassRate,
    onSliderChange,
    onInputChange,
    onInputBlur,
    onAddToCart,
    variant,
}: {
    gpValue: number;
    gpInput: string;
    gamepassRate: number;
    onSliderChange: (val: number) => void;
    onInputChange: (raw: string) => void;
    onInputBlur: () => void;
    onAddToCart: () => void;
    variant: "mobile" | "desktop";
}) {
    const sliderInput = (
        <input
            type="range"
            min={1}
            max={5000}
            step={1}
            value={gpValue}
            onChange={(e) => onSliderChange(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 accent-purple-600
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-purple-600 [&::-webkit-slider-thumb]:to-pink-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-purple-500/30 [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-purple-600 [&::-moz-range-thumb]:to-pink-600 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
        />
    );

    const manualInput = (
        <div className="relative">
            <input
                type="number"
                min={1}
                max={5000}
                value={gpInput}
                onChange={(e) => onInputChange(e.target.value)}
                onBlur={onInputBlur}
                className="w-full rounded-xl border border-border bg-background pl-4 pr-14 py-3 text-lg font-bold focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">R$</span>
        </div>
    );

    const valueDisplay = (
        <div className="text-center py-6 rounded-xl bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border border-purple-100">
            <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-1">Вы получите</p>
            <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {gpValue.toLocaleString("ru-RU")}
                </span>
                <span className="text-lg font-bold text-purple-400">R$</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
                за <span className="font-bold text-foreground">{formatPrice(Math.round(gpValue * gamepassRate))}</span>
            </p>
        </div>
    );

    const rateInfo = (
        <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Стоимость за 1 R$</span>
            <span className="font-bold text-green-600">{gamepassRate.toFixed(2)} ₽</span>
        </div>
    );

    const cartButton = (
        <button
            onClick={onAddToCart}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-xl hover:shadow-purple-500/30 active:scale-[0.98]"
        >
            <ShoppingCart className="h-5 w-5" />
            Добавить в корзину — {formatPrice(Math.round(gpValue * gamepassRate))}
        </button>
    );

    if (variant === "desktop") {
        return (
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                        <span className="text-lg font-bold">🎮</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Пополнение геймпассом</h2>
                        <p className="text-xs text-muted-foreground">Выгоднее — укажите любое количество</p>
                    </div>
                </div>

                <div className="mb-8">{valueDisplay}</div>

                <div className="mb-6">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>1 R$</span>
                        <span>5 000 R$</span>
                    </div>
                    {sliderInput}
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Или введите вручную</label>
                    {manualInput}
                </div>

                <div className="mb-6">{rateInfo}</div>
                {cartButton}
            </section>
        );
    }

    /* Mobile variant */
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2.5 rounded-xl bg-green-50 border border-green-200/60 px-3.5 py-2.5">
                <span className="text-base leading-none flex-shrink-0">🎮</span>
                <p className="text-xs text-green-700">Выгоднее — укажите любое количество. Зачисление через геймпасс</p>
            </div>

            <div className="rounded-2xl p-5">{valueDisplay}</div>

            <div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2 px-0.5">
                    <span>1 R$</span>
                    <span>5 000 R$</span>
                </div>
                {sliderInput}
            </div>

            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Или введите вручную</label>
                {manualInput}
            </div>

            {rateInfo}
            {cartButton}
        </div>
    );
}

/* ── main page component ─────────────────────────── */

export default function RobuxPage() {
    const addItem = useCartStore((s) => s.addItem);
    const { isAuthenticated } = useAuth();
    const { addToast } = useToast();
    const router = useRouter();

    const [items, setItems] = useState<RobuxItemData[]>([]);
    const [gamepassRate, setGamepassRate] = useState(0.9);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("instant");

    const [gpValue, setGpValue] = useState(1000);
    const [gpInput, setGpInput] = useState("1000");

    /* ── fetch data from API ──────────────────── */
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/robux");
                if (!res.ok) throw new Error();
                const data = await res.json();
                setItems(data.items ?? []);
                setGamepassRate(data.gamepassRate ?? 0.9);
            } catch {
                console.error("Failed to load robux data");
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    /* ── handlers ─────────────────────────────── */

    const handleAddInstant = (amount: number, price: number) => {
        if (!isAuthenticated) {
            addToast("Войдите в аккаунт, чтобы добавлять товары в корзину", "info");
            router.push("/login");
            return;
        }
        const product = makeInstantProduct(amount, price);
        const result = addItem(product);
        if (result.success) {
            addToast(`${amount} Robux (цифровой код) добавлено в корзину`, "cart");
        } else {
            addToast(result.message || "Не удалось добавить", "error");
        }
    };

    const handleAddGamepass = () => {
        if (!isAuthenticated) {
            addToast("Войдите в аккаунт, чтобы добавлять товары в корзину", "info");
            router.push("/login");
            return;
        }
        if (gpValue < 1 || gpValue > 5000) {
            addToast("Укажите значение от 1 до 5 000 Robux", "error");
            return;
        }
        const product = makeGamepassProduct(gpValue, gamepassRate);
        const result = addItem(product);
        if (result.success) {
            addToast(`${gpValue} Robux (геймпасс) добавлено в корзину`, "cart");
        } else {
            addToast(result.message || "Не удалось добавить", "error");
        }
    };

    const handleSliderChange = (val: number) => {
        setGpValue(val);
        setGpInput(String(val));
    };

    const handleInputChange = (raw: string) => {
        setGpInput(raw);
        const n = parseInt(raw, 10);
        if (!isNaN(n) && n >= 1 && n <= 5000) {
            setGpValue(n);
        }
    };

    const handleInputBlur = () => {
        const n = parseInt(gpInput, 10);
        if (isNaN(n) || n < 1) {
            setGpValue(1);
            setGpInput("1");
        } else if (n > 5000) {
            setGpValue(5000);
            setGpInput("5000");
        } else {
            setGpValue(n);
            setGpInput(String(n));
        }
    };

    const gamepassProps = {
        gpValue,
        gpInput,
        gamepassRate,
        onSliderChange: handleSliderChange,
        onInputChange: handleInputChange,
        onInputBlur: handleInputBlur,
        onAddToCart: handleAddGamepass,
    };

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-12 max-w-6xl">
                {/* ── Header ─────────────────────────────── */}
                <div className="text-center mb-5 sm:mb-10">
                    <div className="inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25 mb-3 sm:mb-5">
                        <span className="text-xl sm:text-2xl">💎</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
                        Купить{" "}
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Robux
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
                        Выберите способ пополнения — цифровой код или через геймпасс по выгодной цене
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-8 w-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* ══════ MOBILE: tab-based layout ══════ */}
                        <div className="lg:hidden max-w-2xl mx-auto">
                            {/* Tab switcher */}
                            <div className="flex rounded-2xl bg-muted/60 p-1 mb-5 border border-border/50">
                                <button
                                    onClick={() => setActiveTab("instant")}
                                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                                        activeTab === "instant"
                                            ? "bg-white text-foreground shadow-sm shadow-black/5"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Цифровой код
                                </button>
                                <button
                                    onClick={() => setActiveTab("gamepass")}
                                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                                        activeTab === "gamepass"
                                            ? "bg-white text-foreground shadow-sm shadow-black/5"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <span className="text-base leading-none">🎮</span>
                                    Геймпасс
                                </button>
                            </div>

                            {/* Tab content */}
                            {activeTab === "instant" ? (
                                <InstantSection items={items} onAdd={handleAddInstant} variant="mobile" />
                            ) : (
                                <GamepassSection {...gamepassProps} variant="mobile" />
                            )}
                        </div>

                        {/* ══════ DESKTOP: two-column layout ══════ */}
                        <div className="hidden lg:grid grid-cols-2 gap-8">
                            <InstantSection items={items} onAdd={handleAddInstant} variant="desktop" />
                            <GamepassSection {...gamepassProps} variant="desktop" />
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
