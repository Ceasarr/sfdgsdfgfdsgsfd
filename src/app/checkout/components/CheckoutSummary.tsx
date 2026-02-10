'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tag, X, Minus, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ui/toast-context';
import Image from 'next/image';

export function CheckoutSummary() {
    const { addToast } = useToast();
    const { items, promoCode, applyPromo, removeItem, updateQuantity, getSubtotal, getDiscount, getTotal } = useCartStore();
    const [promoInput, setPromoInput] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleApplyPromo = async () => {
        if (!promoInput.trim()) return;
        setIsApplying(true);

        try {
            const res = await fetch('/api/promo-codes/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoInput.trim() }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                addToast(data.error || 'Промокод не найден', 'error');
            } else {
                applyPromo(data.promo);
                addToast(`Промокод ${data.promo.code} применён! Скидка ${data.promo.discountPercent}%`, 'success');
                setPromoInput('');
            }
        } catch {
            addToast('Ошибка при проверке промокода', 'error');
        } finally {
            setIsApplying(false);
        }
    };

    const handleRemovePromo = () => {
        applyPromo(null);
        addToast('Промокод удалён', 'info');
    };

    const handleQuantityChange = (productId: string, newQty: number) => {
        if (newQty < 1) {
            removeItem(productId);
            addToast('Товар удалён из корзины', 'info');
            return;
        }
        const result = updateQuantity(productId, newQty);
        if (!result.success && result.message) {
            addToast(result.message, 'error');
        }
    };

    const handleRemoveItem = (productId: string, productName: string) => {
        removeItem(productId);
        addToast(`«${productName}» удалён из корзины`, 'info');
    };

    const subtotal = getSubtotal();
    const discount = getDiscount();
    const total = getTotal();

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <Card className="lg:sticky lg:top-4">
            {/* Header — clickable on mobile to toggle */}
            <CardHeader
                className="cursor-pointer lg:cursor-default"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Ваш заказ
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {/* Mobile: show compact total + toggle */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <span className="text-sm text-gray-500">{totalItems} шт.</span>
                            <span className="text-sm font-bold">{total.toFixed(2)} ₽</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                    </div>
                </div>
            </CardHeader>

            {/* Content — always visible on desktop, collapsible on mobile */}
            <div className={`lg:block ${isExpanded ? 'block' : 'hidden'}`}>
                <CardContent className="space-y-4">
                    {/* Список товаров */}
                    <div className="space-y-3 max-h-[250px] sm:max-h-[350px] overflow-y-auto overscroll-contain">
                        {items.map((item) => (
                            <div key={item.product.id} className="flex gap-3 group">
                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    {item.product.image ? (
                                        <Image
                                            src={item.product.image}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl opacity-30">
                                            {item.product.category === "Robux" ? "💎" : "🔪"}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-1">
                                        <h4 className="text-[13px] sm:text-sm font-medium truncate">{item.product.name}</h4>
                                        <button
                                            onClick={() => handleRemoveItem(item.product.id, item.product.name)}
                                            className="flex-shrink-0 p-1.5 -m-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            title="Удалить"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <p className="text-[13px] sm:text-sm font-semibold mt-0.5">
                                        {(item.product.price * item.quantity).toFixed(2)} ₽
                                    </p>
                                    {/* Quantity controls */}
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <button
                                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                            className="flex items-center justify-center h-7 w-7 sm:h-6 sm:w-6 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors active:scale-90"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xs font-bold w-6 text-center tabular-nums">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                            disabled={item.quantity >= item.product.stock}
                                            className="flex items-center justify-center h-7 w-7 sm:h-6 sm:w-6 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-90"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                        <span className="text-[11px] text-gray-400 ml-1">
                                            × {item.product.price.toFixed(2)} ₽
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    {/* Промокод */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Промокод</label>
                        {promoCode ? (
                            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">{promoCode.code}</span>
                                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                                        -{promoCode.discountPercent}%
                                    </Badge>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemovePromo}
                                    className="h-6 w-6 p-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Введите промокод"
                                    value={promoInput}
                                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                                    className="text-base sm:text-sm"
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleApplyPromo}
                                    disabled={!promoInput || isApplying}
                                >
                                    Применить
                                </Button>
                            </div>
                        )}
                        <p className="text-xs text-gray-500">
                            Введите промокод для получения скидки
                        </p>
                    </div>

                    <Separator />

                    {/* Итого */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Подытог:</span>
                            <span className="font-medium">{subtotal.toFixed(2)} ₽</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600">Скидка:</span>
                                <span className="font-medium text-green-600">-{discount.toFixed(2)} ₽</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-lg font-bold">Итого:</span>
                            <span className="text-lg font-bold text-blue-600">{total.toFixed(2)} ₽</span>
                        </div>
                    </div>

                    {/* Скидка — подписка на Telegram */}
                    <div className="p-2.5 sm:p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-1">
                        <p className="text-sm text-purple-900 font-medium">🎁 Скидка</p>
                        <p className="text-[13px] sm:text-sm text-purple-700">
                            Подпишитесь на наш{' '}
                            <a
                                href="https://t.me/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold underline hover:text-purple-900 transition-colors"
                            >
                                Telegram-канал
                            </a>
                            , чтобы получить промокод на скидку!
                        </p>
                    </div>

                    {/* Информация */}
                    <div className="p-2.5 sm:p-3 bg-blue-50 rounded-lg space-y-1">
                        <p className="text-xs text-blue-900 font-medium">🎮 Быстрая выдача</p>
                        <p className="text-xs text-blue-700">
                            Товары будут доставлены на ваш Roblox аккаунт в течение 5-15 минут после оплаты
                        </p>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}
