import { useEffect, useState } from 'react';
import { useProductQuery } from '../hooks/useProductQuery';
import FilterBar from '../components/product/FilterBar';
import SearchSidebar from '../components/product/SearchSidebar';
import ProductGrid from '../components/product/ProductGrid';
import Pagination from '../components/product/Pagination';

/**
 * Search Results — Figma 41:127.
 *   search bar 880×52, r999, #f2f2f2, 1.5px black border, query in 22px Black
 *   "⎋ to close" hint pill · result count · chip row · 4-up grid · pagination
 */
export default function SearchPage() {
  const { params, setParam, setParamsMulti, setPage, clearAll, resetAll, products, filters } =
    useProductQuery();
  const q = params.get('q') ?? '';
  const [term, setTerm] = useState(q);
  const hasAnyParams = [...params.keys()].length > 0;

  useEffect(() => setTerm(q), [q]);

  const list = products.data?.products ?? [];
  const pagination = products.data?.pagination;

  return (
    <div className="min-h-screen bg-off-white pt-[120px] text-black lg:pt-[128px]">
      {/* Search bar */}
      <div className="flex items-center justify-center gap-[12px] bg-white px-6 py-4 lg:px-[64px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam('q', term.trim() || null);
          }}
          className="flex h-[52px] w-full max-w-[880px] items-center gap-[14px] rounded-full border-[1.5px] border-black bg-[#f2f2f2] px-[24px]"
        >
          <span className="text-[18px] text-grey-500" aria-hidden="true">
            🔍
          </span>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search sneakers"
            aria-label="Search products"
            className="w-full min-w-0 flex-1 bg-transparent text-[18px] font-black tracking-[-0.005em] outline-none placeholder:font-normal placeholder:text-grey-500 sm:text-[22px]"
          />
          {term && (
            <button
              type="button"
              onClick={() => {
                setTerm('');
                setParam('q', null);
              }}
              aria-label="Clear search"
              className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#d3d3d3] text-[14px] font-bold text-grey-700"
            >
              ×
            </button>
          )}
        </form>
        <span className="hidden rounded-[7px] bg-[#f2f2f2] px-[10px] py-[7px] text-[11px] tracking-[0.01em] text-grey-500 lg:inline">
          ⎋ to close
        </span>
      </div>

      <div className="px-6 py-3 lg:px-20">
        <p className="text-[13px] text-grey-500">
          {pagination
            ? `${pagination.total} result${pagination.total === 1 ? '' : 's'}${q ? ` for “${q}”` : ''}`
            : '…'}
        </p>
      </div>

      <FilterBar params={params} setParam={setParam} clearAll={clearAll} filters={filters} />

      <div className="flex gap-10 px-6 pb-20 pt-6 lg:px-20">
        {/* Desktop only — Figma 41:170 has no sub-1440 frame, and the chip
            row above already covers filtering on mobile. */}
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
            emptyMessage={q ? 'No products found' : 'Start typing to search'}
            onClearFilters={hasAnyParams ? resetAll : undefined}
            badgeFor={(p) =>
              q && p.name.toLowerCase().includes(q.toLowerCase()) ? 'Exact match' : null
            }
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
