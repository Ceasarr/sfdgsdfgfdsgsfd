'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  User
} from 'lucide-react';
import { Order, OrderItem } from '@/hooks/use-orders';

interface OrderCardProps {
  order: Order;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-sm transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-foreground">
              #{order.orderNumber}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDate(order.createdAt)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Roblox username */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>Roblox: <span className="text-foreground">{order.robloxUsername}</span></span>
        </div>

        {/* Items preview (collapsed) */}
        <div className="flex items-center gap-2 flex-wrap">
          {order.items.slice(0, 4).map((item) => (
            <div 
              key={item.id}
              className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border"
              title={`${item.product.name} × ${item.quantity}`}
            >
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                className="object-cover"
              />
              {item.quantity > 1 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              )}
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center">
              <span className="text-xs text-muted-foreground">+{order.items.length - 4}</span>
            </div>
          )}
        </div>

        {/* Expandable items section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border pt-4 space-y-3">
                {order.items.map((item) => (
                  <OrderItemRow key={item.id} item={item} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom row: total and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-border">
          <div className="text-lg font-semibold text-foreground">
            {formatPrice(order.total)}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderItemRow({ item }: { item: OrderItem }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground truncate">
          {item.product.name}
        </h4>
        <p className="text-xs text-muted-foreground">
          {item.quantity} × {formatPrice(item.price)}
        </p>
      </div>
      
      <div className="text-sm font-medium text-foreground">
        {formatPrice(item.price * item.quantity)}
      </div>
    </div>
  );
}
