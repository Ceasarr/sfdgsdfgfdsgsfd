"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Diamond, HelpCircle, ShoppingCart, User } from "./icons";
import { useCartStore } from "@/store/cart-store";
import { useAuth } from "@/components/ui/auth-context";
import { useToast } from "@/components/ui/toast-context";
import { CartDrawer } from "./cart-drawer";
import { useState } from "react";

const NAV_ITEMS = [
    { href: "/", label: "Магазин", icon: Home },
    { href: "/robux", label: "Робукс", icon: Diamond },
    { href: "/help", label: "Помощь", icon: HelpCircle },
    { href: "cart", label: "Корзина", icon: ShoppingCart },
    { href: "/account", label: "Профиль", icon: User },
];

export function MobileBottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { addToast } = useToast();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const itemCount = useCartStore((state) =>
        state.items.reduce((count, item) => count + item.quantity, 0)
    );

    const isActive = (href: string) => {
        if (href === "cart") return false;
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    const handleCartClick = () => {
        if (!isAuthenticated) {
            addToast("Войдите в аккаунт, чтобы пользоваться корзиной", "info");
            router.push("/login");
            return;
        }
        setIsCartOpen(true);
    };

    const handleProfileClick = () => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        router.push("/account");
    };

    return (
        <>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-xl safe-area-bottom" style={{ boxShadow: '0 -2px 20px rgba(0,0,0,0.06)' }}>
                <div className="flex items-stretch justify-around px-1">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;

                        // Cart — special button
                        if (item.href === "cart") {
                            return (
                                <button
                                    key={item.href}
                                    onClick={handleCartClick}
                                    className="relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] transition-colors"
                                >
                                    <div className="relative">
                                        <Icon className="h-[22px] w-[22px] text-gray-400" />
                                        {itemCount > 0 && (
                                            <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 px-1 text-[9px] font-bold text-white">
                                                {itemCount > 99 ? "99" : itemCount}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-400">{item.label}</span>
                                </button>
                            );
                        }

                        // Profile — special handling for auth
                        if (item.href === "/account") {
                            return (
                                <button
                                    key={item.href}
                                    onClick={handleProfileClick}
                                    className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] transition-colors ${
                                        active ? "" : ""
                                    }`}
                                >
                                    <Icon className={`h-[22px] w-[22px] transition-colors ${
                                        active ? "text-purple-600" : "text-gray-400"
                                    }`} />
                                    <span className={`text-[10px] font-medium transition-colors ${
                                        active ? "text-purple-600" : "text-gray-400"
                                    }`}>{item.label}</span>
                                    {active && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600" />
                                    )}
                                </button>
                            );
                        }

                        // Regular link
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] transition-colors"
                            >
                                <Icon className={`h-[22px] w-[22px] transition-colors ${
                                    active ? "text-purple-600" : "text-gray-400"
                                }`} />
                                <span className={`text-[10px] font-medium transition-colors ${
                                    active ? "text-purple-600" : "text-gray-400"
                                }`}>{item.label}</span>
                                {active && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
