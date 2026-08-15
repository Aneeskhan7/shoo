import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFilters, getProducts, qk } from '../lib/api';

/**
 * Filter state lives in the URL so results are shareable and back/forward work.
 * Shared by the Shop and Search pages, which differ only in chrome.
 */
export function useProductQuery() {
  const [params, setParams] = useSearchParams();

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(params);
      if (value == null || value === '' || next.get(key) === value) next.delete(key);
      else next.set(key, value);
      next.delete('page'); // any filter change resets pagination
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  /** Sets several params atomically — setParam() called twice in one handler
   *  would each build off the same stale closure and the second call would
   *  clobber the first (needed for the price-bucket filter, which is a
   *  minPrice + maxPrice pair). */
  const setParamsMulti = useCallback(
    (entries) => {
      const next = new URLSearchParams(params);
      entries.forEach(([key, value]) => {
        if (value == null || value === '') next.delete(key);
        else next.set(key, value);
      });
      next.delete('page');
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const setPage = useCallback(
    (page) => {
      const next = new URLSearchParams(params);
      next.set('page', String(page));
      setParams(next);
    },
    [params, setParams],
  );

  const clearAll = useCallback(() => {
    const next = new URLSearchParams();
    const q = params.get('q');
    if (q) next.set('q', q); // clearing filters must not clear the search term
    setParams(next, { replace: true });
  }, [params, setParams]);

  /** Full reset, including the search term — for the "no results at all"
   *  empty state, where offering to clear filters but leaving a query that
   *  still won't match anything isn't actually useful. */
  const resetAll = useCallback(() => {
    setParams(new URLSearchParams(), { replace: true });
  }, [setParams]);

  const query = useMemo(() => Object.fromEntries(params.entries()), [params]);

  const products = useQuery({
    queryKey: qk.products(query),
    queryFn: () => getProducts(query),
    // Product data (price, discount, stock, images) changes from the admin
    // panel and must be current the moment someone lands on /shop — the
    // global 60s staleTime is fine for content that rarely moves, but stale
    // catalogue data reads as "the save didn't work" to whoever's testing it.
    // refetchOnWindowFocus covers the common admin workflow of editing in
    // one tab and tabbing back to an already-open storefront tab to check.
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const filters = useQuery({ queryKey: qk.filters(), queryFn: getFilters });

  return {
    params,
    setParam,
    setParamsMulti,
    setPage,
    clearAll,
    resetAll,
    query,
    products,
    filters: filters.data,
  };
}
