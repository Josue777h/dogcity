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
        const cart = s.carts[bid] || { quantities: {}, notes: {}, itemOptions: {}, comment: '' };
        return {
          carts: { ...s.carts, [bid]: { ...cart, notes: { ...cart.notes, [productId]: note } } }
        };
      }),

      setItemOptions: (bid, productId, options) => set((s) => {
        const cart = s.carts[bid] || { quantities: {}, notes: {}, itemOptions: {}, comment: '' };
        return {
          carts: { 
            ...s.carts, 
            [bid]: { 
              ...cart, 
              itemOptions: { ...(cart.itemOptions || {}), [productId]: options } 
            } 
          }
        };
      }),

      setComment: (bid, comment) => set((s) => {
        const cart = s.carts[bid] || { quantities: {}, notes: {}, itemOptions: {}, comment: '' };
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
        const itemOptions = cart.itemOptions || {};
        return products.reduce((sum, p) => {
          const qty = cart.quantities[p.id] || 0;
          if (qty <= 0) return sum;
          const optionsCost = (itemOptions[p.id] || []).reduce((acc, opt) => acc + (Number(opt.precio) || 0), 0);
          return sum + qty * (Number(p.price) + optionsCost);
        }, 0);
      },

      getSelectedItems: (bid, products) => {
        const cart = get()._getCart(bid);
        const itemOptions = cart.itemOptions || {};
        return products
          .map((p) => {
            const qty = cart.quantities[p.id] || 0;
            const options = itemOptions[p.id] || [];
            const optionsCost = options.reduce((acc, opt) => acc + (Number(opt.precio) || 0), 0);
            const unitPrice = Number(p.price) + optionsCost;
            const opciones_texto = options.map(o => o.nombre + (Number(o.precio) > 0 ? ` (+$${Number(o.precio).toLocaleString('es-CO')})` : '')).join(', ');
            return {
              ...p,
              quantity: qty,
              price: unitPrice,
              base_price: p.price,
              options,
              opciones_texto,
            };
          })
          .filter((p) => p.quantity > 0);
      },

      clearCart: (bid) => set((s) => ({
        carts: { ...s.carts, [bid]: { quantities: {}, notes: {}, itemOptions: {}, comment: '' } }
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
  isExpired: false,
  trialDaysLeft: 0,
  products: [],
  categories: [],
  isLoading: true,
  error: null,
  setBusiness: (business, subscription) => {
    let isPro = false;
    let isExpired = false;
    let trialDaysLeft = 0;
    
    if (subscription) {
       const isProPlan = subscription.plan === 'pro';
       const isActive = subscription.estado === 'activo' || subscription.estado === 'trial';
       const endDate = subscription.fecha_fin ? new Date(subscription.fecha_fin) : null;
       const now = new Date();
       
       isExpired = subscription.estado === 'vencido' || (endDate ? now > endDate : false);
       isPro = isProPlan && isActive && !isExpired;
       
       if (subscription.estado === 'trial' && !isExpired && endDate) {
         const diffTime = Math.abs(endDate - now);
         trialDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
       }
    } else {
       // Si el negocio no tiene suscripción se bloquea como expired por seguridad
       // o puedes dejarlo false dependiendo del flujo legacy
       isExpired = false; 
       // Se deja en `false` por ahora para no bloquear tiendas legacy (hasta migración completa).
    }
    set({ business, subscription, isPro, isExpired, trialDaysLeft, isLoading: false });
  },
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
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
