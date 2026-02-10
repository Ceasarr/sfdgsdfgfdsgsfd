"use client";

import { X, Minus, Plus, ShoppingBag, Trash, ShoppingCart } from "./icons";
import { useCartStore } from "@/store/cart-store";
import { formatPrice, getRarityColor } from "@/lib/utils";
import { useToast } from "@/components/ui/toast-context";
import Link from "next/link";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const items = useCartStore((state) => state.items);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const getSubtotal = useCartStore((state) => state.getSubtotal);
    const getItemCount = useCartStore((state) => state.getItemCount);
    const { addToast } = useToast();

    if (!isOpen) return null;

    const totalItems = getItemCount();
    const subtotal = getSubtotal();

    // Calculate total savings from discounted items
    const totalSavings = items.reduce((acc, item) => {
        if (item.product.oldPrice) {
            return acc + (item.product.oldPrice - item.product.price) * item.quantity;
        }
        return acc;
    }, 0);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 backdrop-animate"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className="drawer-right fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col"
                style={{ boxShadow: "-12px 0 48px rgba(0,0,0,0.18)" }}
            >
                {/* ─── Header ─── */}
                <div
                    className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-600 to-pink-600 px-5 py-5 sm:px-6 sm:py-6"
                >
                    {/* Decorative orbs */}
                    <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-pink-400/20 blur-2xl" />

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                                <ShoppingBag className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white leading-tight">Корзина</h2>
                                <p className="text-white/70 text-xs mt-0.5">
                                    {totalItems === 0
                                        ? "Пока пуста"
                                        : `${totalItems} ${totalItems === 1 ? "товар" : totalItems < 5 ? "товара" : "товаров"}`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm transition-colors hover:bg-white/25 active:scale-90"
                        >
                            <X className="h-4.5 w-4.5 text-white" />
                        </button>
                    </div>
                </div>

                {/* ─── Body ─── */}
                <div className="flex-1 overflow-y-auto overscroll-contain bg-gray-50/80 pb-safe">
                    {items.length === 0 ? (
                        /* ─── Empty State ─── */
                        <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
                            <div
                                className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 flex items-center justify-center mb-6"
                                style={{ boxShadow: "0 12px 32px rgba(147,51,234,0.12)" }}
                            >
                                <ShoppingCart className="h-12 w-12 text-purple-400" />
                                {/* little sparkle dot */}
                                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                    <span className="text-white text-[10px] font-bold">?</span>
                                </div>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                                Здесь пока пусто
                            </p>
                            <p className="text-sm text-gray-400 mt-1.5 max-w-[240px] leading-relaxed">
                                Добавьте что-нибудь из каталога — у нас много интересного!
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 text-sm font-bold text-white transition-all active:scale-95"
                                style={{ boxShadow: "0 4px 16px rgba(147,51,234,0.3)" }}
                            >
                                Перейти в каталог
                            </button>
                        </div>
                    ) : (
                        /* ─── Item List ─── */
                        <div className="p-3 sm:p-4 space-y-2.5">
                            {items.map((item) => {
                                const lineTotal = item.product.price * item.quantity;
                                const atMax = item.quantity >= item.product.stock;

                                return (
                                    <div
                                        key={item.product.id}
                                        className="relative bg-white rounded-2xl border border-gray-100 p-3 sm:p-3.5 transition-all hover:shadow-md"
                                        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                                    >
                                        {/* Top row: image + name + delete */}
                                        <div className="flex gap-3">
                                            {/* Image */}
                                            <Link
                                                href={`/product/${item.product.slug}`}
                                                onClick={onClose}
                                                className="relative w-[60px] h-[60px] sm:w-[84px] sm:h-[84px] rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-50"
                                                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                                            >
                                                {item.product.image ? (
                                                    <img
                                                        src={item.product.image}
                                                        alt={item.product.name}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl">
                                                        {item.product.category === "Robux" ? "💎" : "🔪"}
                                                    </div>
                                                )}
                                                {/* Rarity dot */}
                                                <div className="absolute bottom-1.5 left-1.5">
                                                    <div className={`h-2.5 w-2.5 rounded-full ${getRarityColor(item.product.rarity)} ring-2 ring-white`} />
                                                </div>
                                            </Link>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                                {/* Name + delete */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <Link
                                                        href={`/product/${item.product.slug}`}
                                                        onClick={onClose}
                                                        className="font-semibold text-[13px] sm:text-sm text-gray-900 line-clamp-2 sm:line-clamp-1 hover:text-purple-600 transition-colors leading-tight"
                                                    >
                                                        {item.product.name}
                                                    </Link>
                                                    <button
                                                        onClick={() => removeItem(item.product.id)}
                                                        className="flex-shrink-0 p-2 -m-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                                                        title="Удалить"
                                                    >
                                                        <Trash className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                                    </button>
                                                </div>

                                                {/* Price — visible on desktop inline */}
                                                <div className="hidden sm:flex items-baseline gap-1.5 mt-0.5">
                                                    <span className="text-[15px] font-bold text-gray-900">
                                                        {formatPrice(lineTotal)}
                                                    </span>
                                                    {item.quantity > 1 && (
                                                        <span className="text-[11px] text-gray-400">
                                                            {formatPrice(item.product.price)} × {item.quantity}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Stepper — visible on desktop inline */}
                                                <div className="hidden sm:flex items-center gap-2 mt-1.5">
                                                    <div className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50/80 overflow-hidden">
                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(item.product.id, item.quantity - 1)
                                                            }
                                                            className="flex h-7 w-7 items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-colors active:scale-90"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-bold text-gray-900 select-none tabular-nums">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                if (atMax) {
                                                                    addToast(`Максимальное количество товара "${item.product.name}" — ${item.product.stock} шт.`, "error");
                                                                    return;
                                                                }
                                                                const result = updateQuantity(item.product.id, item.quantity + 1);
                                                                if (!result.success && result.message) {
                                                                    addToast(result.message, "error");
                                                                }
                                                            }}
                                                            disabled={atMax}
                                                            className={`flex h-7 w-7 items-center justify-center transition-colors active:scale-90 ${
                                                                atMax
                                                                    ? "text-gray-300 cursor-not-allowed"
                                                                    : "text-gray-500 hover:bg-purple-50 hover:text-purple-600"
                                                            }`}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    {atMax && (
                                                        <span className="text-[10px] text-orange-500 font-medium">
                                                            макс.
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom row on mobile: price + stepper side by side */}
                                        <div className="flex sm:hidden items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50">
                                            {/* Price */}
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-sm font-bold text-gray-900">
                                                    {formatPrice(lineTotal)}
                                                </span>
                                                {item.quantity > 1 && (
                                                    <span className="text-[11px] text-gray-400">
                                                        {formatPrice(item.product.price)} × {item.quantity}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Stepper */}
                                            <div className="flex items-center gap-2">
                                                <div className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50/80 overflow-hidden">
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(item.product.id, item.quantity - 1)
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-colors active:scale-90"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-bold text-gray-900 select-none tabular-nums">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            if (atMax) {
                                                                addToast(`Максимальное количество товара "${item.product.name}" — ${item.product.stock} шт.`, "error");
                                                                return;
                                                            }
                                                            const result = updateQuantity(item.product.id, item.quantity + 1);
                                                            if (!result.success && result.message) {
                                                                addToast(result.message, "error");
                                                            }
                                                        }}
                                                        disabled={atMax}
                                                        className={`flex h-9 w-9 items-center justify-center transition-colors active:scale-90 ${
                                                            atMax
                                                                ? "text-gray-300 cursor-not-allowed"
                                                                : "text-gray-500 hover:bg-purple-50 hover:text-purple-600"
                                                        }`}
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                {atMax && (
                                                    <span className="text-[10px] text-orange-500 font-medium">
                                                        макс.
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ─── Footer ─── */}
                {items.length > 0 && (
                    <div className="bg-white border-t border-gray-100 px-5 py-4 sm:px-6 sm:py-5 space-y-3.5" style={{ boxShadow: "0 -6px 24px rgba(0,0,0,0.05)" }}>
                        {/* Price breakdown */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">
                                    {totalItems} {totalItems === 1 ? "товар" : totalItems < 5 ? "товара" : "товаров"}
                                </span>
                                <span className="text-gray-600 font-medium">{formatPrice(subtotal)}</span>
                            </div>

                            {totalSavings > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-green-600 font-medium">Экономия</span>
                                    <span className="text-green-600 font-bold">-{formatPrice(totalSavings)}</span>
                                </div>
                            )}

                            <div className="h-px bg-gray-100 my-1" />

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900">Итого</span>
                                <span
                                    className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                                >
                                    {formatPrice(subtotal)}
                                </span>
                            </div>
                        </div>

                        {/* CTA */}
                        <Link
                            href="/checkout"
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3.5 sm:py-4 text-[15px] font-bold text-white transition-all hover:from-purple-700 hover:to-pink-700 active:scale-[0.97]"
                            style={{ boxShadow: "0 6px 28px rgba(147,51,234,0.35)" }}
                        >
                            Оформить заказ
                        </Link>

                        <button
                            onClick={onClose}
                            className="w-full text-[13px] text-gray-400 hover:text-purple-600 transition-colors font-medium py-0.5"
                        >
                            Продолжить покупки
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
