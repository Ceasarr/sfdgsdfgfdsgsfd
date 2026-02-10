'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/ui/auth-context';
import { useOrders } from '@/hooks/use-orders';
import { OrderCard } from '@/components/account/OrderCard';
import { OrdersSkeleton } from '@/components/account/OrdersSkeleton';
import { EmptyOrdersState } from '@/components/account/EmptyOrdersState';
import Link from 'next/link';

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  const {
    data: orders,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrders(user?.id);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?callbackUrl=/account/orders');
    }
  }, [authLoading, isAuthenticated, router]);

  // Show nothing while checking auth
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <Link href="/account">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад в кабинет
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Мои заказы
          </h1>
          <p className="text-muted-foreground">
            История ваших покупок и статус заказов
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <OrdersSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Не удалось загрузить заказы
            </h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              {error?.message || 'Произошла ошибка при загрузке. Попробуйте ещё раз.'}
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Повторить
            </Button>
          </div>
        ) : !orders || orders.length === 0 ? (
          <EmptyOrdersState />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <OrderCard order={order} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
