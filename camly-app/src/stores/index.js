import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ══════════════════════════════════════════════
// Cart Store — Multi-tenant (isolated by business)
// ══════════════════════════════════════════════
export const useCartStore = create(
  persist(
    (set, get) => ({
      // Structure: { [businessId]: { items: [ { cartItemId, productId, quantity, options, note } ], comment: '' } }
      carts: {},
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      locationLink: '',
      locationLabel: '',

      _getCart: (bid) => {
        const c = get().carts[bid];
        if (!c) return { items: [], quantities: {}, notes: {}, itemOptions: {}, comment: '' };
        // Migrate legacy { quantities, notes, itemOptions } format to items array if needed
        let items = Array.isArray(c.items) ? [...c.items] : [];
        if (items.length === 0 && c.quantities && Object.keys(c.quantities).length > 0) {
          items = Object.entries(c.quantities)
            .filter(([_, qty]) => qty > 0)
            .map(([pid, qty]) => ({
              cartItemId: `item_${pid}_legacy`,
              productId: pid,
              quantity: qty,
              options: c.itemOptions?.[pid] || [],
              note: c.notes?.[pid] || '',
            }));
        }
        return { ...c, items };
      },

      // Add a customized or standard product to cart
      addItem: (bid, product, { options = [], note = '', quantity = 1 } = {}) => set((s) => {
        const cart = get()._getCart(bid);
        const optionsList = Array.isArray(options) ? options : [];
        const cleanNote = (note || '').trim();
        const cleanQty = Math.max(1, Math.floor(quantity || 1));

        // Create a signature to group identical customizations
        const optionsKey = optionsList.map(o => `${o.id || o.nombre}_${o.precio || 0}`).sort().join('|');

        // Check if an existing item has the exact same options and note
        const existingIdx = cart.items.findIndex(i => {
          if (i.productId !== product.id) return false;
          const iKey = (i.options || []).map(o => `${o.id || o.nombre}_${o.precio || 0}`).sort().join('|');
          return iKey === optionsKey && (i.note || '').trim() === cleanNote;
        });

        let newItems;
        if (existingIdx >= 0) {
          newItems = [...cart.items];
          newItems[existingIdx] = {
            ...newItems[existingIdx],
            quantity: newItems[existingIdx].quantity + cleanQty
          };
        } else {
          const newItem = {
            cartItemId: `${product.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            productId: product.id,
            quantity: cleanQty,
            options: optionsList,
            note: cleanNote,
            addedAt: Date.now()
          };
          newItems = [...cart.items, newItem];
        }

        return {
          carts: {
            ...s.carts,
            [bid]: {
              ...cart,
              items: newItems,
              // Mantener compatibilidad con stores heredados
              quantities: newItems.reduce((acc, it) => ({ ...acc, [it.productId]: (acc[it.productId] || 0) + it.quantity }), {})
            }
          }
        };
      }),

      // Increment a specific cart item or first item of product
      increment: (bid, itemIdOrProductId) => set((s) => {
        const cart = get()._getCart(bid);
        let newItems = [...cart.items];
        const byItemIdIdx = newItems.findIndex(i => i.cartItemId === itemIdOrProductId);
        if (byItemIdIdx >= 0) {
          newItems[byItemIdIdx] = { ...newItems[byItemIdIdx], quantity: newItems[byItemIdIdx].quantity + 1 };
        } else {
          const byPidIdx = newItems.findLastIndex(i => i.productId === itemIdOrProductId);
          if (byPidIdx >= 0) {
            newItems[byPidIdx] = { ...newItems[byPidIdx], quantity: newItems[byPidIdx].quantity + 1 };
          } else {
            // New uncustomized item
            newItems.push({
              cartItemId: `${itemIdOrProductId}_${Date.now()}`,
              productId: itemIdOrProductId,
              quantity: 1,
              options: [],
              note: ''
            });
          }
        }
        return {
          carts: {
            ...s.carts,
            [bid]: {
              ...cart,
              items: newItems,
              quantities: newItems.reduce((acc, it) => ({ ...acc, [it.productId]: (acc[it.productId] || 0) + it.quantity }), {})
            }
          }
        };
      }),

      // Decrement a specific cart item or last item of product
      decrement: (bid, itemIdOrProductId) => set((s) => {
        const cart = get()._getCart(bid);
        let newItems = [...cart.items];
        const byItemIdIdx = newItems.findIndex(i => i.cartItemId === itemIdOrProductId);
        if (byItemIdIdx >= 0) {
          if (newItems[byItemIdIdx].quantity > 1) {
            newItems[byItemIdIdx] = { ...newItems[byItemIdIdx], quantity: newItems[byItemIdIdx].quantity - 1 };
          } else {
            newItems.splice(byItemIdIdx, 1);
          }
        } else {
          const byPidIdx = newItems.findLastIndex(i => i.productId === itemIdOrProductId);
          if (byPidIdx >= 0) {
            if (newItems[byPidIdx].quantity > 1) {
              newItems[byPidIdx] = { ...newItems[byPidIdx], quantity: newItems[byPidIdx].quantity - 1 };
            } else {
              newItems.splice(byPidIdx, 1);
            }
          }
        }
        return {
          carts: {
            ...s.carts,
            [bid]: {
              ...cart,
              items: newItems,
              quantities: newItems.reduce((acc, it) => ({ ...acc, [it.productId]: (acc[it.productId] || 0) + it.quantity }), {})
            }
          }
        };
      }),

      // Remove specific item directly
      removeItem: (bid, cartItemId) => set((s) => {
        const cart = get()._getCart(bid);
        const newItems = cart.items.filter(i => i.cartItemId !== cartItemId);
        return {
          carts: {
            ...s.carts,
            [bid]: {
              ...cart,
              items: newItems,
              quantities: newItems.reduce((acc, it) => ({ ...acc, [it.productId]: (acc[it.productId] || 0) + it.quantity }), {})
            }
          }
        };
      }),

      setComment: (bid, comment) => set((s) => {
        const cart = get()._getCart(bid);
        return { carts: { ...s.carts, [bid]: { ...cart, comment } } };
      }),

      setCustomer: (field, value) => set({ [field]: value }),
      setLocation: (link, label) => set({ locationLink: link, locationLabel: label }),

      // Helpers
      getCartData: (bid) => get()._getCart(bid),

      getProductTotalQuantity: (bid, productId) => {
        const cart = get()._getCart(bid);
        return cart.items
          .filter(i => i.productId === productId)
          .reduce((sum, i) => sum + i.quantity, 0);
      },

      getTotalItems: (bid) => {
        const cart = get()._getCart(bid);
        return cart.items.reduce((sum, i) => sum + (i.quantity > 0 ? i.quantity : 0), 0);
      },

      getTotalPrice: (bid, products) => {
        const cart = get()._getCart(bid);
        const prodMap = new Map((products || []).map(p => [p.id, p]));
        return cart.items.reduce((sum, item) => {
          const p = prodMap.get(item.productId);
          if (!p) return sum;
          const optionsCost = (item.options || []).reduce((acc, opt) => acc + (Number(opt.precio) || 0), 0);
          return sum + item.quantity * (Number(p.price) + optionsCost);
        }, 0);
      },

      getSelectedItems: (bid, products) => {
        const cart = get()._getCart(bid);
        const prodMap = new Map((products || []).map(p => [p.id, p]));
        return cart.items
          .map((item) => {
            const p = prodMap.get(item.productId);
            if (!p) return null;
            const options = item.options || [];
            const optionsCost = options.reduce((acc, opt) => acc + (Number(opt.precio) || 0), 0);
            const unitPrice = Number(p.price) + optionsCost;
            const opciones_texto = options
              .map(o => o.nombre + (Number(o.precio) > 0 ? ` (+$${Number(o.precio).toLocaleString('es-CO')})` : ''))
              .join(', ');
            return {
              ...p,
              cartItemId: item.cartItemId,
              productId: item.productId,
              quantity: item.quantity,
              price: unitPrice,
              base_price: p.price,
              options,
              opciones_texto,
              note: item.note || '',
            };
          })
          .filter(Boolean);
      },

      clearCart: (bid) => set((s) => ({
        carts: { ...s.carts, [bid]: { items: [], quantities: {}, notes: {}, itemOptions: {}, comment: '' } }
      })),
    }),
    { 
      name: 'camly-multi-cart',
      partialize: (state) => ({ 
        carts: state.carts,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
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
