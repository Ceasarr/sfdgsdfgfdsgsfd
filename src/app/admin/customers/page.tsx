"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "@/components/icons";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/components/ui/auth-context";

type Customer = {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
    ordersCount: number;
    totalSpent: number;
};

export default function AdminCustomersPage() {
    const router = useRouter();
    const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageSize, setPageSize] = useState<number>(0); // 0 = all
    const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Protect admin route
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push("/login");
            else if (!isAdmin) router.push("/account");
        }
    }, [isAuthenticated, isAdmin, isLoading, router]);

    const loadCustomers = async () => {
        if (!user?.id || !isAdmin) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/customers?adminId=${encodeURIComponent(user.id)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Не удалось загрузить клиентов");
            setCustomers(Array.isArray(data?.customers) ? data.customers : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Не удалось загрузить клиентов");
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadCustomers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, isAdmin]);

    const filteredCustomers = useMemo(() => {
        let base = roleFilter === "all" ? customers : customers.filter((c) => c.role === roleFilter);

        const q = searchQuery.trim().toLowerCase();
        if (q) {
            base = base.filter((c) => {
                const email = c.email.toLowerCase();
                const name = (c.name ?? "").toLowerCase();
                return email.includes(q) || name.includes(q);
            });
        }

        return pageSize === 0 ? base : base.slice(0, pageSize);
    }, [customers, pageSize, roleFilter, searchQuery]);

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "admin":
                return "Админ";
            case "user":
                return "Пользователь";
            default:
                return role;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-purple-600 text-white";
            default:
                return "bg-gray-200 text-gray-700";
        }
    };

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Назад к панели
                    </Link>
                    <h1 className="text-3xl font-bold">Клиенты</h1>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 mb-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Поиск по имени или email…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-border bg-background text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Показывать</span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="h-10 rounded-md border border-border bg-background px-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            >
                                <option value={0}>Все</option>
                                <option value={10}>10</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={200}>200</option>
                            </select>
                            <span className="text-sm text-muted-foreground">клиентов</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Роль</span>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value as "all" | "user" | "admin")}
                                className="h-10 rounded-md border border-border bg-background px-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            >
                                <option value="all">Все</option>
                                <option value="user">Пользователь</option>
                                <option value="admin">Админ</option>
                            </select>
                        </div>

                        {pageSize > 0 && filteredCustomers.length < customers.length && (
                            <span className="text-xs text-muted-foreground">
                                (показано {filteredCustomers.length} из {customers.length})
                            </span>
                        )}
                    </div>
                </div>

                {/* Loading / Error */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="rounded-lg border border-border bg-card p-6">
                        <p className="text-sm text-red-600 font-medium mb-3">{error}</p>
                        <button
                            onClick={() => void loadCustomers()}
                            className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors text-sm"
                        >
                            Повторить
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Customers Table */}
                        <div className="rounded-lg border border-border bg-card overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 320px)" }}>
                            <div className="overflow-auto flex-1">
                                <table className="w-full">
                                    <thead className="bg-muted/50 border-b border-border sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Имя</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Эл. почта</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Роль</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Заказов</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Потрачено</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Дата регистрации</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredCustomers.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                                    Клиенты не найдены.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredCustomers.map((c) => (
                                                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-medium">{c.name || "—"}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm">{c.email}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getRoleColor(c.role)}`}>
                                                            {getRoleLabel(c.role)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-medium">{c.ordersCount}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-bold">
                                                            {c.totalSpent > 0 ? formatPrice(c.totalSpent) : "—"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-muted-foreground">
                                                            {new Date(c.createdAt).toLocaleDateString("ru-RU")}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Stats Footer */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Всего клиентов</p>
                                <p className="text-2xl font-bold">{customers.length}</p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Админов</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {customers.filter((c) => c.role === "admin").length}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="text-sm text-muted-foreground">С заказами</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {customers.filter((c) => c.ordersCount > 0).length}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Общая выручка</p>
                                <p className="text-2xl font-bold">
                                    {formatPrice(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
