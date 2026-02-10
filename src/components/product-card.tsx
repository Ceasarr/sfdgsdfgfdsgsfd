"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice, getRarityColor, getRarityGlow } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { ShoppingCart } from "./icons";
import { useToast } from "@/components/ui/toast-context";
import { useAuth } from "@/components/ui/auth-context";
import { useFlyToCart } from "@/components/fly-to-cart";
import { useRouter } from "next/navigation";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);
    const { addToast } = useToast();
    const { isAuthenticated } = useAuth();
    const { flyToCart } = useFlyToCart();
    const router = useRouter();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            addToast("Войдите в аккаунт, чтобы добавлять товары в корзину", "info");
            router.push("/login");
            return;
        }

        if (product.stock <= 0) {
            addToast(`Товар "${product.name}" отсутствует на складе`, "error");
            return;
        }

        const result = addItem(product);
        if (result.success) {
            addToast(`${product.name} добавлен в корзину`, "cart");
            // Launch fly animation from the button to cart icon
            const rect = e.currentTarget.getBoundingClientRect();
            flyToCart(rect, product.image || null, product.category === "Robux" ? "💎" : "🔪");
        } else {
            addToast(result.message || "Не удалось добавить товар", "error");
        }
    };

    return (
        <div className="card-animate group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-xl hover:shadow-purple-500/[.08] transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.97] active:shadow-md">
            {/* Rarity Badge — glow matches rarity color */}
            <div className="absolute top-2.5 right-2.5 z-10">
                <span
                    className={`${getRarityColor(product.rarity)} ${getRarityGlow(product.rarity)} inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold text-white uppercase tracking-wider`}
                >
                    {product.rarity}
                </span>
            </div>

            {/* Discount Badge */}
            {product.oldPrice && (
                <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="inline-block bg-green-500 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold text-white" style={{ boxShadow: '0 2px 10px rgba(34,197,94,0.4)' }}>
                        -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                    </span>
                </div>
            )}

            {/* Product Image */}
            <Link href={`/product/${product.slug}`} className="block relative">
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.06]"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-5xl sm:text-6xl opacity-10">
                                {product.category === "Robux" ? "💎" : "🔪"}
                            </div>
                        </div>
                    )}

                    {/* Bottom gradient for text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

                    {/* Out of Stock Overlay */}
                    {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                            <span className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold" style={{ boxShadow: '0 4px 14px rgba(220,38,38,0.4)' }}>
                                Нет в наличии
                            </span>
                        </div>
                    )}

                    {/* Add-to-cart — always visible on mobile, hover-reveal on md+ */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 z-20 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 ease-out">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                            className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 sm:py-3 text-[13px] sm:text-sm font-bold backdrop-blur-md transition-all active:scale-95 ${
                                product.stock <= 0
                                    ? "bg-gray-400/80 text-gray-200 cursor-not-allowed"
                                    : "bg-white/90 text-gray-900 hover:bg-white"
                            }`}
                            style={product.stock > 0 ? { boxShadow: '0 4px 16px rgba(0,0,0,0.10)' } : undefined}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            {product.stock <= 0 ? "Нет в наличии" : "В корзину"}
                        </button>
                    </div>
                </div>
            </Link>

            {/* Product Info */}
            <div className="p-3 sm:p-4 space-y-1 sm:space-y-1.5">
                <Link href={`/product/${product.slug}`}>
                    <h3 className="font-semibold text-[13px] sm:text-base leading-tight text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </Link>

                {product.game && (
                    <span className="inline-block text-[10px] sm:text-[11px] font-semibold text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-md">
                        {product.game}
                    </span>
                )}

                <p className="text-[11px] sm:text-sm text-gray-500 line-clamp-2 min-h-[28px] sm:min-h-[40px] leading-snug">
                    {product.description}
                </p>

                {/* Price row */}
                <div className="pt-2 flex items-baseline gap-2 border-t border-gray-100">
                    <span className="text-base sm:text-lg font-extrabold text-gray-900">
                        {formatPrice(product.price)}
                    </span>
                    {product.oldPrice && (
                        <span className="text-[11px] sm:text-sm text-gray-400 line-through">
                            {formatPrice(product.oldPrice)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
