"use client";

import { X, Filter } from "./icons";
import { Filters } from "./filters-sidebar";

interface MobileFiltersDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    filters: Filters;
    onFiltersChange: (filters: Filters) => void;
}

export function MobileFiltersDrawer({
    isOpen,
    onClose,
    filters,
    onFiltersChange,
}: MobileFiltersDrawerProps) {
    if (!isOpen) return null;

    const rarities = ["common", "rare", "epic", "legendary", "godly"];
    const rarityLabels: Record<string, string> = {
        common: "обычная",
        rare: "редкая",
        epic: "эпическая",
        legendary: "легендарная",
        godly: "божественная",
    };
    const sortOptions = [
        { value: "newest", label: "Новые" },
        { value: "price-low", label: "Дешевле" },
        { value: "price-high", label: "Дороже" },
        { value: "popular", label: "Популярные" },
    ];

    const handleClearAll = () => {
        onFiltersChange({
            category: "all",
            game: "all",
            minPrice: null,
            maxPrice: null,
            rarities: [],
            sortBy: "newest",
        });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 backdrop-animate lg:hidden"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="drawer-left fixed left-0 top-0 h-full w-full sm:w-[400px] bg-white z-50 flex flex-col lg:hidden" style={{ boxShadow: '8px 0 40px rgba(0,0,0,0.15)' }}>
                {/* Header — gradient like cart drawer */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-5" style={{ boxShadow: '0 4px 20px rgba(147,51,234,0.25)' }}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                            <Filter className="h-5 w-5" />
                            Фильтры
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2.5 -m-1 hover:bg-white/20 rounded-xl transition-colors active:scale-90"
                        >
                            <X className="h-5 w-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Filters Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 bg-gray-50">
                    {/* Sort By — dropdown */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Сортировка</label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) =>
                                onFiltersChange({ ...filters, sortBy: e.target.value })
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        >
                            {sortOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Диапазон цен</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <input
                                    type="number"
                                    placeholder="Мин."
                                    value={filters.minPrice ?? ""}
                                    onChange={(e) =>
                                        onFiltersChange({
                                            ...filters,
                                            minPrice: e.target.value === "" ? null : parseInt(e.target.value),
                                        })
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    placeholder="Макс."
                                    value={filters.maxPrice ?? ""}
                                    onChange={(e) =>
                                        onFiltersChange({
                                            ...filters,
                                            maxPrice: e.target.value === "" ? null : parseInt(e.target.value),
                                        })
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rarity */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Редкость</label>
                        <div className="space-y-1 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                            {rarities.map((rarity) => (
                                <label key={rarity} className="flex items-center gap-3 cursor-pointer py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors active:bg-gray-100">
                                    <input
                                        type="checkbox"
                                        checked={filters.rarities.includes(rarity)}
                                        onChange={(e) => {
                                            const newRarities = e.target.checked
                                                ? [...filters.rarities, rarity]
                                                : filters.rarities.filter((r) => r !== rarity);
                                            onFiltersChange({ ...filters, rarities: newRarities });
                                        }}
                                        className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500/20"
                                    />
                                    <span className="text-sm capitalize font-medium text-gray-800">{rarityLabels[rarity] ?? rarity}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-4 sm:p-5 space-y-3 bg-white" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}>
                    <button
                        onClick={handleClearAll}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.97]"
                    >
                        Сбросить фильтры
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-bold text-white transition-all hover:from-purple-700 hover:to-pink-700 active:scale-[0.97]"
                        style={{ boxShadow: '0 4px 20px rgba(147,51,234,0.3)' }}
                    >
                        Применить
                    </button>
                </div>
            </div>
        </>
    );
}
