'use client';

import { UseFormReturn } from 'react-hook-form';
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Smartphone, Shield } from 'lucide-react';
import { CheckoutFormData } from '../page';

interface PaymentStepProps {
    form: UseFormReturn<CheckoutFormData>;
}

export function PaymentStep({ form }: PaymentStepProps) {
    const paymentMethod = form.watch('paymentMethod');

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
