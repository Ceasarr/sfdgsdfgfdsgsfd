import { useQuery } from '@tanstack/react-query';

// Types for orders API response
export interface OrderProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  rarity: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: OrderProduct;
}

export interface Order {
  id: string;
  userId: string | null;
  status: string;
  total: number;
  robloxUsername: string;
  createdAt: string;
  orderNumber: string;
  items: OrderItem[];
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
  error?: string;
}

async function fetchOrders(): Promise<Order[]> {
  const response = await fetch('/api/account/orders');
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Не удалось загрузить заказы');
  }
  
  const data: OrdersResponse = await response.json();
  return data.orders;
}

export function useOrders(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: () => fetchOrders(),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
}
