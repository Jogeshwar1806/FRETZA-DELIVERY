import { create } from 'zustand';
import type { UserProfile, Address, Order } from '../types';
import { api } from '../services/api';
import { useCartStore } from './useCartStore';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: UserProfile | null;
  addresses: Address[];
  orders: Order[];
  login: (phone: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getMe: () => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  placeOrder: (orderDetail: any) => Promise<any>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Listen for unauthorized events to clear session
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-unauthorized', () => {
      set({
        isAuthenticated: false,
        currentUser: null,
        addresses: [],
        orders: [],
      });
    });
  }

  return {
    isAuthenticated: !!localStorage.getItem('fretza_token'),
    isLoading: false,
    currentUser: null,
    addresses: [],
    orders: [],

    login: async (phone, password) => {
      set({ isLoading: true });
      try {
        const response = await api.post('/auth/login', { phone, password });
        const { token, user } = response.data;
        
        localStorage.setItem('fretza_token', token);
        
        set({
          isAuthenticated: true,
          currentUser: user,
          addresses: user.addresses || [],
          isLoading: false,
        });
        return true;
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    register: async (name, email, phone, password) => {
      set({ isLoading: true });
      try {
        const response = await api.post('/auth/register', { name, email, phone, password });
        const { token, user } = response.data;
        
        localStorage.setItem('fretza_token', token);
        
        set({
          isAuthenticated: true,
          currentUser: user,
          addresses: user.addresses || [],
          isLoading: false,
        });
        return true;
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    logout: async () => {
      try {
        await api.post('/auth/logout');
      } catch (err) {
        // Suppress errors during logout
      } finally {
        localStorage.removeItem('fretza_token');
        set({
          isAuthenticated: false,
          currentUser: null,
          addresses: [],
          orders: [],
          isLoading: false,
        });
      }
    },

    getMe: async () => {
      if (!localStorage.getItem('fretza_token')) return;
      set({ isLoading: true });
      try {
        const response = await api.get('/auth/me');
        const { user } = response.data;
        set({
          isAuthenticated: true,
          currentUser: user,
          addresses: user.addresses || [],
          isLoading: false,
        });
      } catch (error) {
        localStorage.removeItem('fretza_token');
        set({
          isAuthenticated: false,
          currentUser: null,
          addresses: [],
          isLoading: false,
        });
      }
    },

    addAddress: async (newAddr) => {
      try {
        const res = await api.post('/addresses', newAddr);
        const mapped = res.data.addresses.map((a: any) => ({ ...a, id: a._id }));
        set({ addresses: mapped });
        const { currentUser } = get();
        if (currentUser) {
          set({ currentUser: { ...currentUser, addresses: mapped } });
        }
      } catch (err) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('toast-notification', { detail: { message: 'Could not add address', type: 'error' } }));
        }
      }
    },

    setDefaultAddress: async (addressId) => {
      try {
        const res = await api.put(`/addresses/${addressId}/default`);
        const mapped = res.data.addresses.map((a: any) => ({ ...a, id: a._id }));
        set({ addresses: mapped });
        const { currentUser } = get();
        if (currentUser) {
          set({ currentUser: { ...currentUser, addresses: mapped } });
        }
      } catch (err) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('toast-notification', { detail: { message: 'Could not set default address', type: 'error' } }));
        }
      }
    },

    deleteAddress: async (addressId) => {
      try {
        const res = await api.delete(`/addresses/${addressId}`);
        const mapped = res.data.addresses.map((a: any) => ({ ...a, id: a._id }));
        set({ addresses: mapped });
        const { currentUser } = get();
        if (currentUser) {
          set({ currentUser: { ...currentUser, addresses: mapped } });
        }
      } catch (err) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('toast-notification', { detail: { message: 'Could not delete address', type: 'error' } }));
        }
      }
    },

    updateProfile: (profile) => {
      const { currentUser } = get();
      if (!currentUser) return;
      set({
        currentUser: {
          ...currentUser,
          ...profile,
        },
      });
    },

    placeOrder: async (orderDetail) => {
      try {
        const res = await api.post('/orders', orderDetail);
        // Sync cart after placing order
        useCartStore.getState().fetchCart();
        return res.data.order;
      } catch (err: any) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('toast-notification', {
              detail: { message: typeof err === 'string' ? err : 'Order creation failed', type: 'error' },
            })
          );
        }
        throw err;
      }
    },
  };
});
