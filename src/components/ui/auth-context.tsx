"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-context";
import { useCartStore } from "@/store/cart-store";

export type UserRole = "admin" | "user";

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: UserRole;
    robloxUsername?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, name?: string) => Promise<boolean>;
    logout: () => void;
    refreshUser: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { addToast } = useToast();

    // Check for persisted session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("robux_store_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user session", e);
                localStorage.removeItem("robux_store_user");
            }
        }
        setIsLoading(false);
    }, []);

    // Keep cart tied to auth:
    // - when logged in: hydrate the user's persisted cart
    // - when logged out: clear in-memory cart (without overwriting user's persisted cart)
    useEffect(() => {
        if (isLoading) return;
        if (user) {
            void useCartStore.persist.rehydrate();
        } else {
            useCartStore.getState().clearCart();
        }
    }, [user, isLoading]);

    const login = async (email: string, password: string) => {
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                addToast(data.error || "Не удалось войти", "error");
                setIsLoading(false);
                return false;
            }

            const loggedInUser: User = {
                ...data.user,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
            };

            setUser(loggedInUser);
            localStorage.setItem("robux_store_user", JSON.stringify(loggedInUser));
            addToast(data.user.role === "admin" ? "С возвращением, администратор!" : "Вы успешно вошли", "success");
            setIsLoading(false);
            return true;
        } catch (error) {
            addToast("Произошла ошибка при входе", "error");
            setIsLoading(false);
            return false;
        }
    };

    const register = async (email: string, password: string, name?: string) => {
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await response.json();

            if (!response.ok) {
                addToast(data.error || "Не удалось зарегистрироваться", "error");
                setIsLoading(false);
                return false;
            }

            addToast("Регистрация успешна! Теперь войдите в аккаунт.", "success");
            setIsLoading(false);
            return true;
        } catch (error) {
            addToast("Произошла ошибка при регистрации", "error");
            setIsLoading(false);
            return false;
        }
    };

    const logout = async () => {
        // Clear server-side session cookie
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch {
            // Proceed even if the request fails
        }
        localStorage.removeItem("robux_store_user");
        setUser(null);
        // Ensure cart is not available for unauthenticated users.
        useCartStore.getState().clearCart();
        addToast("Вы вышли из аккаунта", "info");
        router.push("/");
    };

    const refreshUser = () => {
        const storedUser = localStorage.getItem("robux_store_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user session", e);
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                register,
                logout,
                refreshUser,
                isAuthenticated: !!user,
                isAdmin: user?.role === "admin",
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
