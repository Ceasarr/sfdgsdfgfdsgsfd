"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, X, Eye, EyeOff } from "@/components/icons";
import { useAuth } from "@/components/ui/auth-context";

export default function EditProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, refreshUser } = useAuth();

    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

    // Protect route - redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || "",
                email: user.email || "",
            });
        }
    }, [user]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError("");
        setProfileSuccess("");

        if (!profileData.email) {
            setProfileError("Email обязателен");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
            setProfileError("Введите корректный email");
            return;
        }

        setIsSubmittingProfile(true);

        try {
            const response = await fetch("/api/user/update-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...profileData,
                    userId: user?.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Не удалось обновить профиль");
            }

            setProfileSuccess("Профиль успешно обновлён!");
            // Update user data in localStorage and auth context
            const updatedUser = {
                ...user,
                ...data.user,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
            };
            localStorage.setItem("robux_store_user", JSON.stringify(updatedUser));
            if (refreshUser) {
                refreshUser();
            }
            setTimeout(() => {
                router.push("/account");
            }, 1500);
        } catch (err: any) {
            setProfileError(err.message || "Произошла ошибка");
        } finally {
            setIsSubmittingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError("Заполните все поля пароля");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError("Новый пароль должен быть не короче 6 символов");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("Пароли не совпадают");
            return;
        }

        setIsSubmittingPassword(true);

        try {
            const response = await fetch("/api/user/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                    userId: user?.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Не удалось изменить пароль");
            }

            setPasswordSuccess("Пароль успешно изменён!");
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err: any) {
            setPasswordError(err.message || "Произошла ошибка");
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    // Show loading state while checking authentication
    if (isLoading || !user) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Загрузка...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    href="/account"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Назад в аккаунт
                </Link>

                <h1 className="text-3xl font-bold mb-8">Редактирование профиля</h1>

                <div className="max-w-2xl space-y-6">
                    {/* Profile Information Form */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-4">Данные профиля</h2>

                        {profileError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{profileError}</p>
                            </div>
                        )}

                        {profileSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-green-700">{profileSuccess}</p>
                            </div>
                        )}

                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Имя
                                </label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                    placeholder="Ваше имя"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                    placeholder="you@email.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingProfile}
                                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
                            >
                                {isSubmittingProfile ? "Сохранение..." : "Сохранить изменения"}
                            </button>
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="rounded-lg border border-border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-4">Смена пароля</h2>

                        {passwordError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{passwordError}</p>
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-green-700">{passwordSuccess}</p>
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Текущий пароль *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        required
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 pr-12 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Новый пароль *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        required
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 pr-12 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Повторите новый пароль *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 pr-12 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {passwordData.confirmPassword && (
                                    <p className={`text-xs mt-1 ${passwordData.newPassword === passwordData.confirmPassword ? "text-green-600" : "text-red-600"}`}>
                                        {passwordData.newPassword === passwordData.confirmPassword ? "✓ Пароли совпадают" : "✗ Пароли не совпадают"}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingPassword}
                                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
                            >
                                {isSubmittingPassword ? "Смена пароля..." : "Сменить пароль"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}
