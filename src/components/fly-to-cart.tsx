"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    ReactNode,
} from "react";
import { createPortal } from "react-dom";

/* ── Types ──────────────────────────────────────────── */

interface FlyItem {
    id: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    imageSrc: string | null;
    emoji: string;
}

interface FlyToCartContextType {
    /**
     * Launch a "fly‑to‑cart" animation.
     * @param sourceRect  bounding rect of the source element (button / image)
     * @param imageSrc    product image URL (or null for fallback emoji)
     * @param emoji       fallback emoji shown when there's no image
     */
    flyToCart: (
        sourceRect: DOMRect,
        imageSrc: string | null,
        emoji?: string,
    ) => void;
}

/* ── Context ────────────────────────────────────────── */

const FlyToCartContext = createContext<FlyToCartContextType | undefined>(
    undefined,
);

export function useFlyToCart() {
    const ctx = useContext(FlyToCartContext);
    if (!ctx) {
        throw new Error("useFlyToCart must be used within <FlyToCartProvider>");
    }
    return ctx;
}

/* ── Provider ───────────────────────────────────────── */

const ANIMATION_DURATION = 480; // ms – must match CSS

export function FlyToCartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<FlyItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const flyToCart = useCallback(
        (sourceRect: DOMRect, imageSrc: string | null, emoji = "🛒") => {
            // Skip animation on mobile
            if (window.innerWidth < 768) return;

            const cartEl = document.querySelector("[data-cart-icon]");
            if (!cartEl) return;

            const cartRect = cartEl.getBoundingClientRect();

            const id = Math.random().toString(36).slice(2, 9);

            setItems((prev) => [
                ...prev,
                {
                    id,
                    startX: sourceRect.left + sourceRect.width / 2,
                    startY: sourceRect.top + sourceRect.height / 2,
                    endX: cartRect.left + cartRect.width / 2,
                    endY: cartRect.top + cartRect.height / 2,
                    imageSrc,
                    emoji,
                },
            ]);

            setTimeout(() => {
                setItems((prev) => prev.filter((i) => i.id !== id));
            }, ANIMATION_DURATION + 100);
        },
        [],
    );

    return (
        <FlyToCartContext.Provider value={{ flyToCart }}>
            {children}
            {mounted &&
                createPortal(
                    <>
                        {items.map((item) => (
                            <FlyingElement key={item.id} {...item} />
                        ))}
                    </>,
                    document.body,
                )}
        </FlyToCartContext.Provider>
    );
}

/* ── Flying element ─────────────────────────────────── */

function FlyingElement({
    startX,
    startY,
    endX,
    endY,
    imageSrc,
    emoji,
}: FlyItem) {
    const dx = endX - startX;
    const dy = endY - startY;

    /* Arc height adapts to distance so it always looks natural */
    const distance = Math.sqrt(dx * dx + dy * dy);
    const arcHeight = Math.min(140, distance * 0.35 + 40);

    const vars = {
        "--fly-dx": `${dx}px`,
        "--fly-dy": `${dy}px`,
        "--fly-arc": `-${arcHeight}px`,
    } as React.CSSProperties;

    return (
        <div
            className="fixed pointer-events-none"
            style={{ left: startX, top: startY, zIndex: 99999, ...vars }}
        >
            {/* Layer 1 — horizontal movement (ease‑out) */}
            <div className="ftc-x">
                {/* Layer 2 — vertical arc */}
                <div className="ftc-y">
                    {/* Layer 3 — scale + opacity */}
                    <div className="ftc-scale">
                        {/* Thumbnail */}
                        <div
                            className="h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-purple-500/60"
                            style={{
                                boxShadow:
                                    "0 4px 24px rgba(147,51,234,0.45), 0 0 0 4px rgba(147,51,234,0.12)",
                            }}
                        >
                            {imageSrc ? (
                                <img
                                    src={imageSrc}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-base leading-none">
                                    {emoji}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
