"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, Star, Package } from "@/components/icons";
import { Product } from "@/types";
import { formatPrice, getRarityColor, getRarityGlow } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { ProductCard } from "@/components/product-card";
import { Reviews } from "@/components/reviews";
import { useToast } from "@/components/ui/toast-context";
import { useAuth } from "@/components/ui/auth-context";
import { useFlyToCart } from "@/components/fly-to-cart";

interface ProductDetailClientProps {
    product: Product;
    recommendedProducts: Product[];
}

export function ProductDetailClient({ product, recommendedProducts }: ProductDetailClientProps) {
    const [quantity, setQuantity] = useState(1);
    const addItem = useCartStore((state) => state.addItem);
    const { addToast } = useToast();
    const { isAuthenticated } = useAuth();
    const { flyToCart } = useFlyToCart();
    const router = useRouter();

    const items = useCartStore((state) => state.items);
    const currentCartQty = items.find((i) => i.product.id === product.id)?.quantity ?? 0;
    const maxQuantity = Math.max(0, product.stock - currentCartQty);
    const isOutOfStock = product.stock <= 0;

    const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isAuthenticated) {
            addToast("Войдите в аккаунт, чтобы добавлять товары в корзину", "info");
            router.push("/login");
            return;
        }

        if (isOutOfStock) {
            addToast(`Товар "${product.name}" отсутствует на складе`, "error");
            return;
        }

        if (maxQuantity <= 0) {
            addToast(`Весь доступный товар "${product.name}" уже в корзине (${product.stock} шт.)`, "error");
            return;
        }

        const result = addItem(product, quantity);
        if (result.success) {
            addToast(`${quantity} шт. "${product.name}" добавлено в корзину`, "cart");
            // Launch fly animation
            const rect = e.currentTarget.getBoundingClientRect();
            flyToCart(rect, product.image || null, product.category === "Robux" ? "💎" : "🔪");
        } else {
            addToast(result.message || "Не удалось добавить товар", "error");
        }
    };

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6 py-1.5 active:scale-95"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Назад к каталогу
                </Link>

                {/* Product Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 mb-10 sm:mb-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square rounded-2xl border border-gray-100 bg-muted flex items-center justify-center relative overflow-hidden shadow-lg">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-9xl opacity-20">
                                    {product.category === "Robux" ? "💎" : "🔪"}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />

                            {/* Rarity Badge */}
                            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                                <span
                                    className={`${getRarityColor(product.rarity)} ${getRarityGlow(product.rarity)} px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider`}
                                >
                                    {product.rarity}
                                </span>
                            </div>

                            {/* Discount Badge */}
                            {product.oldPrice && (
                                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                                    <span className="bg-green-500 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white" style={{ boxShadow: '0 2px 10px rgba(34,197,94,0.4)' }}>
                                        -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-4 sm:space-y-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">{product.name}</h1>
                            {product.game && (
                                <span className="inline-block text-xs sm:text-sm font-semibold text-purple-600 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-lg mb-2">
                                    🎮 {product.game}
                                </span>
                            )}
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{product.description}</p>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 flex-wrap">
                            <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{formatPrice(product.price)}</span>
                            {product.oldPrice && (
                                <span className="text-lg sm:text-xl text-muted-foreground line-through">
                                    {formatPrice(product.oldPrice)}
                                </span>
                            )}
                        </div>



                        {/* Stock Info */}
                        {isOutOfStock && (
                            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
                                <Package className="h-4 w-4" />
                                Нет в наличии
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Количество</label>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={isOutOfStock || quantity <= 1}
                                    className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-border hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 text-lg font-medium"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = Math.max(1, parseInt(e.target.value) || 1);
                                        setQuantity(Math.min(val, Math.max(1, maxQuantity)));
                                    }}
                                    className="w-16 sm:w-20 h-11 sm:h-10 px-2 text-center rounded-xl border border-border bg-background disabled:opacity-40 font-bold text-base"
                                    min="1"
                                    max={Math.max(1, maxQuantity)}
                                    disabled={isOutOfStock}
                                />
                                <button
                                    onClick={() => {
                                        if (quantity + 1 > maxQuantity) {
                                            addToast(`Максимум для добавления: ${maxQuantity} шт. (в наличии: ${product.stock} шт.)`, "error");
                                        } else {
                                            setQuantity(quantity + 1);
                                        }
                                    }}
                                    disabled={isOutOfStock || quantity >= maxQuantity}
                                    className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border border-border hover:bg-muted transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 text-lg font-medium"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock || maxQuantity <= 0}
                            className={`w-full flex items-center justify-center gap-2.5 rounded-2xl px-6 py-4 sm:py-4.5 text-base sm:text-lg font-bold transition-all ${
                                isOutOfStock || maxQuantity <= 0
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 active:scale-[0.97]"
                            }`}
                            style={!(isOutOfStock || maxQuantity <= 0) ? { boxShadow: '0 6px 28px rgba(147,51,234,0.35)' } : undefined}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {isOutOfStock
                                ? "Нет в наличии"
                                : maxQuantity <= 0
                                    ? "Весь товар в корзине"
                                    : "Добавить в корзину"
                            }
                        </button>

                        {/* Features */}
                        <div className="pt-5 sm:pt-6 border-t border-border space-y-3">
                            <h3 className="font-bold text-sm sm:text-base">Информация о товаре</h3>
                            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 text-sm">
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <p className="text-muted-foreground text-xs">Категория</p>
                                    <p className="font-semibold mt-0.5">{product.category}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <p className="text-muted-foreground text-xs">Редкость</p>
                                    <p className="font-semibold mt-0.5 capitalize">{product.rarity}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <p className="text-muted-foreground text-xs">Доставка</p>
                                    <p className="font-semibold mt-0.5">Мгновенно</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <p className="text-muted-foreground text-xs">Поддержка</p>
                                    <p className="font-semibold mt-0.5">24/7</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews */}
                <div className="mb-12">
                    <Reviews productId={product.id} />
                </div>

                {/* Recommended Products */}
                {recommendedProducts.length > 0 && (
                    <div className="pt-6 sm:pt-8 border-t border-border">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Вам также может понравиться</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                            {recommendedProducts.map((recProduct) => (
                                <ProductCard key={recProduct.id} product={recProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
