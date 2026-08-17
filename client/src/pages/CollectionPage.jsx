import { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useProductQuery } from '../hooks/useProductQuery';
import { COLLECTIONS } from '../lib/collections';
import FilterBar from '../components/product/FilterBar';
import SearchSidebar from '../components/product/SearchSidebar';
import ProductGrid from '../components/product/ProductGrid';
import Pagination from '../components/product/Pagination';
import Seo from '../components/seo/Seo';

/**
 * Real, indexable URL per primary browsing intent — reuses the exact same
 * /shop query-param engine underneath (useProductQuery's baseFilters
 * override), just with its own <h1>/intro and a self-referencing canonical
 * instead of /shop's hardcoded-to-bare-/shop one. See SEO plan, Phase 2.
 */
export default function CollectionPage() {
  const { slug } = useParams();
  const def = COLLECTIONS[slug];

  // Stable across renders for a given slug — matches the `filters` object
  // literal identity useProductQuery expects as a query-key dependency.
  const baseFilters = useMemo(() => def?.filters ?? {}, [def]);

  const { params, setParam, setParamsMulti, setPage, clearAll, resetAll, products, filters } =
    useProductQuery(baseFilters);

  if (!def) return <Navigate to="/shop" replace />;

  const list = products.data?.products ?? [];
  const hasAnyParams = [...params.keys()].length > 0;
  const pagination = products.data?.pagination;

  return (
    <div className="min-h-screen bg-off-white pt-[120px] text-black lg:pt-[128px]">
      <Seo title={def.label} description={def.intro} canonical={`/collections/${slug}`} />
      <header className="px-6 pb-6 pt-12 lg:px-20">
        <p className="text-eyebrow text-grey-500">Shop</p>
        <h1 className="text-display-l mt-4">{def.label}</h1>
        <p className="mt-4 max-w-[520px] text-[15px] leading-[1.6] text-grey-500">{def.intro}</p>
      </header>

      <FilterBar params={params} setParam={setParam} clearAll={clearAll} filters={filters} />

      <div className="px-6 py-3 lg:px-20">
        <p className="text-[13px] text-grey-500">
          {pagination ? `${pagination.total} product${pagination.total === 1 ? '' : 's'}` : '…'}
        </p>
      </div>

      <div className="flex gap-10 px-6 pb-20 lg:px-20">
        <SearchSidebar
          params={params}
          setParam={setParam}
          setParamsMulti={setParamsMulti}
          filters={filters}
          list={list}
          className="hidden w-[224px] shrink-0 lg:flex"
        />

        <div className="min-w-0 flex-1">
          <ProductGrid
            products={list}
            isLoading={products.isLoading}
            error={products.error}
            emptyMessage="No products match your filters"
            onClearFilters={hasAnyParams ? resetAll : undefined}
            badgeFor={(p) => (p.tags?.includes('new-release') ? 'New' : null)}
          />

          {pagination && (
            <div className="mt-14">
              <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
