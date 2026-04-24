import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ══════════════════════════════════════════════
// Cart Store — Multi-tenant (isolated by business)
// ══════════════════════════════════════════════
export const useCartStore = create(
  persist(
    (set, get) => ({
      // Structure: { [businessId]: { quantities: {}, notes: {}, comment: '' } }
      carts: {},
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      locationLink: '',
      locationLabel: '',

      _getCart: (bid) => get().carts[bid] || { quantities: {}, notes: {}, comment: '' },

      setQuantity: (bid, productId, qty) => set((s) => {
        const cart = s.carts[bid] || { quantities: {}, notes: {}, comment: '' };
        return {
          carts: {
            ...s.carts,
            [bid]: { ...cart, quantities: { ...cart.quantities, [productId]: Math.max(0, Math.floor(qty)) } }
          }
        };
      }),

      increment: (bid, productId) => set((s) => {
        const cart = s.carts[bid] || { quantities: {}, notes: {}, comment: '' };
        return {
          carts: {
            ...s.carts,
            [bid]: { ...cart, quantities: { ...cart.quantities, [productId]: (cart.quantities[productId] || 0) + 1 } }
          }
        };
      }),

      decrement: (bid, productId) => set((s) => {
        const cart = s.carts[bid] || { quantities: {}, notes: {}, comment: '' };
        return {
          carts: {
            ...s.carts,
            [bid]: { ...cart, quantities: { ...cart.quantities, [productId]: Math.max(0, (cart.quantities[productId] || 0) - 1) } }
          }
        };
      }),

      setNote: (bid, productId, note) => set((s) => {
        const cart = s.carts[bid] || { quantities: {}, notes: {}, comment: '' };
        return {
          carts: { ...s.carts, [bid]: { ...cart, notes: { ...cart.notes, [productId]: note } } }
        };
      }),

      setComment: (bid, comment) => set((s) => {
        const cart = s.carts[bid] || { quantities: {}, notes: {}, comment: '' };
        return { carts: { ...s.carts, [bid]: { ...cart, comment } } };
      }),

      setCustomer: (field, value) => set({ [field]: value }),
      setLocation: (link, label) => set({ locationLink: link, locationLabel: label }),

      // Helpers
      getCartData: (bid) => get()._getCart(bid),

      getTotalItems: (bid) => {
        const cart = get()._getCart(bid);
        return Object.values(cart.quantities).reduce((sum, v) => sum + (v > 0 ? v : 0), 0);
      },

      getTotalPrice: (bid, products) => {
        const cart = get()._getCart(bid);
        return products.reduce((sum, p) => sum + (cart.quantities[p.id] || 0) * p.price, 0);
      },

      getSelectedItems: (bid, products) => {
        const cart = get()._getCart(bid);
        return products
          .map((p) => ({ ...p, quantity: cart.quantities[p.id] || 0 }))
          .filter((p) => p.quantity > 0);
      },

      clearCart: (bid) => set((s) => ({
        carts: { ...s.carts, [bid]: { quantities: {}, notes: {}, comment: '' } }
      })),
    }),
    { 
      name: 'camly-multi-cart',
      partialize: (state) => ({ 
        carts: state.carts,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        // Excluimos customerAddress y locationLink de la persistencia para forzar fresh data
      }),
    }
  )
);

// ══════════════════════════════════════════════
// Business Store — Shared context
// ══════════════════════════════════════════════
export const useBusinessStore = create((set) => ({
  business: null,
  subscription: null,
  isPro: false,
  products: [],
  isLoading: true,
  error: null,
  setBusiness: (business, subscription) => {
    let isPro = false;
    if (subscription) {
       const isProPlan = subscription.plan === 'pro';
       const isActive = subscription.estado === 'activo';
       const isNotExpired = new Date(subscription.fecha_fin) > new Date();
       
       isPro = isProPlan && isActive && isNotExpired;
    }
    set({ business, subscription, isPro, isLoading: false });
  },
  setProducts: (products) => set({ products }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));

// ══════════════════════════════════════════════
// Auth & Global Stores
// ══════════════════════════════════════════════
export const useAuthStore = create((set) => ({
  session: null,
  setSession: (session) => set({ session }),
}));

let toastId = 0;
export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
