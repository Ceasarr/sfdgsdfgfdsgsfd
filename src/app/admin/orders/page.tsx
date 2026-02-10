"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "@/components/icons";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/components/ui/auth-context";

type AdminOrdersApiItem = {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        name: string;
        slug: string;
        image: string;
        category: string;
        rarity: string;
    };
};

type AdminOrdersApiOrder = {
    id: string;
    orderNumber: string;
    createdAt: string;
    status: string;
    total: number;
    robloxUsername: string;
    userId: string | null;
    user: { id: string; name: string | null; email: string; role: string } | null;
    items: AdminOrdersApiItem[];
};

export default function AdminOrdersPage() {
    const router = useRouter();
    const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

    const [orders, setOrders] = useState<AdminOrdersApiOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [pageSize, setPageSize] = useState<number>(0); // 0 = all
    const [statusFilter, setStatusFilter] = useState<"all" | "new" | "processing" | "completed">("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Protect admin route
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push("/login");
            else if (!isAdmin) router.push("/account");
        }
    }, [isAuthenticated, isAdmin, isLoading, router]);

    const loadOrders = async () => {
        if (!user?.id || !isAdmin) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/orders?adminId=${encodeURIComponent(user.id)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Не удалось загрузить заказы");
            setOrders(Array.isArray(data?.orders) ? data.orders : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Не удалось загрузить заказы");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, isAdmin]);

    const filteredOrders = useMemo(() => {
        let base = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

        const q = searchQuery.trim().toLowerCase();
        if (q) {
            base = base.filter((o) => {
                const orderNumber = (o.orderNumber ?? "").toLowerCase();
                const roblox = (o.robloxUsername ?? "").toLowerCase();
                const email = (o.user?.email ?? "").toLowerCase();
                const name = (o.user?.name ?? "").toLowerCase();
                return orderNumber.includes(q) || roblox.includes(q) || email.includes(q) || name.includes(q);
            });
        }

        return pageSize === 0 ? base : base.slice(0, pageSize);
    }, [orders, pageSize, statusFilter, searchQuery]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-600 text-white";
            case "processing":
                return "bg-blue-600 text-white";
            case "new":
                return "bg-yellow-600 text-white";
            default:
                return "bg-gray-600 text-white";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "new":
                return "Новый";
            case "processing":
                return "В обработке";
            case "completed":
                return "Выполнен";
            default:
                return status;
        }
    };

    const updateStatus = async (orderId: string, nextStatus: "new" | "processing" | "completed") => {
        if (!user?.id) return;
        setUpdatingOrderId(orderId);
        setError(null);
        try {
            const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminId: user.id, status: nextStatus }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Не удалось обновить статус");

            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
            );
        } catch (e) {
            setError(e instanceof Error ? e.message : "Не удалось обновить статус");
        } finally {
            setUpdatingOrderId(null);
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
                    <h1 className="text-3xl font-bold">Управление заказами</h1>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 mb-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Поиск по номеру, нику, email или имени…"
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
                            <span className="text-sm text-muted-foreground">заказов</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Статус</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as "all" | "new" | "processing" | "completed")}
                                className="h-10 rounded-md border border-border bg-background px-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            >
                                <option value="all">Все</option>
                                <option value="new">Новый</option>
                                <option value="processing">В обработке</option>
                                <option value="completed">Выполнен</option>
                            </select>
                        </div>

                        {pageSize > 0 && filteredOrders.length < orders.length && (
                            <span className="text-xs text-muted-foreground">
                                (показано {filteredOrders.length} из {orders.length})
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
                            onClick={() => void loadOrders()}
                            className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors text-sm"
                        >
                            Повторить
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Orders Table */}
                        <div className="rounded-lg border border-border bg-card overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 320px)" }}>
                            <div className="overflow-auto flex-1">
                                <table className="w-full">
                                    <thead className="bg-muted/50 border-b border-border sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Заказ</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Клиент</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Roblox ник</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Товары</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Сумма</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Статус</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Дата</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold bg-muted/50">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                                    Заказы не найдены.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredOrders.map((order) => (
                                                <tr
                                                    key={order.id}
                                                    className="hover:bg-muted/30 transition-colors"
                                                >
                                                    <td className="px-4 py-3">
                                                        <p className="font-mono text-sm font-bold">#{order.orderNumber}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {order.items.length} товар{order.items.length === 1 ? "" : order.items.length < 5 ? "а" : "ов"}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="text-sm font-medium">{order.user?.name || "—"}</p>
                                                        <p className="text-xs text-muted-foreground">{order.user?.email || "—"}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-medium">{order.robloxUsername}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {order.items.length === 0 ? (
                                                            <span className="text-sm text-muted-foreground">—</span>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-2 max-w-[520px]">
                                                                {order.items.map((item) => (
                                                                    <div
                                                                        key={item.id}
                                                                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/60 px-2 py-1 text-xs"
                                                                        title={`${item.product?.name ?? "Товар"} ×${item.quantity}`}
                                                                    >
                                                                        <div className="w-5 h-5 rounded bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                                                                            {item.product?.image ? (
                                                                                <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <span className="text-[10px]">{item.product?.category === "Robux" ? "💎" : "🔪"}</span>
                                                                            )}
                                                                        </div>
                                                                        <span className="font-medium max-w-[220px] truncate">
                                                                            {item.product?.name ?? "Товар"}
                                                                        </span>
                                                                        <span className="text-muted-foreground">×{item.quantity}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-bold">{formatPrice(order.total)}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                            {getStatusLabel(order.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-muted-foreground">
                                                            {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <select
                                                            value={order.status}
                                                            disabled={updatingOrderId === order.id}
                                                            onChange={(e) =>
                                                                updateStatus(order.id, e.target.value as "new" | "processing" | "completed")
                                                            }
                                                            className="h-8 rounded-md border border-border bg-background px-2 text-xs focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:opacity-60"
                                                        >
                                                            <option value="new">Новый</option>
                                                            <option value="processing">В обработке</option>
                                                            <option value="completed">Выполнен</option>
                                                        </select>
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
                                <p className="text-sm text-muted-foreground">Всего заказов</p>
                                <p className="text-2xl font-bold">{orders.length}</p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Выполнено</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {orders.filter((o) => o.status === "completed").length}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Новых</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {orders.filter((o) => o.status === "new").length}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Выручка</p>
                                <p className="text-2xl font-bold">
                                    {formatPrice(orders.reduce((sum, o) => sum + o.total, 0))}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
