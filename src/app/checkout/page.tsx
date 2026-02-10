'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cart-store';
import { useAuth } from '@/components/ui/auth-context';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, ShoppingCart } from 'lucide-react';
import { useToast } from '@/components/ui/toast-context';
import { Stepper } from './components/Stepper';
import { CheckoutSummary } from './components/CheckoutSummary';
import { OrderSuccess } from './components/OrderSuccess';
import { ContactStep } from './steps/ContactStep';
import { PaymentStep } from './steps/PaymentStep';

// Zod схема валидации
const checkoutSchema = z.object({
    // Шаг 1: Контакты
    robloxUsername: z
        .string()
        .min(3, { message: 'Username должен содержать минимум 3 символа' })
        .max(20, { message: 'Username слишком длинный' })
        .regex(/^[a-zA-Z0-9_]+$/, {
            message: 'Username может содержать только буквы, цифры и подчёркивание',
        }),
    telegram: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^@?[a-zA-Z0-9_]{4,32}$/.test(val),
            { message: 'Некорректный Telegram username' }
        ),
    vk: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[a-zA-Z0-9_.]+$/.test(val) || /^https?:\/\/vk\.com\//.test(val),
            { message: 'Некорректная ссылка или ID ВКонтакте' }
        ),
    email: z
        .string()
        .email({ message: 'Некорректный email адрес' })
        .min(1, { message: 'Email обязателен' }),

    // Шаг 2: Оплата
    paymentMethod: z.enum(['card', 'sbp']),
    captchaToken: z
        .string()
        .min(1, { message: 'Пожалуйста, подтвердите, что вы не робот' }),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Шаги
const STEPS = [
    { number: 1, title: 'Контакты' },
    { number: 2, title: 'Оплата' },
];

export default function CheckoutPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const orderSubmittedRef = useRef(false);

    const { items, clearCart, getTotal } = useCartStore();
    const { user } = useAuth();
    const { addToast } = useToast();

    // Защита от пустой корзины (не срабатывает после успешного оформления)
    useEffect(() => {
        if (items.length === 0 && !orderSubmittedRef.current) {
            router.push('/');
        }
    }, [items, router]);

    // Форма с Zod валидацией
    const form = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            robloxUsername: '',
            telegram: '',
            vk: '',
            email: '',
            paymentMethod: 'card',
            captchaToken: '',
        },
        mode: 'onChange',
    });

    // Автозаполнение email из профиля пользователя
    useEffect(() => {
        if (user) {
            if (user.email) {
                form.setValue('email', user.email);
            }
        }
    }, [user, form]);

    // Валидация текущего шага
    const validateCurrentStep = async (): Promise<boolean> => {
        let fieldsToValidate: (keyof CheckoutFormData)[] = [];

        switch (currentStep) {
            case 1:
                fieldsToValidate = ['robloxUsername', 'email'];
                break;
            case 2:
                fieldsToValidate = ['paymentMethod', 'captchaToken'];
                break;
        }

        const result = await form.trigger(fieldsToValidate);
        return result;
    };

    // Следующий шаг
    const handleNext = async () => {
        const isValid = await validateCurrentStep();

        if (!isValid) {
            addToast('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }

        if (currentStep < 2) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Предыдущий шаг
    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Отправка формы и создание заказа в БД
    const onSubmit = async (data: CheckoutFormData) => {
        setIsProcessing(true);

        try {
            // Prepare order items (include productName for robux and regular items)
            const orderItems = items.map((item) => ({
                productId: item.product.id,
                productName: item.product.name,
                quantity: item.quantity,
            }));

            // Get promo code if applied
            const appliedPromo = useCartStore.getState().promoCode;

            // Create order in database (total calculated server-side)
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    robloxUsername: data.robloxUsername,
                    items: orderItems,
                    promoCode: appliedPromo?.code || null,
                    recaptchaToken: data.captchaToken,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Ошибка при создании заказа');
            }

            // Помечаем что заказ оформлен (чтобы useEffect не перебил редирект)
            orderSubmittedRef.current = true;

            // Сохраняем номер заказа в sessionStorage (до clearCart, чтобы ре-рендер не помешал)
            sessionStorage.setItem('lastOrderNumber', result.order.orderNumber);

            // Редирект на страницу успеха (до clearCart, чтобы навигация началась первой)
            router.push('/checkout/success');

            // Очистка корзины
            clearCart();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Произошла ошибка при оплате';
            addToast(message, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    // Анимация шагов
    const stepVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
        }),
    };

    const [direction, setDirection] = useState(0);

    const handleStepChange = (newStep: number) => {
        setDirection(newStep > currentStep ? 1 : -1);
        setCurrentStep(newStep);
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h2 className="text-2xl font-bold mb-2">Корзина пуста</h2>
                    <p className="text-gray-600 mb-4">Добавьте товары в корзину для оформления заказа</p>
                    <Button onClick={() => router.push('/')}>
                        Перейти в каталог
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-4 sm:py-8 pb-24 sm:pb-8">
            <div className="container max-w-7xl mx-auto px-3 sm:px-4">
                {/* Заголовок */}
                <div className="mb-4 sm:mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-2 sm:mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Назад
                    </Button>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Оформление заказа</h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Заполните данные для получения товаров
                    </p>
                </div>

                {/* Stepper */}
                <Stepper currentStep={currentStep} steps={STEPS} />

                {/* Форма и Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
                    {/* Summary — на мобильных показывается первым (сворачиваемый) */}
                    <div className="lg:col-span-1 order-first lg:order-last">
                        <CheckoutSummary />
                    </div>

                    {/* Форма (левая часть на десктопе, вторая на мобильных) */}
                    <div className="lg:col-span-2 order-last lg:order-first">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                                <AnimatePresence mode="wait" custom={direction}>
                                    <motion.div
                                        key={currentStep}
                                        custom={direction}
                                        variants={stepVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            x: { type: 'spring', stiffness: 300, damping: 30 },
                                            opacity: { duration: 0.2 },
                                        }}
                                    >
                                        {currentStep === 1 && <ContactStep form={form} />}
                                        {currentStep === 2 && <PaymentStep form={form} />}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Навигация */}
                                <div className="flex justify-between items-center pt-4 sm:pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleBack}
                                        disabled={currentStep === 1 || isProcessing}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Назад
                                    </Button>

                                    {currentStep < 2 ? (
                                        <Button type="button" onClick={handleNext}>
                                            Далее
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button type="submit" disabled={isProcessing} className="min-w-[160px] sm:min-w-[200px]">
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Обработка...
                                                </>
                                            ) : (
                                                <>
                                                    Оплатить {getTotal().toFixed(2)} ₽
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <OrderSuccess
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                orderNumber={orderNumber}
                robloxUsername={form.watch('robloxUsername')}
                estimatedTime="5-15 минут"
            />
        </div>
    );
}
