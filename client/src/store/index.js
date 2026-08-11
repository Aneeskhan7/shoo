import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Phase 1 cart lives in localStorage and stores only variantId + quantity.
 * Prices shown are a convenience copy for instant rendering — every total that
 * matters is recomputed server-side in /cart/validate and /orders.
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      add: (item, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, 20) }
                  : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, quantity }] };
        }),

      setQuantity: (variantId, quantity) =>
        set((s) => ({
          items:
            quantity < 1
              ? s.items.filter((i) => i.variantId !== variantId)
              : s.items.map((i) =>
                  i.variantId === variantId ? { ...i, quantity: Math.min(quantity, 20) } : i,
                ),
        })),

      remove: (variantId) =>
        set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),

      clear: () => set({ items: [], promoCode: null }),

      promoCode: null,
      setPromoCode: (promoCode) => set({ promoCode }),

      shippingMethod: 'STANDARD',
      setShippingMethod: (shippingMethod) => set({ shippingMethod }),

      /** The minimal shape the API accepts — never send prices from the client. */
      lines: () => get().items.map(({ variantId, quantity }) => ({ variantId, quantity })),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
    }),
    {
      name: 'shoo-cart',
      partialize: (s) => ({
        items: s.items,
        promoCode: s.promoCode,
        shippingMethod: s.shippingMethod,
      }),
    },
  ),
);

/** Last N product slugs viewed, most recent first — powers the "Recently
 * Viewed" strip on the product page. No server persistence: this is
 * per-browser, works identically for guests and members, and needs nothing
 * beyond what's already fetched via the existing product APIs. */
export const useRecentlyViewedStore = create(
  persist(
    (set) => ({
      slugs: [],
      add: (slug) =>
        set((s) => ({ slugs: [slug, ...s.slugs.filter((x) => x !== slug)].slice(0, 8) })),
    }),
    { name: 'shoo-recently-viewed' },
  ),
);

export const useUIStore = create((set) => ({
  cartOpen: false,
  menuOpen: false,
  searchOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  closeAll: () => set({ cartOpen: false, menuOpen: false, searchOpen: false }),
}));

/**
 * SHOO membership — entirely optional.
 *
 * `status` starts as 'loading' so nothing renders a signed-out state before
 * /auth/me answers. Guests sit at 'guest' forever and every shopping and
 * checkout path works untouched; signing in only unlocks account features.
 */
export const useAuthStore = create((set) => ({
  user: null,
  status: 'loading', // 'loading' | 'guest' | 'member'
  setUser: (user) => set({ user, status: user ? 'member' : 'guest' }),
  setGuest: () => set({ user: null, status: 'guest' }),
  isMember: () => Boolean(useAuthStore.getState().user),
}));
