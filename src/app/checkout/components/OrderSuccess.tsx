'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Gift } from 'lucide-react';

interface OrderSuccessProps {
    isOpen: boolean;
    onClose: () => void;
    orderNumber: string;
    robloxUsername: string;
    estimatedTime: string;
}

export function OrderSuccess({
    isOpen,
    onClose,
    orderNumber,
    robloxUsername,
    estimatedTime,
}: OrderSuccessProps) {
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            // Конфетти эффект (можно добавить библиотеку canvas-confetti)
            console.log('🎉 Order success!');
        }
    }, [isOpen]);

    const handleGoHome = () => {
        onClose();
        router.push('/');
    };

    const handleViewOrders = () => {
        onClose();
        router.push('/account/orders');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                        className="mx-auto mb-4"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </div>
                    </motion.div>
                    <DialogTitle className="text-2xl font-bold">
                        Заказ успешно оплачен!
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Номер заказа: <span className="font-semibold">#{orderNumber}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Информация о доставке */}
                    <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-900">Время выдачи</p>
                                <p className="text-sm text-blue-700">{estimatedTime}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Gift className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-900">Получатель</p>
                                <p className="text-sm text-blue-700">
                                    Roblox аккаунт: <span className="font-semibold">{robloxUsername}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Следующие шаги */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Что дальше?</h4>
                        <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                            <li>Убедитесь, что ваш Roblox аккаунт онлайн</li>
                            <li>Примите запрос на обмен в Roblox</li>
                            <li>Товары будут автоматически доставлены</li>
                            <li>Проверьте свой инвентарь через 5-15 минут</li>
                        </ol>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex gap-3 pt-2">
                        <Button onClick={handleGoHome} variant="outline" className="flex-1">
                            На главную
                        </Button>
                        <Button onClick={handleViewOrders} className="flex-1">
                            Мои заказы
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
