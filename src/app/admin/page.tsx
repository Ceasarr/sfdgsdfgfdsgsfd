"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, User as UserIcon, Tag, Star, ImageIcon, DollarSign } from "@/components/icons";
import { useAuth } from "@/components/ui/auth-context";

export default function AdminPage() {
    const router = useRouter();
    const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

    // Protect admin route
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                // Not logged in - redirect to login
                router.push("/login");
            } else if (!isAdmin) {
                // Logged in but not admin - redirect to account
                router.push("/account");
            }
        }
    }, [isAuthenticated, isAdmin, isLoading, router]);

    // Show loading state while checking authentication
    if (isLoading || !isAuthenticated || !isAdmin) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Загрузка...</p>
                </div>
            </main>
        );
    }



    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Панель администратора</h1>
                    <p className="text-muted-foreground">Управление магазином</p>
                </div>



                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
                    <Link
                        href="/admin/dashboard"
                        className="rounded-lg border border-border bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 transition-all hover:shadow-lg hover:scale-105 text-center border-purple-200"
                    >
                        <Star className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <p className="font-medium text-purple-900 dark:text-purple-100">Дашборд</p>
                    </Link>

                    <Link
                        href="/admin/products"
                        className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted text-center"
                    >
                        <Package className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <p className="font-medium">Товары</p>
                    </Link>

                    <Link
                        href="/admin/orders"
                        className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted text-center"
                    >
                        <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <p className="font-medium">Заказы</p>
                    </Link>

                    <Link
                        href="/admin/customers"
                        className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted text-center"
                    >
                        <UserIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="font-medium">Клиенты</p>
                    </Link>

                    <Link
                        href="/admin/promo-codes"
                        className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted text-center"
                    >
                        <Tag className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                        <p className="font-medium">Промокоды</p>
                    </Link>

                    <Link
                        href="/admin/banners"
                        className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted text-center"
                    >
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-pink-600" />
                        <p className="font-medium">Реклама</p>
                    </Link>

                    <Link
                        href="/admin/robux"
                        className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted text-center"
                    >
                        <DollarSign className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                        <p className="font-medium">Robux</p>
                    </Link>
                </div>


            </div>
        </main>
    );
}
