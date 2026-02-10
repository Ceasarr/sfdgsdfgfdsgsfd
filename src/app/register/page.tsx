"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, CheckCircle2, X } from "@/components/icons";
import { useReCaptcha } from "@/components/recaptcha-provider";

type Step = "form" | "otp";

export default function RegisterPage() {
    const router = useRouter();
    const { executeRecaptcha } = useReCaptcha();
    const [step, setStep] = useState<Step>("form");

    // ── Form state ───────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ── OTP state ────────────────────────────────────────────────────────
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [resendCooldown, setResendCooldown] = useState(60);
    const [otpExpiry, setOtpExpiry] = useState(15 * 60); // 15 minutes in seconds

    // Cooldown timer (resend button)
    useEffect(() => {
        if (step !== "otp" || resendCooldown <= 0) return;
        const t = setInterval(() => setResendCooldown((p) => p - 1), 1000);
        return () => clearInterval(t);
    }, [step, resendCooldown]);

    // Expiry timer
    useEffect(() => {
        if (step !== "otp" || otpExpiry <= 0) return;
        const t = setInterval(() => setOtpExpiry((p) => p - 1), 1000);
        return () => clearInterval(t);
    }, [step, otpExpiry]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    // ── Form validation ──────────────────────────────────────────────────
    const validateForm = () => {
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            setError("Заполните все обязательные поля (кроме имени)");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError("Введите корректный email");
            return false;
        }
        if (formData.password.length < 6) {
            setError("Пароль должен быть не короче 6 символов");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Пароли не совпадают");
            return false;
        }
        return true;
    };

    // ── Step 1: Send OTP ─────────────────────────────────────────────────
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            // Get reCAPTCHA token
            const recaptchaToken = await executeRecaptcha("register");

            const response = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name || undefined,
                    recaptchaToken,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Не удалось отправить код");
            }

            // Move to OTP step
            setStep("otp");
            setOtpDigits(["", "", "", "", "", ""]);
            setResendCooldown(60);
            setOtpExpiry(15 * 60);
        } catch (err: any) {
            setError(err.message || "Произошла ошибка");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Step 2: Verify OTP ───────────────────────────────────────────────
    const handleVerifyOtp = useCallback(async (code: string) => {
        setError("");
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    code,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Неверный код");
            }

            setSuccess(true);
            setTimeout(() => router.push("/login"), 2000);
        } catch (err: any) {
            setError(err.message || "Произошла ошибка при проверке кода");
            // Clear OTP inputs on error
            setOtpDigits(["", "", "", "", "", ""]);
            otpRefs.current[0]?.focus();
        } finally {
            setIsSubmitting(false);
        }
    }, [formData.email, router]);

    // ── Resend OTP ───────────────────────────────────────────────────────
    const handleResend = async () => {
        setError("");
        setIsSubmitting(true);
        try {
            const recaptchaToken = await executeRecaptcha("register");

            const response = await fetch("/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name || undefined,
                    recaptchaToken,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Не удалось отправить код");
            }

            setOtpDigits(["", "", "", "", "", ""]);
            setResendCooldown(60);
            setOtpExpiry(15 * 60);
            otpRefs.current[0]?.focus();
        } catch (err: any) {
            setError(err.message || "Ошибка при повторной отправке");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── OTP input handlers ───────────────────────────────────────────────
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // only digits

        const newDigits = [...otpDigits];
        newDigits[index] = value.slice(-1); // take last digit
        setOtpDigits(newDigits);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        const fullCode = newDigits.join("");
        if (fullCode.length === 6) {
            handleVerifyOtp(fullCode);
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;

        const newDigits = [...otpDigits];
        for (let i = 0; i < pasted.length; i++) {
            newDigits[i] = pasted[i];
        }
        setOtpDigits(newDigits);

        // Focus last filled or next empty
        const nextIndex = Math.min(pasted.length, 5);
        otpRefs.current[nextIndex]?.focus();

        // Auto-submit if full
        if (pasted.length === 6) {
            handleVerifyOtp(pasted);
        }
    };

    // ── Password strength ────────────────────────────────────────────────
    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { strength: 0, label: "", color: "" };

        let strength = 0;
        if (password.length >= 6) strength += 25;
        if (password.length >= 10) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;

        if (strength <= 25) return { strength, label: "Слабый", color: "bg-red-500" };
        if (strength <= 50) return { strength, label: "Нормальный", color: "bg-yellow-500" };
        if (strength <= 75) return { strength, label: "Хороший", color: "bg-blue-500" };
        return { strength, label: "Сильный", color: "bg-green-500" };
    };

    const passwordStrength = getPasswordStrength();

    // ── Success screen ───────────────────────────────────────────────────
    if (success) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-200">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Регистрация успешна!</h2>
                        <p className="text-gray-600 mb-4">
                            Аккаунт создан. Перенаправляем на страницу входа...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    // ── OTP step ─────────────────────────────────────────────────────────
    if (step === "otp") {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <button
                        onClick={() => { setStep("form"); setError(""); }}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Назад к форме
                    </button>

                    <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-200">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Проверьте почту</h1>
                            <p className="text-gray-600 text-sm">
                                Мы отправили 6-значный код на{" "}
                                <span className="font-semibold text-gray-900">{formData.email}</span>
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* OTP Inputs */}
                        <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handleOtpPaste}>
                            {otpDigits.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { otpRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    disabled={isSubmitting}
                                    className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold rounded-lg border-2 border-gray-200 bg-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50"
                                    autoFocus={i === 0}
                                />
                            ))}
                        </div>

                        {/* Timer */}
                        {otpExpiry > 0 ? (
                            <p className="text-center text-sm text-gray-500 mb-4">
                                Код действителен ещё{" "}
                                <span className="font-semibold text-gray-700">{formatTime(otpExpiry)}</span>
                            </p>
                        ) : (
                            <p className="text-center text-sm text-red-600 mb-4 font-medium">
                                Код истёк. Отправьте новый.
                            </p>
                        )}

                        {/* Resend button */}
                        <div className="text-center">
                            <button
                                onClick={handleResend}
                                disabled={resendCooldown > 0 || isSubmitting}
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {resendCooldown > 0
                                    ? `Отправить повторно (${resendCooldown}с)`
                                    : "Отправить код повторно"
                                }
                            </button>
                        </div>

                        {/* Loading indicator */}
                        {isSubmitting && (
                            <div className="flex justify-center mt-4">
                                <div className="h-5 w-5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        );
    }

    // ── Form step ────────────────────────────────────────────────────────
    return (
        <main className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    На главную
                </Link>

                <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-200">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Создать аккаунт
                    </h1>
                    <p className="text-gray-600 mb-6">Зарегистрируйтесь, чтобы покупать Robux и предметы</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Имя (опционально)
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                placeholder="Ваше имя"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Пароль *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 pr-12 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600">Надёжность пароля:</span>
                                        <span className={`font-medium ${passwordStrength.strength >= 50 ? "text-green-600" : "text-gray-600"}`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                                            style={{ width: `${passwordStrength.strength}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Повторите пароль *
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                            {formData.confirmPassword && (
                                <p className={`text-xs mt-1 ${formData.password === formData.confirmPassword ? "text-green-600" : "text-red-600"}`}>
                                    {formData.password === formData.confirmPassword ? "✓ Пароли совпадают" : "✗ Пароли не совпадают"}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
                        >
                            {isSubmitting ? "Отправка кода..." : "Получить код на email"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Уже есть аккаунт?{" "}
                        <Link href="/login" className="text-purple-600 font-medium hover:text-purple-700">
                            Войти
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
