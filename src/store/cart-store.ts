import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product, PromoCode } from '@/types';

// Prevent SSR/client hydration mismatches by avoiding localStorage access on the server.
// We also delay persist hydration until after mount (see `skipHydration` below).
const noopStorage = {
  getItem: (_name: string) => null,
  setItem: (_name: string, _value: string) => {},
  removeItem: (_name: string) => {},
};

const AUTH_STORAGE_KEY = "robux_store_user";

function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { id?: unknown };
    return typeof parsed?.id === "string" && parsed.id.length > 0 ? parsed.id : null;
  } catch {
    return null;
  }
}

function isAuthenticatedClientSide(): boolean {
  return getCurrentUserId() !== null;
}

/**
 * Persist cart per-user. When no user is logged in, we:
 * - return `null` on reads (cart is empty)
 * - ignore writes (so the anonymous session cannot persist a cart)
 */
const userScopedStorage = {
  getItem: (name: string) => {
    const userId = getCurrentUserId();
    if (!userId) return null;
    return window.localStorage.getItem(`${name}:${userId}`);
  },
  setItem: (name: string, value: string) => {
    const userId = getCurrentUserId();
    if (!userId) return;
    window.localStorage.setItem(`${name}:${userId}`, value);
  },
  removeItem: (name: string) => {
    const userId = getCurrentUserId();
    if (!userId) return;
    window.localStorage.removeItem(`${name}:${userId}`);
  },
};

interface StockCheckResult {
  success: boolean;
  message?: string;
}

interface CartState {
  items: CartItem[];
  promoCode: PromoCode | null;
  
  addItem: (product: Product, quantity?: number) => StockCheckResult;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => StockCheckResult;
  clearCart: () => void;
  applyPromo: (promoCode: PromoCode | null) => void;
  
  getTotal: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,

      addItem: (product, quantity = 1) => {
        if (!isAuthenticatedClientSide()) return { success: false, message: 'Необходимо войти в аккаунт' };

        // Check if product is out of stock
        if (product.stock <= 0) {
          return { success: false, message: `Товар "${product.name}" отсутствует на складе` };
        }

        const state = get();
        const existingItem = state.items.find((item) => item.product.id === product.id);
        const currentQty = existingItem ? existingItem.quantity : 0;
        const requestedTotal = currentQty + quantity;

        // Check if requested quantity exceeds stock
        if (requestedTotal > product.stock) {
          const canAdd = product.stock - currentQty;
          if (canAdd <= 0) {
            return { success: false, message: `Невозможно добавить больше товара "${product.name}". В наличии: ${product.stock} шт.` };
          }
          // Add only what's available
          const addQty = canAdd;
          set((s) => {
            if (existingItem) {
              return {
                items: s.items.map((item) =>
                  item.product.id === product.id
                    ? { ...item, quantity: item.quantity + addQty }
                    : item
                ),
              };
            }
            return { items: [...s.items, { product, quantity: addQty }] };
          });
          return { success: false, message: `Добавлено только ${addQty} шт. товара "${product.name}". Максимум в наличии: ${product.stock} шт.` };
        }

        set((s) => {
          if (existingItem) {
            return {
              items: s.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...s.items, { product, quantity }] };
        });
        return { success: true };
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return { success: true };
        }

        const state = get();
        const item = state.items.find((i) => i.product.id === productId);
        if (!item) return { success: false, message: 'Товар не найден в корзине' };

        // Check stock limit
        if (quantity > item.product.stock) {
          // Cap at stock level
          set((s) => ({
            items: s.items.map((i) =>
              i.product.id === productId ? { ...i, quantity: item.product.stock } : i
            ),
          }));
          return { success: false, message: `Максимальное количество товара "${item.product.name}" — ${item.product.stock} шт.` };
        }
        
        set((s) => ({
          items: s.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
        return { success: true };
      },

      clearCart: () => set({ items: [], promoCode: null }),

      applyPromo: (promoCode) => set({ promoCode }),

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getDiscount: () => {
        const subtotal = get().getSubtotal();
        const promo = get().promoCode;
        if (!promo) return 0;
        return (subtotal * promo.discountPercent) / 100;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        return Math.max(0, subtotal - discount);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? userScopedStorage : noopStorage
      ),
      skipHydration: true,
      partialize: (state) => ({ 
        items: state.items, 
        promoCode: state.promoCode 
      }), // Only persist items and promoCode
    }
  )
);
