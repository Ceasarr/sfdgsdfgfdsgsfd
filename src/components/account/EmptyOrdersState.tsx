'use client';

import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function EmptyOrdersState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Package className="w-10 h-10 text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        У вас пока нет заказов
      </h3>
      
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Откройте каталог и выберите товары, которые вам нравятся. 
        Все ваши заказы будут отображаться здесь.
      </p>
      
      <Button asChild className="bg-purple-600 hover:bg-purple-700">
        <Link href="/">
          Перейти в каталог
        </Link>
      </Button>
    </div>
  );
}
