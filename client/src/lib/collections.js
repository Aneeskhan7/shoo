/**
 * Slug -> filter definition for the clean collection URLs (Phase 2 of the
 * SEO plan). Single source of truth, used by CollectionPage.jsx (to build
 * the query + <h1>/intro), ShopPage.jsx (to redirect an equivalent
 * single-filter /shop?... URL here), and the server sitemap.
 *
 * `filters` values must match FilterBar.jsx's SILHOUETTE_VALUE mapping and
 * the productController's gender/tag enums exactly — these are the same
 * filters /shop already understands, just given a real path.
 */
export const COLLECTIONS = {
  'mens-sneakers': {
    label: "Men's Sneakers",
    intro: "Sneakers cut for men's sizing — every silhouette, one place.",
    filters: { gender: 'MEN' },
  },
  'womens-sneakers': {
    label: "Women's Sneakers",
    intro: "Sneakers cut for women's sizing — every silhouette, one place.",
    filters: { gender: 'WOMEN' },
  },
  'kids-sneakers': {
    label: "Kids' Sneakers",
    intro: 'Sized for growing feet, without the compromise on style.',
    filters: { gender: 'KIDS' },
  },
  'unisex-sneakers': {
    label: 'Unisex Sneakers',
    intro: 'One fit, no gendered sizing — pairs built to work on anyone.',
    filters: { gender: 'UNISEX' },
  },
  'new-releases': {
    label: 'New Releases',
    intro: 'The latest pairs to land on SHOO.',
    filters: { tag: 'new-release' },
  },
  'running-shoes': {
    label: 'Running Shoes',
    intro: 'Built for miles — lightweight runners for everyday training.',
    filters: { silhouette: 'Runners' },
  },
  'high-top-sneakers': {
    label: 'High-Top Sneakers',
    intro: 'Ankle-covering silhouettes with a street-first stance.',
    filters: { silhouette: 'High-Top' },
  },
  'lifestyle-sneakers': {
    label: 'Lifestyle Sneakers',
    intro: 'Everyday sneakers built for comfort as much as looks.',
    filters: { silhouette: 'Lifestyle' },
  },
  'trail-sneakers': {
    label: 'Trail Sneakers',
    intro: 'Rugged outsoles and reinforced uppers for off-road wear.',
    filters: { silhouette: 'Trainers' },
  },
};

const FILTER_KEYS = ['gender', 'size', 'color', 'brand', 'category', 'tag', 'available', 'silhouette', 'q'];

/**
 * If `params` carries exactly one real filter (gender/tag/silhouette/etc.)
 * and it matches a defined collection's sole filter, returns that
 * collection's slug — used by ShopPage.jsx to redirect the old
 * `/shop?gender=MEN` style link to its clean equivalent. `page`/`sort`
 * aren't filters in this sense, so their presence doesn't block a match.
 */
export function matchCollectionSlug(params) {
  const active = FILTER_KEYS.map((k) => [k, params.get(k)]).filter(([, v]) => v);
  if (active.length !== 1) return null;
  const [key, value] = active[0];
  return (
    Object.entries(COLLECTIONS).find(([, def]) => {
      const entries = Object.entries(def.filters);
      return entries.length === 1 && entries[0][0] === key && entries[0][1] === value;
    })?.[0] ?? null
  );
}

/** The leftover query string (page/sort etc.) once the single filter key
 *  that resolved `matchCollectionSlug` is stripped out — carried over onto
 *  the redirect target so pagination/sort state isn't lost. */
export function stripCollectionFilterKeys(params) {
  const rest = new URLSearchParams(params);
  FILTER_KEYS.forEach((k) => rest.delete(k));
  const s = rest.toString();
  return s ? `?${s}` : '';
}
