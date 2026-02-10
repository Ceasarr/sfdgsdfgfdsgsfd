'use client';

import { UseFormReturn } from 'react-hook-form';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users, Send, Globe } from 'lucide-react';
import { CheckoutFormData } from '../page';

interface ContactStepProps {
    form: UseFormReturn<CheckoutFormData>;
}

export function ContactStep({ form }: ContactStepProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Контактная информация
                </CardTitle>
                <CardDescription>
                    Введите данные для связи и получения товаров
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="robloxUsername"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ник в Roblox *</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="ВашНикВRoblox"
                                        className="pl-10"
                                        {...field}
                                    />
                                </div>
                            </FormControl>
                            <FormDescription>
                                Ваш никнейм в Roblox для получения предметов. Заполнен из профиля — можете изменить.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="telegram"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Telegram</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Send className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="@username"
                                            className="pl-10"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    Для быстрой связи (необязательно)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="vk"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ВКонтакте</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="vk.com/id или username"
                                            className="pl-10"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    Ссылка или ID (необязательно)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-900">
                        <span className="font-semibold">⚠️ Важно:</span> Убедитесь, что ваш Roblox аккаунт{' '}
                        <span className="font-semibold">{form.watch('robloxUsername') || 'указан корректно'}</span>{' '}
                        существует и доступен для получения предметов.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
