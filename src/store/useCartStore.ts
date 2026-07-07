import { create } from 'zustand';
import type { CartItem, MenuItem } from '../types';
import { api } from '../services/api';

interface CartState {
  cartItems: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  couponCode: string | null;
  pricing: {
    subtotal: number;
    deliveryFee: number;
    packagingFee: number;
    platformFee: number;
    taxes: number;
    discount: number;
    grandTotal: number;
  };
  fetchCart: () => Promise<void>;
  addToCart: (item: MenuItem, restaurantId: string, restaurantName: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => Promise<void>;
}

const showGlobalToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('toast-notification', { detail: { message, type } })
    );
  }
};

export const useCartStore = create<CartState>((set, get) => {
  // Listen for unauthorized events to reset cart
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-unauthorized', () => {
      set({
        cartItems: [],
        restaurantId: null,
        restaurantName: null,
        couponCode: null,
        pricing: { subtotal: 0, deliveryFee: 0, packagingFee: 0, platformFee: 0, taxes: 0, discount: 0, grandTotal: 0 },
      });
    });
  }

  return {
    cartItems: [],
    restaurantId: null,
    restaurantName: null,
    couponCode: null,
    pricing: {
      subtotal: 0,
      deliveryFee: 0,
      packagingFee: 0,
      platformFee: 0,
      taxes: 0,
      discount: 0,
      grandTotal: 0,
    },

    fetchCart: async () => {
      if (!localStorage.getItem('fretza_token')) return;
      try {
        const res = await api.get('/cart');
        const { items, restaurantId, restaurantName, couponCode, pricing } = res.data.cart;
        set({
          cartItems: items,
          restaurantId,
          restaurantName,
          couponCode,
          pricing,
        });
      } catch (err) {
        // Suppress initial fetch errors
      }
    },

    addToCart: async (item, _restId, _restName) => {
      try {
        const res = await api.post('/cart', { foodItemId: item.id, quantity: 1 });
        const { items, restaurantId, restaurantName, couponCode, pricing } = res.data.cart;
        set({
          cartItems: items,
          restaurantId,
          restaurantName,
          couponCode,
          pricing,
        });
        showGlobalToast('Added to cart');
      } catch (err: any) {
        // If error response indicates restaurant mismatch, ask to clear cart
        if (err.toString().includes('another restaurant') || (err.response && err.response.data && err.response.data.clearCartRequired)) {
          if (window.confirm('Your cart contains items from another restaurant. Clear cart and add this item?')) {
            await api.delete('/cart');
            const res = await api.post('/cart', { foodItemId: item.id, quantity: 1 });
            const { items, restaurantId, restaurantName, couponCode, pricing } = res.data.cart;
            set({
              cartItems: items,
              restaurantId,
              restaurantName,
              couponCode,
              pricing,
            });
            showGlobalToast('Cart updated with new item');
          }
        } else {
          showGlobalToast(err.toString(), 'error');
        }
      }
    },

    removeFromCart: async (itemId) => {
      try {
        const res = await api.delete(`/cart/${itemId}`);
        const { items, restaurantId, restaurantName, couponCode, pricing } = res.data.cart;
        set({
          cartItems: items,
          restaurantId,
          restaurantName,
          couponCode,
          pricing,
        });
        showGlobalToast('Item removed');
      } catch (err: any) {
        showGlobalToast(err.toString(), 'error');
      }
    },

    updateQuantity: async (itemId, quantity) => {
      if (quantity <= 0) {
        await get().removeFromCart(itemId);
        return;
      }
      try {
        const res = await api.put('/cart', { foodItemId: itemId, quantity });
        const { items, restaurantId, restaurantName, couponCode, pricing } = res.data.cart;
        set({
          cartItems: items,
          restaurantId,
          restaurantName,
          couponCode,
          pricing,
        });
      } catch (err: any) {
        showGlobalToast(err.toString(), 'error');
      }
    },

    clearCart: async () => {
      try {
        const res = await api.delete('/cart');
        const { items, restaurantId, restaurantName, couponCode, pricing } = res.data.cart;
        set({
          cartItems: items,
          restaurantId,
          restaurantName,
          couponCode,
          pricing,
        });
        showGlobalToast('Cart cleared');
      } catch (err: any) {
        showGlobalToast(err.toString(), 'error');
      }
    },

    applyCoupon: async (code) => {
      try {
        const res = await api.post('/cart/coupon', { code });
        const { items, restaurantId, restaurantName, couponCode, pricing } = res.data.cart;
        set({
          cartItems: items,
          restaurantId,
          restaurantName,
          couponCode,
          pricing,
        });
        showGlobalToast('Coupon applied');
        return true;
      } catch (err: any) {
        showGlobalToast(err.toString(), 'error');
        return false;
      }
    },

    removeCoupon: async () => {
      try {
        const res = await api.post('/cart/coupon', { code: null });
        const { items, restaurantId, restaurantName, couponCode, pricing } = res.data.cart;
        set({
          cartItems: items,
          restaurantId,
          restaurantName,
          couponCode,
          pricing,
        });
        showGlobalToast('Coupon removed');
      } catch (err: any) {
        showGlobalToast(err.toString(), 'error');
      }
    },
  };
});
