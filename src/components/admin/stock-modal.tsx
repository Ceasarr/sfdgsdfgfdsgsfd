"use client";

import { useState, useMemo } from "react";
import { X, Search, Package, AlertCircle } from "@/components/icons";
import { formatPrice, getRarityColor } from "@/lib/utils";

interface Product {
    id: string;
    name: string;
    category: string;
    rarity: string;
    stock: number;
    price: number;
    image: string;
}

interface StockModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    onDone: () => void; // called after successful update to refresh the list
}

const rarityLabels: Record<string, string> = {
    common: "обычная",
    rare: "редкая",
    epic: "эпическая",
    legendary: "легендарная",
    godly: "божественная",
};

export function StockModal({ isOpen, onClose, products, onDone }: StockModalProps) {
    /* ── filters ─────────────────────────── */
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [rarityFilter, setRarityFilter] = useState<string>("all");

    /* ── selection ────────────────────────── */
    const [selected, setSelected] = useState<Set<string>>(new Set());

    /* ── quantity ─────────────────────────── */
    const [quantity, setQuantity] = useState<number>(1);

    /* ── submission ───────────────────────── */
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resultMsg, setResultMsg] = useState<string | null>(null);

    /* ── filtered list ───────────────────── */
    const filtered = useMemo(() => {
        return products.filter((p) => {
            if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
            if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
            if (rarityFilter !== "all" && p.rarity !== rarityFilter) return false;
            return true;
        });
    }, [products, search, categoryFilter, rarityFilter]);

    /* ── helpers ──────────────────────────── */
    const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));

    const toggleOne = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (allFilteredSelected) {
            // deselect all visible
            setSelected((prev) => {
                const next = new Set(prev);
                filtered.forEach((p) => next.delete(p.id));
                return next;
            });
        } else {
            // select all visible
            setSelected((prev) => {
                const next = new Set(prev);
                filtered.forEach((p) => next.add(p.id));
                return next;
            });
        }
    };

    /* ── submit ───────────────────────────── */
    const handleSubmit = async () => {
        if (selected.size === 0 || quantity <= 0) return;
        setIsSubmitting(true);
        setResultMsg(null);

        try {
            const res = await fetch("/api/admin/products/bulk-stock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productIds: Array.from(selected),
                    quantity,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || "Ошибка сервера");
            }

            const data = await res.json();
            setResultMsg(data.message);
            setSelected(new Set());
            onDone();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Не удалось обновить остатки";
            setResultMsg(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── close & reset ───────────────────── */
    const handleClose = () => {
        setSearch("");
        setCategoryFilter("all");
        setRarityFilter("all");
        setSelected(new Set());
        setQuantity(1);
        setResultMsg(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300">
            <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl border border-gray-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                {/* ── Header ───────────────────────── */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Добавить остатки
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Выберите товары и укажите сколько единиц добавить к текущему остатку
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* ── Filters ──────────────────────── */}
                <div className="px-6 pt-4 pb-3 space-y-3 border-b border-gray-100">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Поиск по названию…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-gray-900 shadow-sm"
                        />
                    </div>

                    {/* Category + Rarity row */}
                    <div className="flex gap-3">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-gray-900 shadow-sm"
                        >
                            <option value="all">Все категории</option>
                            <option value="Robux">Robux</option>
                            <option value="Items">Предметы</option>
                        </select>

                        <select
                            value={rarityFilter}
                            onChange={(e) => setRarityFilter(e.target.value)}
                            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-gray-900 shadow-sm"
                        >
                            <option value="all">Все редкости</option>
                            <option value="common">Обычная</option>
                            <option value="rare">Редкая</option>
                            <option value="epic">Эпическая</option>
                            <option value="legendary">Легендарная</option>
                            <option value="godly">Божественная</option>
                        </select>
                    </div>

                    {/* Select all toggle + counter */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={allFilteredSelected}
                                onChange={toggleAll}
                                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">
                                Выбрать все ({filtered.length})
                            </span>
                        </label>
                        <span className="text-xs text-gray-400">
                            Выбрано: {selected.size}
                        </span>
                    </div>
                </div>

                {/* ── Product list ──────────────────── */}
                <div className="flex-1 overflow-y-auto px-6 py-3 space-y-1.5 min-h-0" style={{ maxHeight: "340px" }}>
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Package className="h-10 w-10 mb-2 opacity-50" />
                            <p className="text-sm">Товары не найдены</p>
                        </div>
                    ) : (
                        filtered.map((product) => {
                            const isChecked = selected.has(product.id);
                            return (
                                <label
                                    key={product.id}
                                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                                        isChecked
                                            ? "border-purple-300 bg-purple-50/60"
                                            : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleOne(product.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0"
                                    />

                                    {/* Thumbnail */}
                                    <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-lg">
                                                {product.category === "Robux" ? "💎" : "🔪"}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {product.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span
                                                className={`${getRarityColor(product.rarity)} inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold text-white capitalize`}
                                            >
                                                {rarityLabels[product.rarity] ?? product.rarity}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {product.category === "Robux" ? "Robux" : "Предметы"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Current stock */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs text-gray-400">Остаток</p>
                                        <p
                                            className={`text-sm font-bold ${
                                                product.stock > 50
                                                    ? "text-green-500"
                                                    : product.stock > 0
                                                    ? "text-yellow-500"
                                                    : "text-red-500"
                                            }`}
                                        >
                                            {product.stock}
                                        </p>
                                    </div>
                                </label>
                            );
                        })
                    )}
                </div>

                {/* ── Footer: quantity input + submit ─ */}
                <div className="border-t border-gray-100 px-6 py-4 space-y-3">
                    {resultMsg && (
                        <div className="flex items-center gap-2 rounded-lg bg-purple-50 border border-purple-200 px-3 py-2 text-sm text-purple-700">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {resultMsg}
                        </div>
                    )}

                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Добавить к остатку
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-gray-900 shadow-sm"
                                placeholder="Кол-во"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium transition-all hover:bg-gray-50 text-gray-700 shadow-sm"
                            >
                                Закрыть
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || selected.size === 0 || quantity <= 0}
                                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-semibold text-white shadow-lg shadow-purple-900/10 transition-all hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Обновление…
                                    </>
                                ) : (
                                    <>
                                        <Package className="h-4 w-4" />
                                        Добавить +{quantity} к {selected.size} товар
                                        {selected.size === 1 ? "у" : "ам"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
