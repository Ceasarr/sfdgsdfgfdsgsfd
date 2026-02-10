"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

interface BannerData {
    id: string;
    position: number;
    image: string;
    link?: string | null;
}

export function HeroBanner() {
    const [banners, setBanners] = useState<BannerData[]>([]);
    const [active, setActive] = useState(0);

    // Fetch banners from the public API
    useEffect(() => {
        fetch("/api/banners")
            .then((r) => r.json())
            .then((data: BannerData[]) => {
                if (Array.isArray(data) && data.length > 0) {
                    setBanners(data);
                }
            })
            .catch(() => {
                // silent – banner simply won't render
            });
    }, []);

    // Auto-advance
    useEffect(() => {
        if (banners.length < 2) return;
        const t = window.setInterval(() => {
            setActive((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => window.clearInterval(t);
    }, [banners.length]);

    const goTo = useCallback((i: number) => setActive(i), []);

    // Nothing to show
    if (banners.length === 0) return null;

    const current = banners[active];
    const hasLink = !!current.link;

    const Wrapper = hasLink ? "a" : "div";
    const wrapperProps = hasLink
        ? { href: current.link!, target: "_blank" as const, rel: "noopener noreferrer" }
        : {};

    return (
        <Wrapper
            {...wrapperProps}
            className={`relative block overflow-hidden rounded-2xl border border-purple-500/20 aspect-[21/9] sm:aspect-[21/5] md:aspect-[21/3.2] bg-gray-900${hasLink ? " cursor-pointer" : ""}`}
        >
            {/* Images */}
            <AnimatePresence mode="wait">
                <motion.img
                    key={current.id}
                    src={current.image}
                    alt={`Баннер ${active + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </AnimatePresence>

            {/* Dots (only if more than 1 banner) */}
            {banners.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                    {banners.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                goTo(i);
                            }}
                            className={`h-2.5 w-2.5 rounded-full transition-all ${
                                i === active
                                    ? "bg-white scale-110 shadow-md"
                                    : "bg-white/40 hover:bg-white/60"
                            }`}
                            aria-label={`Баннер ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </Wrapper>
    );
}
