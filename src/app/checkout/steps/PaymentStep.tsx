'use client';

import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Smartphone, Shield } from 'lucide-react';
import { CheckoutFormData } from '../page';
import { useReCaptcha } from '@/components/recaptcha-provider';

interface PaymentStepProps {
    form: UseFormReturn<CheckoutFormData>;
}

export function PaymentStep({ form }: PaymentStepProps) {
    const paymentMethod = form.watch('paymentMethod');
    const { executeRecaptcha, isLoaded } = useReCaptcha();
    const [captchaStatus, setCaptchaStatus] = useState<'loading' | 'verified' | 'error'>('loading');

    // Automatically get reCAPTCHA token when component mounts (with timeout)
    useEffect(() => {
        let cancelled = false;

        // Timeout: if reCAPTCHA doesn't load in 10s, show error
        const timeout = setTimeout(() => {
            if (!cancelled && captchaStatus === 'loading') {
                setCaptchaStatus('error');
            }
        }, 10000);

        if (!isLoaded) return () => { cancelled = true; clearTimeout(timeout); };

        const getToken = async () => {
            try {
                const token = await executeRecaptcha('checkout');
                if (!cancelled) {
                    form.setValue('captchaToken', token);
                    setCaptchaStatus('verified');
                }
            } catch {
                if (!cancelled) {
                    setCaptchaStatus('error');
                }
            }
        };

        getToken();

        return () => { cancelled = true; clearTimeout(timeout); };
    }, [isLoaded, executeRecaptcha, form, captchaStatus]);

    // Retry handler
    const handleRetry = async () => {
        setCaptchaStatus('loading');
        try {
            const token = await executeRecaptcha('checkout');
            form.setValue('captchaToken', token);
            setCaptchaStatus('verified');
        } catch {
            setCaptchaStatus('error');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Способ оплаты
                </CardTitle>
                <CardDescription>
                    Выберите удобный способ оплаты заказа
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="space-y-3"
                                >
                                    {/* Банковская карта (ЮКасса) */}
                                    <div
                                        className={`relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${paymentMethod === 'card'
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <RadioGroupItem value="card" id="card" className="mt-1" />
                                        <label htmlFor="card" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CreditCard className="w-5 h-5 text-blue-600" />
                                                <span className="font-semibold">Банковская карта</span>
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                                    Популярно
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Visa, Mastercard, МИР через ЮKassa
                                            </p>
                                            <div className="mt-2 flex gap-1">
                                                {['VISA', 'MC', 'МИР'].map((brand) => (
                                                    <span key={brand} className="text-xs bg-gray-100 px-2 py-1 rounded font-medium">
                                                        {brand}
                                                    </span>
                                                ))}
                                            </div>
                                        </label>
                                    </div>

                                    {/* СБП */}
                                    <div
                                        className={`relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${paymentMethod === 'sbp'
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <RadioGroupItem value="sbp" id="sbp" className="mt-1" />
                                        <label htmlFor="sbp" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Smartphone className="w-5 h-5 text-purple-600" />
                                                <span className="font-semibold">Система быстрых платежей (СБП)</span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Мгновенный перевод через банковское приложение
                                            </p>
                                            <div className="mt-2">
                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                    ⚡ Без комиссии
                                                </span>
                                            </div>
                                        </label>
                                    </div>

                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* reCAPTCHA v3 status */}
                <FormField
                    control={form.control}
                    name="captchaToken"
                    render={() => (
                        <FormItem>
                            <FormLabel>Проверка безопасности</FormLabel>
                            <FormControl>
                                <div className="border-2 border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {captchaStatus === 'loading' && (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                                                    <span className="text-sm text-gray-600">Проверка безопасности...</span>
                                                </>
                                            )}
                                            {captchaStatus === 'verified' && (
                                                <>
                                                    <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm font-medium text-green-700">Проверка пройдена</span>
                                                </>
                                            )}
                                            {captchaStatus === 'error' && (
                                                <>
                                                    <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleRetry}
                                                        className="text-sm text-red-600 hover:text-red-700 underline"
                                                    >
                                                        Ошибка проверки. Повторить?
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-gray-400" />
                                            <span className="text-xs text-gray-500">reCAPTCHA</span>
                                        </div>
                                    </div>
                                </div>
                            </FormControl>
                            <FormDescription>
                                Защита от мошенничества с помощью Google reCAPTCHA
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Безопасность */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-green-900 mb-1">
                                Безопасная оплата
                            </p>
                            <p className="text-xs text-green-700">
                                Все платежи защищены SSL-шифрованием. Мы не храним данные вашей карты.
                                Платёж обрабатывается через сертифицированные платёжные системы.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
