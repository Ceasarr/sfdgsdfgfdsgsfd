"use client";

import { Filter } from "./icons";

export interface Filters {
    category: string;
    game: string;
    minPrice: number | null;
    maxPrice: number | null;
    rarities: string[];
    sortBy: string;
}

const GAME_OPTIONS = [
    { value: "all", label: "Все игры" },
    { value: "Steal a brainrot", label: "Steal a brainrot" },
    { value: "Murder mistery 2", label: "Murder mistery 2" },
    { value: "Grow a garden", label: "Grow a garden" },
    { value: "Adopt me", label: "Adopt me" },
    { value: "Escape tsunami for brainrots!", label: "Escape tsunami for brainrots!" },
    { value: "Toilet tower defense", label: "Toilet tower defense" },
    { value: "Blox fruits", label: "Blox fruits" },
    { value: "Break a lucky block!", label: "Break a lucky block!" },
];

interface FiltersSidebarProps {
    filters: Filters;
    onFilterChange: (filters: Filters) => void;
}

export function FiltersSidebar({ filters, onFilterChange }: FiltersSidebarProps) {
    const rarities = ["common", "rare", "epic", "legendary", "godly"];
    const rarityLabels: Record<string, string> = {
        common: "обычная",
        rare: "редкая",
        epic: "эпическая",
        legendary: "легендарная",
        godly: "божественная",
    };
    const handleRarityToggle = (rarity: string) => {
        const newRarities = filters.rarities.includes(rarity)
            ? filters.rarities.filter((r) => r !== rarity)
            : [...filters.rarities, rarity];
        onFilterChange({ ...filters, rarities: newRarities });
    };

    const handleClearFilters = () => {
        onFilterChange({
            category: "all",
            game: "all",
            minPrice: null,
            maxPrice: null,
            rarities: [],
            sortBy: "newest",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <Filter className="h-5 w-5" />
                    Фильтры
                </h2>
                <button
                    onClick={handleClearFilters}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                    Очистить все
                </button>
            </div>

            {/* Game */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Игра</label>
                <select
                    value={filters.game}
                    onChange={(e) => onFilterChange({ ...filters, game: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                    {GAME_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Диапазон цен</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={filters.minPrice ?? ""}
                        onChange={(e) => onFilterChange({ ...filters, minPrice: e.target.value === "" ? null : Number(e.target.value) })}
                        placeholder="Мин"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                        type="number"
                        value={filters.maxPrice ?? ""}
                        onChange={(e) => onFilterChange({ ...filters, maxPrice: e.target.value === "" ? null : Number(e.target.value) })}
                        placeholder="Макс"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                </div>
            </div>

            {/* Rarity */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Редкость</label>
                <div className="space-y-2">
                    {rarities.map((rarity) => (
                        <label key={rarity} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.rarities.includes(rarity)}
                                onChange={() => handleRarityToggle(rarity)}
                                className="h-4 w-4 rounded border-border bg-background text-purple-600 focus:ring-2 focus:ring-purple-500/20"
                            />
                            <span className="text-sm capitalize">{rarityLabels[rarity] ?? rarity}</span>
                        </label>
                    ))}
                </div>
            </div>

        </div>
    );
}
