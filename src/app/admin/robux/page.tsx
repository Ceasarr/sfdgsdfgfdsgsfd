"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash, Edit, DollarSign } from "@/components/icons";
import { useAuth } from "@/components/ui/auth-context";
import { formatPrice } from "@/lib/utils";

interface RobuxItem {
    id?: string;
    amount: number;
    price: number;
    active: boolean;
}

export default function AdminRobuxPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<RobuxItem[]>([]);
    const [gamepassRate, setGamepassRate] = useState(0.9);
    const [gamepassRateInput, setGamepassRateInput] = useState("0.90");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");

    /* ── modal state ─────────────────────────────── */
    const [showModal, setShowModal] = useState(false);
    const [editIdx, setEditIdx] = useState<number | null>(null);
    const [modalAmount, setModalAmount] = useState("");
    const [modalPrice, setModalPrice] = useState("");
    const [modalActive, setModalActive] = useState(true);

    /* ── fetch ────────────────────────────────────── */
    const fetchData = async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            const res = await fetch(`/api/admin/robux?adminId=${user.id}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setItems(data.items ?? []);
            const rate = data.gamepassRate ?? 0.9;
            setGamepassRate(rate);
            setGamepassRateInput(rate.toFixed(2));
        } catch {
            console.error("Failed to load robux data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    /* ── save all ─────────────────────────────────── */
    const handleSave = async () => {
        if (!user?.id) return;
        try {
            setIsSaving(true);
            const res = await fetch("/api/admin/robux", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminId: user.id, items, gamepassRate }),
            });
            if (!res.ok) throw new Error();
            setStatusMsg("Сохранено!");
            setTimeout(() => setStatusMsg(""), 3000);
            await fetchData();
        } catch {
            setStatusMsg("Ошибка при сохранении");
            setTimeout(() => setStatusMsg(""), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    /* ── delete item ──────────────────────────────── */
    const handleDelete = async (amount: number) => {
        if (!user?.id) return;
        if (!confirm(`Удалить позицию ${amount} Robux?`)) return;
        try {
            const res = await fetch(`/api/admin/robux?adminId=${user.id}&amount=${amount}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setItems((prev) => prev.filter((i) => i.amount !== amount));
        } catch {
            alert("Не удалось удалить");
        }
    };

    /* ── modal helpers ────────────────────────────── */
    const openCreateModal = () => {
        setEditIdx(null);
        setModalAmount("");
        setModalPrice("");
        setModalActive(true);
        setShowModal(true);
    };

    const openEditModal = (idx: number) => {
        const item = items[idx];
        setEditIdx(idx);
        setModalAmount(String(item.amount));
        setModalPrice(String(item.price));
        setModalActive(item.active);
        setShowModal(true);
    };

    const handleModalSave = () => {
        const amount = parseInt(modalAmount, 10);
        const price = parseInt(modalPrice, 10);
        if (!amount || amount <= 0 || !price || price <= 0) {
            alert("Заполните корректно количество Robux и цену");
            return;
        }

        if (editIdx !== null) {
            // editing
            setItems((prev) =>
                prev.map((item, i) => (i === editIdx ? { ...item, amount, price, active: modalActive } : item))
            );
        } else {
            // creating
            if (items.some((i) => i.amount === amount)) {
                alert(`Позиция на ${amount} Robux уже существует`);
                return;
            }
            setItems((prev) => [...prev, { amount, price, active: modalActive }].sort((a, b) => a.amount - b.amount));
        }
        setShowModal(false);
    };

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                        <h1 className="text-3xl font-bold">Robux — Управление</h1>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-8 w-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* ════════ Section 1: Digital Code Top-Up Items ════════ */}
                        <section className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">⚡</span>
                                    <div>
                                        <h2 className="font-bold text-lg">Пополнение через цифровой код</h2>
                                        <p className="text-xs text-muted-foreground">Фиксированные позиции с индивидуальной ценой (не зависят от курса геймпасса)</p>
                                    </div>
                                </div>
                                <button
                                    onClick={openCreateModal}
                                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:shadow-lg active:scale-95"
                                >
                                    <Plus className="h-4 w-4" />
                                    Добавить
                                </button>
                            </div>

                            <div className="divide-y divide-border">
                                {items.length === 0 ? (
                                    <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                                        Нет позиций. Нажмите «Добавить», чтобы создать.
                                    </div>
                                ) : (
                                    items.map((item, idx) => (
                                        <div key={item.amount} className="flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 text-lg">
                                                    💎
                                                </div>
                                                <div>
                                                    <p className="font-bold">{item.amount.toLocaleString("ru-RU")} Robux</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(item.price / item.amount).toFixed(2)} ₽ за 1 R$
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded ${item.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                    {item.active ? "Активна" : "Выключена"}
                                                </span>
                                                <span className="font-bold text-lg">{formatPrice(item.price)}</span>
                                                <button onClick={() => openEditModal(idx)} className="p-2 rounded-lg hover:bg-muted transition-colors text-blue-600">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(item.amount)} className="p-2 rounded-lg hover:bg-muted transition-colors text-red-600">
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* ════════ Section 2: Gamepass Rate ════════ */}
                        <section className="rounded-xl border border-border bg-card p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <span className="text-xl">🎮</span>
                                <div>
                                    <h2 className="font-bold text-lg">Пополнение геймпассом</h2>
                                    <p className="text-xs text-muted-foreground">
                                        Стоимость 1 Robux в рублях для пополнения через геймпасс
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="relative flex-1 max-w-xs">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={gamepassRateInput}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            // Allow digits, one dot, up to 2 decimal places
                                            if (/^\d*\.?\d{0,2}$/.test(raw)) {
                                                setGamepassRateInput(raw);
                                                const n = parseFloat(raw);
                                                if (!isNaN(n) && n > 0) {
                                                    setGamepassRate(n);
                                                }
                                            }
                                        }}
                                        onBlur={() => {
                                            const n = parseFloat(gamepassRateInput);
                                            if (isNaN(n) || n <= 0) {
                                                setGamepassRate(0.01);
                                                setGamepassRateInput("0.01");
                                            } else {
                                                setGamepassRate(n);
                                                setGamepassRateInput(n.toFixed(2));
                                            }
                                        }}
                                        placeholder="0.90"
                                        className="w-full pl-10 pr-14 py-3 rounded-lg border border-border bg-background text-lg font-bold focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                                        ₽ / 1 R$
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p>Пример: 1000 R$ = <span className="font-bold text-foreground">{formatPrice(Math.round(1000 * gamepassRate))}</span></p>
                                </div>
                            </div>
                        </section>

                        {/* ════════ Save Button ════════ */}
                        <div className="flex items-center justify-end gap-4">
                            {statusMsg && (
                                <span className={`text-sm font-semibold ${statusMsg.includes("Ошибка") ? "text-red-600" : "text-green-600"}`}>
                                    {statusMsg}
                                </span>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-xl disabled:opacity-50"
                            >
                                {isSaving ? "Сохранение…" : "Сохранить всё"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ════════ Modal ════════ */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-5">
                            {editIdx !== null ? "Редактировать позицию" : "Новая позиция"}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Количество Robux</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={modalAmount}
                                    onChange={(e) => setModalAmount(e.target.value)}
                                    placeholder="Например 800"
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Цена (₽)</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={modalPrice}
                                    onChange={(e) => setModalPrice(e.target.value)}
                                    placeholder="Например 880"
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium">Активна</label>
                                <button
                                    type="button"
                                    onClick={() => setModalActive(!modalActive)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        modalActive ? "bg-green-500" : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            modalActive ? "translate-x-6" : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleModalSave}
                                className="px-6 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow transition-all hover:shadow-lg active:scale-95"
                            >
                                {editIdx !== null ? "Сохранить" : "Добавить"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
