"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Edit, Trash, Search, X } from "@/components/icons";
import { useAuth } from "@/components/ui/auth-context";

interface PromoCode {
    id: string;
    code: string;
    discountPercent: number;
    maxUses: number;
    usedCount: number;
    expiresAt: string | null;
    active: boolean;
    createdAt: string;
}

export default function AdminPromoCodesPage() {
    const router = useRouter();
    const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

    const [codes, setCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

    /* ── modal state ──────────────────────────── */
    const [showModal, setShowModal] = useState(false);
    const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
    const [formCode, setFormCode] = useState("");
    const [formDiscount, setFormDiscount] = useState("");
    const [formMaxUses, setFormMaxUses] = useState("");
    const [formExpires, setFormExpires] = useState("");
    const [formActive, setFormActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    /* ── auth guard ───────────────────────────── */
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) router.push("/login");
            else if (!isAdmin) router.push("/account");
        }
    }, [isAuthenticated, isAdmin, authLoading, router]);

    /* ── fetch codes ──────────────────────────── */
    const fetchCodes = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/promo-codes?adminId=${user.id}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setCodes(data.codes ?? []);
        } catch {
            console.error("Failed to load promo codes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id && isAdmin) fetchCodes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, isAdmin]);

    /* ── filtered list ────────────────────────── */
    const visible = useMemo(() => {
        let base = codes;
        if (statusFilter === "active") base = base.filter((c) => c.active);
        if (statusFilter === "inactive") base = base.filter((c) => !c.active);

        const q = searchQuery.trim().toLowerCase();
        if (q) base = base.filter((c) => c.code.toLowerCase().includes(q));

        return base;
    }, [codes, statusFilter, searchQuery]);

    /* ── open modal ───────────────────────────── */
    const openCreate = () => {
        setEditingCode(null);
        setFormCode("");
        setFormDiscount("");
        setFormMaxUses("0");
        setFormExpires("");
        setFormActive(true);
        setFormError("");
        setShowModal(true);
    };

    const openEdit = (promo: PromoCode) => {
        setEditingCode(promo);
        setFormCode(promo.code);
        setFormDiscount(String(promo.discountPercent));
        setFormMaxUses(String(promo.maxUses));
        setFormExpires(promo.expiresAt ? promo.expiresAt.slice(0, 10) : "");
        setFormActive(promo.active);
        setFormError("");
        setShowModal(true);
    };

    /* ── save (create / update) ───────────────── */
    const handleSave = async () => {
        if (!user?.id) return;
        const code = formCode.trim();
        const discountPercent = parseInt(formDiscount, 10);
        const maxUses = parseInt(formMaxUses, 10) || 0;

        if (!code) { setFormError("Укажите код"); return; }
        if (!discountPercent || discountPercent < 1 || discountPercent > 100) {
            setFormError("Скидка должна быть от 1 до 100%");
            return;
        }

        setSaving(true);
        setFormError("");

        try {
            const payload = {
                adminId: user.id,
                id: editingCode?.id,
                code,
                discountPercent,
                maxUses,
                expiresAt: formExpires || null,
                active: formActive,
            };

            const res = await fetch("/api/admin/promo-codes", {
                method: editingCode ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Ошибка");

            setShowModal(false);
            await fetchCodes();
        } catch (e) {
            setFormError(e instanceof Error ? e.message : "Не удалось сохранить");
        } finally {
            setSaving(false);
        }
    };

    /* ── delete ────────────────────────────────── */
    const handleDelete = async (id: string) => {
        if (!user?.id) return;
        if (!confirm("Удалить этот промокод?")) return;

        try {
            const res = await fetch(`/api/admin/promo-codes?adminId=${user.id}&id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setCodes((prev) => prev.filter((c) => c.id !== id));
        } catch {
            alert("Не удалось удалить промокод");
        }
    };

    /* ── toggle active ────────────────────────── */
    const handleToggleActive = async (promo: PromoCode) => {
        if (!user?.id) return;
        try {
            const res = await fetch("/api/admin/promo-codes", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    adminId: user.id,
                    id: promo.id,
                    code: promo.code,
                    discountPercent: promo.discountPercent,
                    maxUses: promo.maxUses,
                    expiresAt: promo.expiresAt,
                    active: !promo.active,
                }),
            });
            if (!res.ok) throw new Error();
            setCodes((prev) =>
                prev.map((c) => (c.id === promo.id ? { ...c, active: !c.active } : c))
            );
        } catch {
            alert("Не удалось обновить статус");
        }
    };

    /* ── helpers ───────────────────────────────── */
    const isExpired = (promo: PromoCode) => {
        if (!promo.expiresAt) return false;
        return new Date(promo.expiresAt) < new Date();
    };

    const isUsedUp = (promo: PromoCode) => {
        if (promo.maxUses === 0) return false;
        return promo.usedCount >= promo.maxUses;
    };

    if (authLoading || !isAuthenticated || !isAdmin) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Назад к панели
                        </Link>
                        <h1 className="text-3xl font-bold">Управление промокодами</h1>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-semibold text-white shadow transition-all hover:from-purple-700 hover:to-pink-700 active:scale-95"
                    >
                        <Plus className="h-5 w-5" />
                        Создать промокод
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative max-w-xs flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Поиск по коду…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-border bg-background text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Статус</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                            className="h-10 rounded-md border border-border bg-background px-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        >
                            <option value="all">Все</option>
                            <option value="active">Активные</option>
                            <option value="inactive">Неактивные</option>
                        </select>
                    </div>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-8 w-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Promo Codes Grid */}
                        {visible.length === 0 ? (
                            <div className="rounded-lg border border-border bg-card p-12 text-center">
                                <p className="text-muted-foreground">
                                    {codes.length === 0 ? "Промокодов ещё нет. Создайте первый!" : "Промокоды не найдены."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visible.map((promo) => {
                                    const expired = isExpired(promo);
                                    const usedUp = isUsedUp(promo);
                                    const effectivelyActive = promo.active && !expired && !usedUp;

                                    return (
                                        <div
                                            key={promo.id}
                                            className={`rounded-xl border bg-card p-6 transition-shadow hover:shadow-md ${
                                                effectivelyActive ? "border-border" : "border-muted opacity-70"
                                            }`}
                                        >
                                            {/* Code + Badge */}
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-2xl font-mono font-bold tracking-wide">{promo.code}</span>
                                                <div className="flex items-center gap-2">
                                                    {expired && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-600">
                                                            ИСТЁК
                                                        </span>
                                                    )}
                                                    {usedUp && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-600">
                                                            ИСЧЕРПАН
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => handleToggleActive(promo)}
                                                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                                                            promo.active
                                                                ? "bg-green-600 text-white hover:bg-green-700"
                                                                : "bg-gray-500 text-white hover:bg-gray-600"
                                                        }`}
                                                        title={promo.active ? "Нажмите чтобы выключить" : "Нажмите чтобы включить"}
                                                    >
                                                        {promo.active ? "АКТИВЕН" : "ВЫКЛЮЧЕН"}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Discount */}
                                            <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-600/20">
                                                <p className="text-sm text-muted-foreground mb-1">Скидка</p>
                                                <p className="text-3xl font-bold text-purple-600">{promo.discountPercent}%</p>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Использования</p>
                                                    <p className="text-lg font-semibold">
                                                        {promo.usedCount}/{promo.maxUses === 0 ? "∞" : promo.maxUses}
                                                    </p>
                                                    {promo.maxUses > 0 && (
                                                        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                                            <div
                                                                className={`h-1.5 rounded-full transition-all ${
                                                                    usedUp ? "bg-red-500" : "bg-purple-600"
                                                                }`}
                                                                style={{
                                                                    width: `${Math.min(100, (promo.usedCount / promo.maxUses) * 100)}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Срок действия</p>
                                                    <p className={`text-sm font-medium ${expired ? "text-red-600" : ""}`}>
                                                        {promo.expiresAt
                                                            ? new Date(promo.expiresAt).toLocaleDateString("ru-RU")
                                                            : "Бессрочно"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Created date */}
                                            <p className="text-xs text-muted-foreground mb-4">
                                                Создан: {new Date(promo.createdAt).toLocaleDateString("ru-RU")}
                                            </p>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEdit(promo)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    Изменить
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(promo.id)}
                                                    className="px-3 py-2 rounded-lg border border-border hover:bg-red-50 transition-colors text-red-600"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Summary */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Всего</p>
                                <p className="text-2xl font-bold">{codes.length}</p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Активных</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {codes.filter((c) => c.active).length}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Использований</p>
                                <p className="text-2xl font-bold">
                                    {codes.reduce((s, c) => s + c.usedCount, 0)}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Ср. скидка</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {codes.length > 0
                                        ? Math.round(codes.reduce((s, c) => s + c.discountPercent, 0) / codes.length)
                                        : 0}%
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ════════ Modal ════════ */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
                    <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white rounded-t-xl">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                                    <span className="text-white text-sm font-bold">%</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {editingCode ? "Редактировать промокод" : "Новый промокод"}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-5">
                            {formError && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                                    {formError}
                                </div>
                            )}

                            {/* Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Код промокода</label>
                                <input
                                    type="text"
                                    value={formCode}
                                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                                    placeholder="SUMMER50"
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-mono uppercase text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            {/* Discount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Скидка (%)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={formDiscount}
                                    onChange={(e) => setFormDiscount(e.target.value)}
                                    placeholder="20"
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            {/* Max uses */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Макс. использований <span className="text-gray-400 font-normal">(0 = безлимит)</span>
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={formMaxUses}
                                    onChange={(e) => setFormMaxUses(e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            {/* Expiry */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Срок действия <span className="text-gray-400 font-normal">(необязательно)</span>
                                </label>
                                <input
                                    type="date"
                                    value={formExpires}
                                    onChange={(e) => setFormExpires(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <label className="text-sm font-medium text-gray-700">Активен</label>
                                <button
                                    type="button"
                                    onClick={() => setFormActive(!formActive)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        formActive ? "bg-green-500" : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            formActive ? "translate-x-6" : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80 rounded-b-xl">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-xl hover:shadow-purple-500/30 active:scale-95 disabled:opacity-50"
                            >
                                {saving ? "Сохранение…" : editingCode ? "Сохранить" : "Создать"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
