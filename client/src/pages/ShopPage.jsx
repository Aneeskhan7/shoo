import { useProductQuery } from '../hooks/useProductQuery';
import FilterBar from '../components/product/FilterBar';
import SearchSidebar from '../components/product/SearchSidebar';
import ProductGrid from '../components/product/ProductGrid';
import Pagination from '../components/product/Pagination';

/**
 * Shop / Products — also serves New Releases, Men, Women, Kids (Navbar links
 * to this same route with tag/gender query params). No dedicated frame
 * exists in Figma, so this reuses the Search Results layout (41:127):
 * result count, chip filter row, facet sidebar, 4-up grid, pagination.
 */
export default function ShopPage() {
  const { params, setParam, setParamsMulti, setPage, clearAll, resetAll, products, filters } =
    useProductQuery();

  const list = products.data?.products ?? [];
  const hasAnyParams = [...params.keys()].length > 0;
  const pagination = products.data?.pagination;

  return (
    <div className="min-h-screen bg-off-white pt-[120px] text-black lg:pt-[128px]">
      <header className="px-6 pb-6 pt-12 lg:px-20">
        <p className="text-eyebrow text-grey-500">Shop</p>
        <h1 className="text-display-l mt-4">All Products</h1>
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
