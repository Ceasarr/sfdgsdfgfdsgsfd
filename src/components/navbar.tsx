"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, VKIcon, TelegramIcon } from "./icons";
import { useCartStore } from "@/store/cart-store";
import { CartDrawer } from "./cart-drawer";
import { useState } from "react";
import { useAuth } from "@/components/ui/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/ui/toast-context";

const NAV_LINKS = [
    { href: "/", label: "Магазин" },
    { href: "/robux", label: "Robux" },
    { href: "/help", label: "Помощь" },
];

export function Navbar() {
    const itemCount = useCartStore((state) =>
        state.items.reduce((count, item) => count + item.quantity, 0)
    );
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { addToast } = useToast();
    const [isCartOpen, setIsCartOpen] = useState(false);

    return (
        <>
            <nav className="sticky top-0 z-50 border-b border-border/60 bg-white/60 backdrop-blur-xl shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between gap-4">
                        {/* Logo */}
                        <Link href="/" className="flex items-center flex-shrink-0 group">
                            <span className="logo-lens font-[family-name:var(--font-titan-one)] text-[1.6rem] md:text-[1.92rem] bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-[length:200%_100%] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-all duration-500 group-hover:bg-[position:100%_0] group-hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] group-hover:scale-105 group-active:scale-95">
                                Enotik.net
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {NAV_LINKS.map((link) => {
                                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                            isActive
                                                ? "text-purple-700 bg-purple-100/80"
                                                : "text-foreground/70 hover:text-foreground hover:bg-muted"
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right side actions (desktop only) */}
                        <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
                            {/* Social links */}
                            <a
                                href="https://vk.com/ttdtrade"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center h-9 w-9 rounded-xl transition-all hover:bg-[#0077FF]/10 active:scale-90"
                                title="ВКонтакте"
                            >
                                <VKIcon className="h-5 w-5 text-[#0077FF]" />
                            </a>
                            <a
                                href="https://t.me/krakolp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center h-9 w-9 rounded-xl transition-all hover:bg-[#26A5E4]/10 active:scale-90"
                                title="Telegram"
                            >
                                <TelegramIcon className="h-5 w-5 text-[#26A5E4]" />
                            </a>

                            {/* User */}
                            {authLoading ? (
                                <div className="flex items-center gap-2 px-2.5 py-2">
                                    <div className="h-7 w-7 rounded-full bg-muted animate-pulse" />
                                    <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                                </div>
                            ) : isAuthenticated && user ? (
                                <Link
                                    href="/account"
                                    className="flex items-center rounded-xl px-2.5 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95"
                                >
                                    <span className="max-w-[100px] truncate text-sm">
                                        {user.name}
                                    </span>
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 transition-all hover:bg-muted active:scale-95"
                                >
                                    <User className="h-5 w-5" />
                                    <span>Войти</span>
                                </Link>
                            )}

                            {/* Cart */}
                            <button
                                data-cart-icon
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        addToast("Войдите в аккаунт, чтобы пользоваться корзиной", "info");
                                        router.push("/login");
                                        return;
                                    }
                                    setIsCartOpen(true);
                                }}
                                className="relative flex items-center justify-center h-10 w-10 rounded-xl text-foreground/80 transition-all hover:bg-muted hover:text-foreground active:scale-90"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {itemCount > 0 && (
                                    <span
                                        key={itemCount}
                                        className="badge-bounce absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-[10px] font-bold text-white ring-2 ring-background"
                                    >
                                        {itemCount > 99 ? "99" : itemCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Mobile social links (right side) */}
                        <div className="flex md:hidden items-center gap-1 ml-auto">
                            <a
                                href="https://vk.com/ttdtrade"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center h-9 w-9 rounded-xl transition-all hover:bg-[#0077FF]/10 active:scale-90"
                                title="ВКонтакте"
                            >
                                <VKIcon className="h-5 w-5 text-[#0077FF]" />
                            </a>
                            <a
                                href="https://t.me/krakolp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center h-9 w-9 rounded-xl transition-all hover:bg-[#26A5E4]/10 active:scale-90"
                                title="Telegram"
                            >
                                <TelegramIcon className="h-5 w-5 text-[#26A5E4]" />
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
