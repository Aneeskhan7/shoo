import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchMe, signIn as apiSignIn, joinShoo as apiJoin, signOut as apiSignOut } from '../lib/api';
import { useAuthStore } from '../store';

/**
 * Hydrates membership state once at app start. A failed or empty /auth/me is a
 * normal guest, never an error — the store simply settles on 'guest' and the
 * whole storefront keeps working.
 */
export function useAuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser);
  const setGuest = useAuthStore((s) => s.setGuest);

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((d) => !cancelled && setUser(d.user ?? null))
      .catch(() => !cancelled && setGuest());
    return () => {
      cancelled = true;
    };
  }, [setUser, setGuest]);
}

export function useAuthActions() {
  const setUser = useAuthStore((s) => s.setUser);
  const setGuest = useAuthStore((s) => s.setGuest);
  const qc = useQueryClient();

  return {
    signIn: async (payload) => {
      const data = await apiSignIn(payload);
      setUser(data.user);
      qc.invalidateQueries();
      return data;
    },
    join: async (payload) => {
      const data = await apiJoin(payload);
      setUser(data.user);
      qc.invalidateQueries();
      return data;
    },
    signOut: async () => {
      await apiSignOut();
      setGuest();
      // Drop member-scoped caches; the cart is deliberately left alone so
      // signing out never empties someone's bag.
      qc.removeQueries({ queryKey: ['account'] });
      qc.invalidateQueries();
    },
  };
}
