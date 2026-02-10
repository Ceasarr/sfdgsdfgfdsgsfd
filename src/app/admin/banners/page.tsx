"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Save, Trash, AlertCircle } from "@/components/icons";
import { useAuth } from "@/components/ui/auth-context";

interface SlotState {
    image: string; // data-url or external URL
    link: string;  // optional click-through URL
    file: File | null;
}

const EMPTY_SLOT: SlotState = { image: "", link: "", file: null };

export default function AdminBannersPage() {
    const router = useRouter();
    const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

    const [slots, setSlots] = useState<[SlotState, SlotState, SlotState]>([
        { ...EMPTY_SLOT },
        { ...EMPTY_SLOT },
        { ...EMPTY_SLOT },
    ]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

    // Protect admin route
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) router.push("/login");
            else if (!isAdmin) router.push("/account");
        }
    }, [isAuthenticated, isAdmin, isLoading, router]);

    // Load existing banners
    useEffect(() => {
        if (!user?.id || !isAdmin) return;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/banners?adminId=${encodeURIComponent(user.id)}`);
                const data = await res.json();
                if (data?.banners) {
                    const next: [SlotState, SlotState, SlotState] = [{ ...EMPTY_SLOT }, { ...EMPTY_SLOT }, { ...EMPTY_SLOT }];
                    for (const b of data.banners as { position: number; image: string; link?: string }[]) {
                        const idx = b.position - 1;
                        if (idx >= 0 && idx < 3) {
                            next[idx] = { image: b.image, link: b.link || "", file: null };
                        }
                    }
                    setSlots(next);
                }
            } catch {
                // ignore – start with empty
            } finally {
                setLoading(false);
            }
        })();
    }, [user?.id, isAdmin]);

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setSlots((prev) => {
                const next = [...prev] as [SlotState, SlotState, SlotState];
                next[index] = { ...next[index], image: reader.result as string, file };
                return next;
            });
        };
        reader.readAsDataURL(file);
    };

    const clearSlot = (index: number) => {
        setSlots((prev) => {
            const next = [...prev] as [SlotState, SlotState, SlotState];
            next[index] = { ...EMPTY_SLOT };
            return next;
        });
        // Reset file input
        const ref = fileRefs[index];
        if (ref.current) ref.current.value = "";
    };

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        setMessage(null);
        try {
            const payload = slots.map((s, i) => ({
                position: i + 1,
                image: s.image,
                link: s.link.trim(),
            }));

            const res = await fetch("/api/admin/banners", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminId: user.id, banners: payload }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || "Ошибка сервера");
            }

            setMessage({ text: "Баннеры успешно сохранены!", type: "success" });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Не удалось сохранить";
            setMessage({ text: msg, type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const filledCount = slots.filter((s) => s.image).length;

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
                    <h1 className="text-3xl font-bold">Управление рекламой</h1>
                    <p className="text-muted-foreground mt-1">
                        Загрузите изображения для 3 баннеров на главной странице
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Banner slots */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {slots.map((slot, i) => (
                                <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                                    {/* Slot header */}
                                    <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                                        <span className="text-sm font-semibold">Баннер {i + 1}</span>
                                        {slot.image && (
                                            <button
                                                type="button"
                                                onClick={() => clearSlot(i)}
                                                className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors"
                                                title="Удалить"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Image preview / upload area */}
                                    <div
                                        className="relative aspect-[21/9] bg-gray-50 dark:bg-gray-900 cursor-pointer group"
                                        onClick={() => fileRefs[i].current?.click()}
                                    >
                                        {slot.image ? (
                                            <img
                                                src={slot.image}
                                                alt={`Баннер ${i + 1}`}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                                                <Upload className="h-10 w-10 opacity-40" />
                                                <p className="text-sm font-medium">Нажмите для загрузки</p>
                                                <p className="text-xs opacity-60">Рекомендуемый размер: 1200×500</p>
                                            </div>
                                        )}

                                        {/* Hover overlay when image exists */}
                                        {slot.image && (
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium transition-opacity">
                                                    Заменить изображение
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hidden file input */}
                                    <input
                                        ref={fileRefs[i]}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileChange(i, e)}
                                    />

                                    {/* Link input */}
                                    <div className="px-4 py-3 border-t border-border">
                                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                            Ссылка при клике (необязательно)
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://example.com"
                                            value={slot.link}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSlots((prev) => {
                                                    const next = [...prev] as [SlotState, SlotState, SlotState];
                                                    next[i] = { ...next[i], link: val };
                                                    return next;
                                                });
                                            }}
                                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message */}
                        {message && (
                            <div
                                className={`flex items-center gap-2 rounded-lg border px-4 py-3 mb-4 text-sm ${
                                    message.type === "success"
                                        ? "border-green-200 bg-green-50 text-green-700"
                                        : "border-red-200 bg-red-50 text-red-700"
                                }`}
                            >
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {message.text}
                            </div>
                        )}

                        {/* Save button */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Заполнено: {filledCount} из 3 баннеров
                            </p>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || filledCount === 0}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/10 transition-all hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Сохранение…
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Сохранить баннеры
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
