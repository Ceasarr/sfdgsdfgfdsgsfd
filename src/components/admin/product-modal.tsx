"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Save, AlertCircle } from "@/components/icons";

interface Product {
    id?: string;
    name: string;
    description: string;
    price: number;
    oldPrice?: number | null;
    rarity: string;
    category: string;
    game?: string;
    stock: number;
    image: string;
}

const GAME_OPTIONS = [
    { value: "", label: "Не выбрано" },
    { value: "Steal a brainrot", label: "Steal a brainrot" },
    { value: "Murder mistery 2", label: "Murder mistery 2" },
    { value: "Grow a garden", label: "Grow a garden" },
    { value: "Adopt me", label: "Adopt me" },
    { value: "Escape tsunami for brainrots!", label: "Escape tsunami for brainrots!" },
    { value: "Toilet tower defense", label: "Toilet tower defense" },
    { value: "Blox fruits", label: "Blox fruits" },
    { value: "Break a lucky block!", label: "Break a lucky block!" },
];

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Omit<Product, "id">) => Promise<void>;
    product?: Product | null;
    mode: "create" | "edit";
}

export function ProductModal({ isOpen, onClose, onSave, product, mode }: ProductModalProps) {
    const [formData, setFormData] = useState<Omit<Product, "id">>({
        name: product?.name || "",
        description: product?.description || "",
        price: product?.price || 0,
        oldPrice: product?.oldPrice || null,
        rarity: product?.rarity || "common",
        category: product?.category || "Robux",
        game: product?.game || "",
        stock: product?.stock || 0,
        image: product?.image || "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreviewError, setImagePreviewError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset form when modal opens or product changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: product?.name || "",
                description: product?.description || "",
                price: product?.price || 0,
                oldPrice: product?.oldPrice || null,
                rarity: product?.rarity || "common",
                category: product?.category || "Robux",
                game: product?.game || "",
                stock: product?.stock || 0,
                image: product?.image || "",
            });
            setImagePreviewError(false);
        }
    }, [isOpen, product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Не удалось сохранить товар. Попробуйте ещё раз.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Convert file to base64 or data URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result as string });
                setImagePreviewError(false);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-100 bg-white backdrop-blur-xl">
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {mode === "create" ? "Добавить товар" : "Редактировать товар"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {mode === "create" ? "Создайте новый товар для магазина" : "Обновите данные и настройки товара"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Image Preview */}
                    <div className="lg:col-span-1 space-y-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Предпросмотр</label>
                        <div
                            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden relative group cursor-pointer hover:border-purple-400 transition-colors"
                            onClick={handleImageClick}
                        >
                            {formData.image && !imagePreviewError ? (
                                <img
                                    src={formData.image}
                                    alt="Предпросмотр"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    onError={() => setImagePreviewError(true)}
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                                    <Upload className="h-12 w-12 mb-2 opacity-50" />
                                    <p className="text-sm font-medium">Нажмите, чтобы загрузить изображение</p>
                                    <p className="text-xs mt-1">PNG/JPG до 10 МБ</p>
                                </div>
                            )}

                            {/* Rarity Badge Preview */}
                            {formData.rarity && (
                                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-md border border-white/20
                                    ${formData.rarity === 'godly' ? 'bg-red-500' :
                                        formData.rarity === 'legendary' ? 'bg-yellow-500' :
                                            formData.rarity === 'epic' ? 'bg-purple-500' :
                                                formData.rarity === 'rare' ? 'bg-blue-500' : 'bg-gray-500'}`}
                                >
                                    {formData.rarity}
                                </div>
                            )}
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <p className="text-xs text-gray-500 text-center">Рекомендуемый размер: 500×500 или больше</p>
                    </div>

                    {/* Right Column: Form Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Section: Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-1 h-4 bg-purple-500 rounded-full" />
                                Основная информация
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full rounded-lg bg-white border border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-400 text-gray-900 shadow-sm"
                                        placeholder="Например: Подарочная карта 1000 Robux"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full rounded-lg bg-white border border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-400 text-gray-900 shadow-sm min-h-[100px] resize-y"
                                        placeholder="Опишите товар: детали, способ доставки и т.д."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Section: Pricing */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-green-500 rounded-full" />
                                    Цена
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Текущая цена (₽)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                                className="w-full rounded-lg bg-white border border-gray-200 pl-8 pr-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-gray-900 shadow-sm"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₽</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Старая цена (опционально)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.oldPrice || ""}
                                                onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value ? parseInt(e.target.value) : null })}
                                                className="w-full rounded-lg bg-white border border-gray-200 pl-8 pr-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-gray-900 shadow-sm"
                                                placeholder="0"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₽</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Attributes */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-blue-500 rounded-full" />
                                    Параметры
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full rounded-lg bg-white border border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-gray-900 shadow-sm"
                                        >
                                            <option value="Robux">💎 Robux</option>
                                            <option value="Items">🔪 Предметы</option>
                                        </select>
                                    </div>

                                    {/* Game — only for non-Robux */}
                                    {formData.category !== "Robux" && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Игра</label>
                                            <select
                                                value={formData.game || ""}
                                                onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                                                className="w-full rounded-lg bg-white border border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-gray-900 shadow-sm"
                                            >
                                                {GAME_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Редкость</label>
                                        <select
                                            required
                                            value={formData.rarity}
                                            onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                                            className="w-full rounded-lg bg-white border border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-gray-900 shadow-sm"
                                        >
                                            <option value="common">Обычная</option>
                                            <option value="rare">Редкая</option>
                                            <option value="epic">Эпическая</option>
                                            <option value="legendary">Легендарная</option>
                                            <option value="godly">Божественная</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Остаток</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                            className="w-full rounded-lg bg-white border border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-gray-900 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                <span>Изменения сохраняются в базе данных</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium transition-all hover:bg-gray-50 text-gray-700 shadow-sm"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-semibold text-white shadow-lg shadow-purple-900/10 transition-all hover:from-purple-500 hover:to-pink-500 hover:shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Сохранение...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            {mode === "create" ? "Создать" : "Сохранить"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
