"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash, Package, Search } from "@/components/icons";
import { formatPrice, getRarityColor } from "@/lib/utils";
import { ProductModal } from "@/components/admin/product-modal";
import { StockModal } from "@/components/admin/stock-modal";

interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    oldPrice?: number | null;
    rarity: string;
    category: string;
    game?: string;
    stock: number;
    image: string;
    createdAt: Date;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [pageSize, setPageSize] = useState<number>(0); // 0 = all
    const [categoryFilter, setCategoryFilter] = useState<"all" | "Robux" | "Items">("all");
    const [rarityFilter, setRarityFilter] = useState<string>("all");
    const [gameFilter, setGameFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch products
    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/products");
            if (!res.ok) throw new Error("Не удалось загрузить товары");
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
            alert("Не удалось загрузить товары. Попробуйте ещё раз.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Create product
    const handleCreate = async (productData: Omit<Product, "id" | "slug" | "createdAt">) => {
        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData),
            });

            if (!res.ok) throw new Error("Не удалось создать товар");

            await fetchProducts();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
    };

    // Update product
    const handleUpdate = async (productData: Omit<Product, "id" | "slug" | "createdAt">) => {
        if (!selectedProduct) return;

        try {
            const res = await fetch(`/api/products/${selectedProduct.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData),
            });

            if (!res.ok) throw new Error("Не удалось обновить товар");

            await fetchProducts();
            setIsModalOpen(false);
            setSelectedProduct(null);
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    };

    // Delete product
    const handleDelete = async (id: string) => {
        if (!confirm("Удалить этот товар?")) return;

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Не удалось удалить товар");

            await fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Не удалось удалить товар. Попробуйте ещё раз.");
        }
    };

    const rarityLabels: Record<string, string> = {
        common: "обычная",
        rare: "редкая",
        epic: "эпическая",
        legendary: "легендарная",
        godly: "божественная",
    };

    // Open modal for creating
    const openCreateModal = () => {
        setModalMode("create");
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    // Open modal for editing
    const openEditModal = (product: Product) => {
        setModalMode("edit");
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const visibleProducts = useMemo(() => {
        let base = products;

        // Category filter
        if (categoryFilter !== "all") {
            base = base.filter((p) => p.category === categoryFilter);
        }

        // Rarity filter
        if (rarityFilter !== "all") {
            base = base.filter((p) => p.rarity === rarityFilter);
        }

        // Game filter
        if (gameFilter !== "all") {
            if (gameFilter === "none") {
                base = base.filter((p) => !p.game);
            } else {
                base = base.filter((p) => p.game === gameFilter);
            }
        }

        // Search
        const q = searchQuery.trim().toLowerCase();
        if (q) {
            base = base.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
        }

        return pageSize === 0 ? base : base.slice(0, pageSize);
    }, [products, pageSize, categoryFilter, rarityFilter, gameFilter, searchQuery]);

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
                        <h1 className="text-3xl font-bold">Управление товарами</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsStockModalOpen(true)}
                            className="flex items-center gap-2 rounded-md border border-purple-500/30 bg-purple-50 px-4 py-2 font-semibold text-purple-700 shadow-sm transition-all hover:bg-purple-100"
                        >
                            <Package className="h-5 w-5" />
                            Добавить остатки
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-semibold text-white shadow transition-all hover:from-purple-700 hover:to-pink-700"
                        >
                            <Plus className="h-5 w-5" />
                            Добавить товар
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 mb-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Поиск по названию или описанию…"
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
                            <span className="text-sm text-muted-foreground">товаров</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Категория</span>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value as "all" | "Robux" | "Items")}
                                className="h-10 rounded-md border border-border bg-background px-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            >
                                <option value="all">Все</option>
                                <option value="Robux">Robux</option>
                                <option value="Items">Предметы</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Редкость</span>
                            <select
                                value={rarityFilter}
                                onChange={(e) => setRarityFilter(e.target.value)}
                                className="h-10 rounded-md border border-border bg-background px-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            >
                                <option value="all">Все</option>
                                <option value="common">Обычная</option>
                                <option value="rare">Редкая</option>
                                <option value="epic">Эпическая</option>
                                <option value="legendary">Легендарная</option>
                                <option value="godly">Божественная</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Игра</span>
                            <select
                                value={gameFilter}
                                onChange={(e) => setGameFilter(e.target.value)}
                                className="h-10 rounded-md border border-border bg-background px-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            >
                                <option value="all">Все</option>
                                <option value="none">Не выбрано</option>
                                <option value="Steal a brainrot">Steal a brainrot</option>
                                <option value="Murder mistery 2">Murder mistery 2</option>
                                <option value="Grow a garden">Grow a garden</option>
                                <option value="Adopt me">Adopt me</option>
                                <option value="Escape tsunami for brainrots!">Escape tsunami for brainrots!</option>
                                <option value="Toilet tower defense">Toilet tower defense</option>
                                <option value="Blox fruits">Blox fruits</option>
                                <option value="Break a lucky block!">Break a lucky block!</option>
                            </select>
                        </div>

                        {pageSize > 0 && visibleProducts.length < products.length && (
                            <span className="text-xs text-muted-foreground">
                                (показано {visibleProducts.length} из {products.length})
                            </span>
                        )}
                    </div>
                </div>

                {/* Loading state */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Products Table */}
                        <div className="rounded-lg border border-border bg-card overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 320px)" }}>
                            <div className="overflow-auto flex-1">
                                <table className="w-full">
                                    <thead className="bg-muted/50 border-b border-border sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Товар</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Категория</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Игра</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Редкость</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Цена</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold bg-muted/50">Остаток</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold bg-muted/50">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {visibleProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                                    Товары не найдены.
                                                </td>
                                            </tr>
                                        ) : (
                                            visibleProducts.map((product) => (
                                                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                {product.image ? (
                                                                    <img
                                                                        src={product.image}
                                                                        alt={product.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-lg">
                                                                        {product.category === "Robux" ? "💎" : "🔪"}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-sm truncate">{product.name}</p>
                                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                                    {product.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-600/10 text-blue-600">
                                                            {product.category === "Robux" ? "Robux" : "Предметы"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {product.game ? (
                                                            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100">
                                                                {product.game}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`${getRarityColor(
                                                                product.rarity
                                                            )} inline-block px-2 py-1 rounded text-xs font-semibold text-white capitalize`}
                                                        >
                                                            {rarityLabels[product.rarity] ?? product.rarity}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="font-semibold text-sm">{formatPrice(product.price)}</p>
                                                            {product.oldPrice && (
                                                                <p className="text-xs text-muted-foreground line-through">
                                                                    {formatPrice(product.oldPrice)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`font-medium text-sm ${
                                                                product.stock > 50 ? "text-green-500" : product.stock > 0 ? "text-yellow-500" : "text-red-500"
                                                            }`}
                                                        >
                                                            {product.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => openEditModal(product)}
                                                                className="p-2 rounded-md hover:bg-muted transition-colors text-blue-600"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(product.id)}
                                                                className="p-2 rounded-md hover:bg-muted transition-colors text-red-600"
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Stats Footer */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Всего товаров</p>
                                <p className="text-2xl font-bold">{products.length}</p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Суммарный остаток</p>
                                <p className="text-2xl font-bold">
                                    {products.reduce((sum, p) => sum + p.stock, 0)}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Средняя цена</p>
                                <p className="text-2xl font-bold">
                                    {products.length > 0
                                        ? formatPrice(products.reduce((sum, p) => sum + p.price, 0) / products.length)
                                        : formatPrice(0)}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Product Modal */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedProduct(null);
                }}
                onSave={modalMode === "create" ? handleCreate : handleUpdate}
                product={selectedProduct}
                mode={modalMode}
            />

            {/* Stock Modal */}
            <StockModal
                isOpen={isStockModalOpen}
                onClose={() => setIsStockModalOpen(false)}
                products={products}
                onDone={fetchProducts}
            />
        </main>
    );
}
