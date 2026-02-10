"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, User as UserIcon, LogOut } from "@/components/icons";
import { useAuth } from "@/components/ui/auth-context";

export default function AccountPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout, isLoading } = useAuth();

    // Protect account route - redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    const handleLogout = () => {
        logout(); // This will clear auth state and redirect to home
    };

    // Show loading state while checking authentication
    if (isLoading || !user) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Загрузка...</p>
                </div>
            </main>
        );
    }

    const roleLabel = user.role === "admin" ? "администратор" : "пользователь";

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Назад в каталог
                </Link>

                <h1 className="text-3xl font-bold mb-8">Мой аккаунт</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Info */}
                    <div className="lg:col-span-1">
                        <div className="rounded-lg border border-border bg-card p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                                    <UserIcon className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-lg">{user.name}</h2>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-border">
                                {user.robloxUsername && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Ник в Roblox</p>
                                        <p className="font-medium">{user.robloxUsername}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-muted-foreground">С нами с</p>
                                    <p className="font-medium">Февраль 2026</p>
                                </div>
                            </div>

                            {user.role === "admin" && (
                                <Link
                                    href="/admin"
                                    className="block w-full rounded-md border border-purple-600/20 bg-purple-600/10 px-4 py-2 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-600/20 text-center"
                                >
                                    ⚙️ Панель администратора
                                </Link>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href="/account/edit"
                                    className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted text-center"
                                >
                                    Редактировать профиль
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-md border border-red-600/20 bg-red-600/10 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-600/20 flex items-center justify-center gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Выйти
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order History Link */}
                    <div className="lg:col-span-2">
                        <div className="rounded-lg border border-border bg-card p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                История заказов
                            </h2>

                            <div className="text-center py-12">
                                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium text-muted-foreground mb-4">
                                    Просмотрите историю всех ваших заказов
                                </p>
                                <Link
                                    href="/account/orders"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                                >
                                    <Package className="h-5 w-5" />
                                    Мои заказы
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
