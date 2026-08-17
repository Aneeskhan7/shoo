import { Navigate } from 'react-router-dom';
import { useProductQuery } from '../hooks/useProductQuery';
import FilterBar from '../components/product/FilterBar';
import SearchSidebar from '../components/product/SearchSidebar';
import ProductGrid from '../components/product/ProductGrid';
import Pagination from '../components/product/Pagination';
import Seo from '../components/seo/Seo';
import { matchCollectionSlug, stripCollectionFilterKeys } from '../lib/collections';

const GENDER_TITLE = { MEN: "Men's", WOMEN: "Women's", KIDS: "Kids'", UNISEX: 'Unisex' };
// Mirrors FilterBar.jsx's SILHOUETTE_VALUE mapping (display label -> stored value).
const SILHOUETTE_TITLE = { Runners: 'Running', 'High-Top': 'High-Top', Lifestyle: 'Lifestyle', Trainers: 'Trail' };

/** Every filter combination renders the identical <h1>All Products</h1>
 *  template below — there's no unique content per filter, so this only
 *  varies the <title> (tab label, share previews, browser history); the
 *  canonical stays hardcoded to bare /shop (see the <Seo> call). */
function shopTitle(params) {
  const gender = GENDER_TITLE[params.get('gender')];
  const silhouette = SILHOUETTE_TITLE[params.get('silhouette')];
  if (params.get('tag') === 'new-release') return 'New Releases';
  if (gender && silhouette) return `${gender} ${silhouette} Sneakers`;
  if (gender) return `${gender} Sneakers`;
  if (silhouette) return `${silhouette} Sneakers`;
  return 'Shop All Sneakers';
}

/**
 * Shop / Products — also serves New Releases, Men, Women, Kids (Navbar links
 * to this same route with tag/gender query params). No dedicated frame
 * exists in Figma, so this reuses the Search Results layout (41:127):
 * result count, chip filter row, facet sidebar, 4-up grid, pagination.
 */
export default function ShopPage() {
  const { params, setParam, setParamsMulti, setPage, clearAll, resetAll, products, filters } =
    useProductQuery();

  // Old single-filter links (Navbar's "?gender=MEN" etc.) now have a real
  // collection URL — consolidate any inbound SEO signal there instead of
  // serving the same content twice. Multi-filter/ad-hoc combos stay here.
  const collectionSlug = matchCollectionSlug(params);
  if (collectionSlug) {
    return <Navigate to={`/collections/${collectionSlug}${stripCollectionFilterKeys(params)}`} replace />;
  }

  const list = products.data?.products ?? [];
  const hasAnyParams = [...params.keys()].length > 0;
  const pagination = products.data?.pagination;

  return (
    <div className="min-h-screen bg-off-white pt-[120px] text-black lg:pt-[128px]">
      {/* canonical hardcoded to bare /shop — every query-param combination
          renders this identical template, so none of them are unique
          enough to index separately (see plan doc, Phase 1 canonical
          decision). Title still varies per filter for tabs/history/shares. */}
      <Seo title={shopTitle(params)} canonical="/shop" />
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
