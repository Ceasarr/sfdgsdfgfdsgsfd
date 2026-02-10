"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { X, CheckCircle2, ShoppingBag } from "@/components/icons";

export type ToastType = "success" | "error" | "info" | "cart";

interface CartToast {
    message: string;
    key: number;
    leaving: boolean;
}

interface GenericToast {
    message: string;
    type: Exclude<ToastType, "cart">;
    key: number;
    leaving: boolean;
}

const EXIT_DURATION = 250; // ms — matches CSS animation

interface ToastContextType {
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    // Single cart toast
    const [cartToast, setCartToast] = useState<CartToast | null>(null);
    const cartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cartExitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cartKeyRef = useRef(0);

    // Single generic toast
    const [genericToast, setGenericToast] = useState<GenericToast | null>(null);
    const genericTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const genericExitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const genericKeyRef = useRef(0);

    const clearCartTimers = useCallback(() => {
        if (cartTimerRef.current) { clearTimeout(cartTimerRef.current); cartTimerRef.current = null; }
        if (cartExitTimerRef.current) { clearTimeout(cartExitTimerRef.current); cartExitTimerRef.current = null; }
    }, []);

    const clearGenericTimers = useCallback(() => {
        if (genericTimerRef.current) { clearTimeout(genericTimerRef.current); genericTimerRef.current = null; }
        if (genericExitTimerRef.current) { clearTimeout(genericExitTimerRef.current); genericExitTimerRef.current = null; }
    }, []);

    const startCartExit = useCallback(() => {
        setCartToast((prev) => prev ? { ...prev, leaving: true } : null);
        cartExitTimerRef.current = setTimeout(() => {
            setCartToast(null);
            cartExitTimerRef.current = null;
        }, EXIT_DURATION);
    }, []);

    const startGenericExit = useCallback(() => {
        setGenericToast((prev) => prev ? { ...prev, leaving: true } : null);
        genericExitTimerRef.current = setTimeout(() => {
            setGenericToast(null);
            genericExitTimerRef.current = null;
        }, EXIT_DURATION);
    }, []);

    const dismissCart = useCallback(() => {
        clearCartTimers();
        startCartExit();
    }, [clearCartTimers, startCartExit]);

    const dismissGeneric = useCallback(() => {
        clearGenericTimers();
        startGenericExit();
    }, [clearGenericTimers, startGenericExit]);

    const removeToast = useCallback((_id: string) => {}, []);

    const addToast = useCallback(
        (message: string, type: ToastType = "info", duration = 3000) => {
            if (type === "cart") {
                clearCartTimers();
                cartKeyRef.current += 1;
                setCartToast({ message, key: cartKeyRef.current, leaving: false });
                cartTimerRef.current = setTimeout(() => {
                    cartTimerRef.current = null;
                    startCartExit();
                }, 1500);
            } else {
                clearGenericTimers();
                genericKeyRef.current += 1;
                setGenericToast({ message, type, key: genericKeyRef.current, leaving: false });
                genericTimerRef.current = setTimeout(() => {
                    genericTimerRef.current = null;
                    startGenericExit();
                }, duration > 0 ? duration : 3000);
            }
        },
        [clearCartTimers, clearGenericTimers, startCartExit, startGenericExit]
    );

    useEffect(() => {
        return () => {
            clearCartTimers();
            clearGenericTimers();
        };
    }, [clearCartTimers, clearGenericTimers]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}

            {/* ── Cart toast (unified style, mobile & desktop) ── */}
            {cartToast && (
                <div
                    key={cartToast.key}
                    className={`fixed bottom-4 left-3 right-3 md:left-auto md:right-4 md:w-full md:max-w-sm z-[100] ${
                        cartToast.leaving ? "toast-exit" : "toast-enter"
                    }`}
                >
                    <div className="flex items-center gap-3 rounded-2xl bg-white border border-purple-200 px-4 py-3.5 shadow-xl shadow-purple-500/10">
                        <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-md shadow-purple-500/25">
                            <ShoppingBag className="h-[18px] w-[18px] text-white" />
                        </div>
                        <p className="flex-1 text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                            {cartToast.message}
                        </p>
                        <button
                            onClick={dismissCart}
                            className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Generic toast (success / error / info) ───────── */}
            {genericToast && (
                <div
                    key={genericToast.key}
                    className={`fixed bottom-4 left-3 right-3 md:left-auto md:right-4 md:w-full md:max-w-sm z-[100] ${
                        genericToast.leaving ? "toast-exit" : "toast-enter"
                    }`}
                >
                    <div
                        className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-xl ${
                            genericToast.type === "success"
                                ? "border border-green-200 shadow-green-500/10"
                                : genericToast.type === "error"
                                    ? "border border-red-200 shadow-red-500/10"
                                    : "border border-gray-200 shadow-gray-500/10"
                        }`}
                    >
                        <div
                            className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl shadow-md ${
                                genericToast.type === "success"
                                    ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/25"
                                    : genericToast.type === "error"
                                        ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/25"
                                        : "bg-gradient-to-br from-gray-500 to-gray-600 shadow-gray-500/25"
                            }`}
                        >
                            {genericToast.type === "success" && <CheckCircle2 className="h-[18px] w-[18px] text-white" />}
                            {genericToast.type === "error" && <X className="h-[18px] w-[18px] text-white" />}
                            {genericToast.type === "info" && <span className="text-sm text-white">ℹ️</span>}
                        </div>
                        <p className="flex-1 text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                            {genericToast.message}
                        </p>
                        <button
                            onClick={dismissGeneric}
                            className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
