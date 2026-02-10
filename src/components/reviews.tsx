"use client";

import { Star, CheckCircle2, User } from "@/components/icons";
import Image from "next/image";

interface Review {
    id: string;
    author: string;
    rating: number;
    date: string;
    content: string;
    verified: boolean;
    avatar?: string;
}

const sampleReviews: Review[] = [
    {
        id: "1",
        author: "РоблоксКинг_99",
        rating: 5,
        date: "2 дня назад",
        content: "Мгновенная доставка! Получил свои Robux менее чем за 2 минуты. Лучший магазин!",
        verified: true,
    },
    {
        id: "2",
        author: "СашаПлэй",
        rating: 5,
        date: "1 неделю назад",
        content: "Цены намного лучше, чем в официальном магазине. Буду покупать еще!",
        verified: true,
    },
    {
        id: "3",
        author: "НубМастер",
        rating: 5,
        date: "2 недели назад",
        content: "Отличный сервис, быстрая доставка и превосходная поддержка. Очень рекомендую!",
        verified: true,
    },
];

export function Reviews({ productId }: { productId?: string }) {
    // In a real app, we would fetch reviews based on productId

    const averageRating = 5.0;
    const totalReviews = 124;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Отзывы покупателей</h2>
                    <div className="flex items-center gap-2">
                        <div className="flex text-yellow-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-5 w-5 fill-current" />
                            ))}
                        </div>
                        <span className="font-semibold text-lg">{averageRating}</span>
                        <span className="text-muted-foreground">({totalReviews} отзывов)</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {sampleReviews.map((review) => (
                    <div key={review.id} className="rounded-lg border border-border bg-card/50 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted flex items-center justify-center">
                                    <User className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{review.author}</p>
                                        {review.verified && (
                                            <span className="flex items-center gap-1 text-xs font-medium text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Проверено
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{review.date}</p>
                                </div>
                            </div>
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-muted opacity-30"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="leading-relaxed text-muted-foreground">{review.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
