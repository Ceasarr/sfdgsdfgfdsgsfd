"use client";

import { useMemo, useState, useEffect } from "react";
import { HeroBanner } from "@/components/hero-banner";
import { SearchBar } from "@/components/search-bar";
import { FiltersSidebar, Filters } from "@/components/filters-sidebar";
import { MobileFiltersDrawer } from "@/components/mobile-filters-drawer";
import { ProductCard } from "@/components/product-card";
import { Filter } from "@/components/icons";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: "all",
    game: "all",
    minPrice: null,
    maxPrice: null,
    rarities: [],
    sortBy: "newest",
  });

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Не удалось загрузить товары");
        const data = await res.json();
        // Convert createdAt string to Date object
        const productsWithDates = data.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt)
        }));
        setProducts(productsWithDates);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    // Apply game filter
    if (filters.game !== "all") {
      filtered = filtered.filter((p: any) => p.game === filters.game);
    }

    // Apply price filter (only when values are entered)
    if (filters.minPrice !== null) {
      filtered = filtered.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== null) {
      filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
    }

    // Apply rarity filter
    if (filters.rarities.length > 0) {
      filtered = filtered.filter((p) => filters.rarities.includes(p.rarity));
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "popular":
        // In production, this would sort by actual popularity metrics
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    return filtered;
  }, [products, searchQuery, filters]);

  const sortOptions = [
    { value: "newest", label: "Новые" },
    { value: "price-low", label: "Дешевле" },
    { value: "price-high", label: "Дороже" },
    { value: "popular", label: "Популярные" },
  ];

  const gameOptions = [
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

  return (
    <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-5 sm:space-y-8">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Mobile: Search Bar (full width, stays as before) */}
        <div className="lg:hidden">
          <SearchBar onSearch={setSearchQuery} />
        </div>

        {/* Main Content: Filters + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <FiltersSidebar filters={filters} onFilterChange={setFilters} />
            </div>
          </aside>

          {/* Products Column */}
          <div className="space-y-4">
            {/* Desktop: Sort pills + Search row, aligned with product grid */}
            <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-5 items-center">
              {/* Sort pills — first columns (1-2 on xl, 1 on lg) */}
              <div className="xl:col-span-2 lg:col-span-1 flex items-center gap-1.5 flex-wrap">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilters({ ...filters, sortBy: opt.value })}
                    className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap ${
                      filters.sortBy === opt.value
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20"
                        : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 shadow-sm"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {/* Search — last columns (3-4 on xl, 2-3 on lg) */}
              <div className="xl:col-span-2 lg:col-span-2">
                <SearchBar onSearch={setSearchQuery} />
              </div>
            </div>

            {/* Desktop: Count */}
            <p className="hidden lg:block text-sm text-muted-foreground">
              {isLoading ? "Загрузка товаров..." : `${filteredProducts.length} ${filteredProducts.length === 1 ? "товар" : "товаров"} найдено`}
            </p>

            {/* Mobile: Game dropdown + Filters button */}
            <div className="lg:hidden flex items-center gap-2">
              {/* Game dropdown */}
              <select
                value={filters.game}
                onChange={(e) => setFilters({ ...filters, game: e.target.value })}
                className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                {gameOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Mobile Filters Button */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold transition-all hover:bg-muted active:scale-95 shadow-sm"
              >
                <Filter className="h-4 w-4" />
                Фильтры
                {(filters.category !== "all" ||
                  filters.rarities.length > 0 ||
                  filters.minPrice !== null ||
                  filters.maxPrice !== null) && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white">
                      !
                    </span>
                  )}
              </button>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                    <div className="aspect-square skeleton-shimmer" />
                    <div className="p-3 sm:p-4 space-y-2.5">
                      <div className="h-3.5 w-3/4 skeleton-shimmer rounded-md" />
                      <div className="h-3 w-1/2 skeleton-shimmer rounded-md" />
                      <div className="h-5 w-1/3 skeleton-shimmer rounded-md mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg font-medium text-muted-foreground">
                  Товары не найдены
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Попробуйте изменить фильтры или запрос поиска
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileFiltersDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </main>
  );
}
