"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Package, ShoppingBag, Users, Calendar } from "@/components/icons";
import { useAuth } from "@/components/ui/auth-context";
import { formatPrice } from "@/lib/utils";

/* ── types ────────────────────────────────────────── */

interface DashboardData {
    stats: {
        totalRevenue: number;
        revenueChange: number;
        totalOrders: number;
        ordersChange: number;
        totalCustomers: number;
        newCustomers: number;
        customersChange: number;
        avgOrderValue: number;
        avgOrderChange: number;
        totalProducts: number;
    };
    chart: { labels: string[]; revenue: number[]; orders: number[] };
    statusCounts: Record<string, number>;
    topProducts: { name: string; image: string; category: string; sales: number; revenue: number }[];
    recentActivity: { id: string; customer: string; robloxUsername: string; amount: number; status: string; date: string; itemCount: number }[];
    salesByCategory: { category: string; count: number; revenue: number; percentage: number }[];
}

type TimeRange = "today" | "3d" | "7d" | "30d" | "90d" | "1y";
type ChartMode = "revenue" | "orders";

/* ── SVG Bar Chart ────────────────────────────────── */

function BarChart({
    labels,
    data,
    color = "#9333ea",
    height = 220,
    formatValue,
}: {
    labels: string[];
    data: number[];
    color?: string;
    height?: number;
    formatValue?: (v: number) => string;
}) {
    const max = Math.max(...data, 1);
    const barW = Math.max(6, Math.min(32, 600 / (labels.length || 1) - 4));
    const gap = Math.max(2, barW * 0.3);
    const totalW = labels.length * (barW + gap);
    const padTop = 24;
    const padBot = 40;
    const chartH = height - padTop - padBot;

    return (
        <div className="w-full overflow-x-auto">
            <svg width={Math.max(totalW + 40, 300)} height={height} className="mx-auto">
                {/* grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                    const y = padTop + chartH * (1 - pct);
                    return (
                        <g key={pct}>
                            <line x1={30} y1={y} x2={totalW + 35} y2={y} stroke="#e5e7eb" strokeDasharray="4 3" />
                            <text x={26} y={y + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
                                {formatValue ? formatValue(Math.round(max * pct)) : Math.round(max * pct)}
                            </text>
                        </g>
                    );
                })}

                {/* bars */}
                {data.map((v, i) => {
                    const barH = (v / max) * chartH;
                    const x = 35 + i * (barW + gap);
                    const y = padTop + chartH - barH;
                    return (
                        <g key={i}>
                            <rect
                                x={x}
                                y={y}
                                width={barW}
                                height={barH}
                                rx={barW > 10 ? 4 : 2}
                                fill={color}
                                opacity={0.85}
                                className="transition-all hover:opacity-100"
                            />
                            {/* tooltip area */}
                            <title>
                                {labels[i]}: {formatValue ? formatValue(v) : v}
                            </title>
                            {/* label */}
                            {labels.length <= 31 && (
                                <text
                                    x={x + barW / 2}
                                    y={height - 8}
                                    textAnchor="middle"
                                    className="fill-gray-400 text-[9px]"
                                    transform={labels.length > 14 ? `rotate(-45 ${x + barW / 2} ${height - 8})` : undefined}
                                >
                                    {labels[i]}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

/* ── Donut Chart ──────────────────────────────────── */

function DonutChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
    const total = slices.reduce((s, sl) => s + sl.value, 0) || 1;
    let cumulative = 0;
    const size = 140;
    const cx = size / 2;
    const cy = size / 2;
    const r = 52;
    const stroke = 18;

    const arcs = slices.map((sl) => {
        const pct = sl.value / total;
        const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
        cumulative += pct;
        const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;

        const largeArc = pct > 0.5 ? 1 : 0;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);

        return { ...sl, pct, d: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}` };
    });

    return (
        <svg width={size} height={size} className="mx-auto">
            {arcs.map((arc, i) => (
                <path
                    key={i}
                    d={arc.d}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                >
                    <title>{arc.label}: {Math.round(arc.pct * 100)}%</title>
                </path>
            ))}
            <text x={cx} y={cy - 6} textAnchor="middle" className="fill-foreground text-lg font-bold">
                {total}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" className="fill-gray-400 text-[10px]">
                заказов
            </text>
        </svg>
    );
}

/* ── Main Component ───────────────────────────────── */

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<TimeRange>("30d");
    const [chartMode, setChartMode] = useState<ChartMode>("revenue");

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) router.push("/login");
            else if (!isAdmin) router.push("/account");
        }
    }, [isAuthenticated, isAdmin, authLoading, router]);

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/dashboard?adminId=${user.id}&range=${timeRange}`);
            if (!res.ok) throw new Error();
            const json = await res.json();
            setData(json);
        } catch {
            console.error("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id && isAdmin) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, isAdmin, timeRange]);

    const rangeLabel = useMemo(() => {
        const map: Record<string, string> = { today: "сегодня", "3d": "3 дня", "7d": "7 дней", "30d": "30 дней", "90d": "90 дней", "1y": "год" };
        return map[timeRange] ?? timeRange;
    }, [timeRange]);

    const getCategoryLabel = (c: string) => {
        if (c === "Items") return "Предметы";
        if (c === "Robux") return "Robux";
        return c;
    };

    const getStatusColor = (s: string) => {
        if (s === "completed") return "bg-green-500";
        if (s === "processing") return "bg-blue-500";
        return "bg-yellow-500";
    };
    const getStatusLabel = (s: string) => {
        if (s === "completed") return "Выполнен";
        if (s === "processing") return "В обработке";
        return "Новый";
    };

    const categoryColors = ["#9333ea", "#ec4899", "#3b82f6", "#f97316", "#22c55e", "#eab308"];

    if (authLoading || !isAuthenticated || !isAdmin) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                    <div>
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Назад в админку
                        </Link>
                        <h1 className="text-3xl font-bold">Аналитика</h1>
                        <p className="text-muted-foreground text-sm mt-1">Подробная статистика и инсайты за последние {rangeLabel}</p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        {(["today", "3d", "7d", "30d", "90d", "1y"] as TimeRange[]).map((r) => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    timeRange === r
                                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/25"
                                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                                }`}
                            >
                                {{ today: "Сегодня", "3d": "3 дня", "7d": "7 дней", "30d": "30 дней", "90d": "90 дней", "1y": "Год" }[r]}
                            </button>
                        ))}
                    </div>
                </div>

                {loading || !data ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="text-center">
                            <div className="h-10 w-10 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">Загрузка аналитики…</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ══════ KPI Cards ══════ */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <KPICard
                                icon={<DollarSign className="h-5 w-5 text-green-600" />}
                                iconBg="bg-green-100"
                                label="Выручка"
                                value={formatPrice(data.stats.totalRevenue)}
                                change={data.stats.revenueChange}
                            />
                            <KPICard
                                icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
                                iconBg="bg-blue-100"
                                label="Заказы"
                                value={String(data.stats.totalOrders)}
                                change={data.stats.ordersChange}
                            />
                            <KPICard
                                icon={<Users className="h-5 w-5 text-purple-600" />}
                                iconBg="bg-purple-100"
                                label="Клиенты"
                                value={String(data.stats.totalCustomers)}
                                sub={`+${data.stats.newCustomers} новых`}
                                change={data.stats.customersChange}
                            />
                            <KPICard
                                icon={<Package className="h-5 w-5 text-orange-600" />}
                                iconBg="bg-orange-100"
                                label="Средний чек"
                                value={formatPrice(data.stats.avgOrderValue)}
                                change={data.stats.avgOrderChange}
                            />
                        </div>

                        {/* ══════ Charts Row ══════ */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Revenue / Orders Chart */}
                            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="font-bold text-lg">
                                        {chartMode === "revenue" ? "Выручка" : "Заказы"} по дням
                                    </h2>
                                    <div className="flex rounded-lg overflow-hidden border border-border">
                                        <button
                                            onClick={() => setChartMode("revenue")}
                                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                                                chartMode === "revenue" ? "bg-purple-600 text-white" : "bg-muted hover:bg-muted/80"
                                            }`}
                                        >
                                            Выручка
                                        </button>
                                        <button
                                            onClick={() => setChartMode("orders")}
                                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                                                chartMode === "orders" ? "bg-purple-600 text-white" : "bg-muted hover:bg-muted/80"
                                            }`}
                                        >
                                            Заказы
                                        </button>
                                    </div>
                                </div>

                                {data.chart.labels.length === 0 ? (
                                    <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
                                        Нет данных за выбранный период
                                    </div>
                                ) : (
                                    <BarChart
                                        labels={data.chart.labels}
                                        data={chartMode === "revenue" ? data.chart.revenue : data.chart.orders}
                                        color={chartMode === "revenue" ? "#9333ea" : "#3b82f6"}
                                        formatValue={chartMode === "revenue" ? (v) => formatPrice(v) : undefined}
                                    />
                                )}
                            </div>

                            {/* Status Donut */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="font-bold text-lg mb-5">Статус заказов</h2>

                                <DonutChart
                                    slices={[
                                        { label: "Новые", value: data.statusCounts.new || 0, color: "#eab308" },
                                        { label: "В обработке", value: data.statusCounts.processing || 0, color: "#3b82f6" },
                                        { label: "Выполнены", value: data.statusCounts.completed || 0, color: "#22c55e" },
                                    ]}
                                />

                                <div className="mt-5 space-y-2">
                                    {[
                                        { key: "new", label: "Новые", color: "bg-yellow-500" },
                                        { key: "processing", label: "В обработке", color: "bg-blue-500" },
                                        { key: "completed", label: "Выполнены", color: "bg-green-500" },
                                    ].map((s) => (
                                        <div key={s.key} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-3 w-3 rounded-full ${s.color}`} />
                                                <span className="text-muted-foreground">{s.label}</span>
                                            </div>
                                            <span className="font-bold">{data.statusCounts[s.key] || 0}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ══════ Middle Row ══════ */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Top Products */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="font-bold text-lg mb-4">Топ товаров</h2>
                                {data.topProducts.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-6 text-center">Нет данных</p>
                                ) : (
                                    <div className="space-y-2">
                                        {data.topProducts.map((product, i) => {
                                            const maxRev = data.topProducts[0]?.revenue || 1;
                                            const pct = (product.revenue / maxRev) * 100;
                                            return (
                                                <div key={i} className="relative rounded-lg p-3 hover:bg-muted/40 transition-colors overflow-hidden">
                                                    {/* bg bar */}
                                                    <div
                                                        className="absolute inset-y-0 left-0 bg-purple-500/8 rounded-lg"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                    <div className="relative flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 font-bold text-purple-600 text-sm flex-shrink-0">
                                                                {i + 1}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-sm truncate">{product.name}</p>
                                                                <p className="text-xs text-muted-foreground">{product.sales} продаж</p>
                                                            </div>
                                                        </div>
                                                        <span className="font-bold text-sm text-green-600 flex-shrink-0">
                                                            {formatPrice(product.revenue)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Sales by Category */}
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h2 className="font-bold text-lg mb-4">Продажи по категориям</h2>
                                {data.salesByCategory.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-6 text-center">Нет данных</p>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            {data.salesByCategory.map((cat, i) => (
                                                <div key={i}>
                                                    <div className="flex items-center justify-between mb-1.5 text-sm">
                                                        <span className="font-medium">{getCategoryLabel(cat.category)}</span>
                                                        <span className="text-muted-foreground">
                                                            {cat.count} шт. — {formatPrice(cat.revenue)} ({cat.percentage}%)
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                        <div
                                                            className="h-2.5 rounded-full transition-all"
                                                            style={{
                                                                width: `${cat.percentage}%`,
                                                                backgroundColor: categoryColors[i % categoryColors.length],
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Quick insight */}
                                        <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                                            <p className="text-xs font-semibold text-purple-700 mb-1">Быстрый инсайт</p>
                                            <p className="text-xs text-purple-600/80">
                                                {data.salesByCategory[0]
                                                    ? `Категория «${getCategoryLabel(data.salesByCategory[0].category)}» — лидер с ${data.salesByCategory[0].percentage}% продаж и выручкой ${formatPrice(data.salesByCategory[0].revenue)}.`
                                                    : "Добавьте данные, чтобы увидеть инсайты."}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ══════ Recent Activity ══════ */}
                        <div className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
                                <h2 className="font-bold text-lg">Последние заказы</h2>
                                <Link href="/admin/orders" className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
                                    Все заказы →
                                </Link>
                            </div>

                            {data.recentActivity.length === 0 ? (
                                <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                                    Нет заказов за выбранный период
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {data.recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/20 transition-colors">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${getStatusColor(activity.status)}`} />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate">{activity.customer}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {activity.robloxUsername} · {activity.itemCount} товар{activity.itemCount === 1 ? "" : activity.itemCount < 5 ? "а" : "ов"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-4">
                                                <p className="font-bold text-sm text-green-600">{formatPrice(activity.amount)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(activity.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ══════ Quick Stats Footer ══════ */}
                        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MiniStat label="Всего товаров" value={String(data.stats.totalProducts)} />
                            <MiniStat label="Новых клиентов" value={`+${data.stats.newCustomers}`} />
                            <MiniStat label="Выполненных" value={String(data.statusCounts.completed || 0)} />
                            <MiniStat label="В обработке" value={String(data.statusCounts.processing || 0)} />
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}

/* ── Sub-components ───────────────────────────────── */

function KPICard({
    icon,
    iconBg,
    label,
    value,
    sub,
    change,
}: {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    value: string;
    sub?: string;
    change: number;
}) {
    const isPositive = change >= 0;
    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
                <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-lg ${isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                    {Math.abs(change)}%
                </span>
            </div>
            <p className="text-2xl font-bold leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub ?? label}</p>
        </div>
    );
}

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
    );
}
