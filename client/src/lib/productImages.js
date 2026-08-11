/**
 * ============================================================================
 * TEMPORARY DEVELOPMENT PLACEHOLDER IMAGES — NOT FINAL SHOO PHOTOGRAPHY
 * ============================================================================
 * Source: Pexels (https://www.pexels.com/license/) — free to use, no
 * attribution required, commercial use permitted. Generic stock sneaker
 * photos, not SHOO products. Do not use in marketing; replace before launch.
 *
 * THIS FILE IS THE ONLY PLACE TEMPORARY IMAGES ARE MAPPED TO PRODUCTS.
 * No component hardcodes an image path — every card/gallery/thumbnail calls
 * `getProductImages(product)` below, which prefers a real ProductImage row
 * from the database (`product.images[]`, url set) and falls back to this map
 * only when that's empty.
 *
 * The database path is LIVE today: every product's primary ProductImage.url
 * already points at the local temp file below (see
 * server/prisma/schema.prisma `ProductImage`). This map exists as a fallback
 * for any product whose DB row is somehow empty, and as one readable place to
 * see the whole current mapping.
 *
 * ── TO SWAP IN REAL SHOO PHOTOGRAPHY ────────────────────────────────────
 * Two options, no component changes needed either way:
 *   1. Preferred: UPDATE ProductImage.url for each product (or add rows for
 *      multiple angles — hero/side/front/rear/detail, ordered by `position`).
 *      getProductImages() already reads this first.
 *   2. Quick local swap: replace the files in
 *      client/public/assets/products/<slug>/ keeping the same filenames —
 *      no code or DB change needed since the URLs are unchanged.
 * ============================================================================
 */

const BASE = '/assets/products';

/** slug -> ordered list of image paths. First = primary/hero. */
export const PRODUCT_IMAGES = {
  'shoo-drift-one': [`${BASE}/shoo-drift-one/shoo-drift-one-01.webp`],
  'shoo-orbit-lx': [`${BASE}/shoo-orbit-lx/shoo-orbit-lx-01.webp`],
  'shoo-pulse': [`${BASE}/shoo-pulse/shoo-pulse-01.webp`],
  'shoo-ground-x': [`${BASE}/shoo-ground-x/shoo-ground-x-01.webp`],
  'shoo-form-low': [`${BASE}/shoo-form-low/shoo-form-low-01.webp`],
  'shoo-drift-lace': [`${BASE}/shoo-drift-lace/shoo-drift-lace-01.webp`],
  'shoo-drift-low': [`${BASE}/shoo-drift-low/shoo-drift-low-01.webp`],
  'shoo-drift-hi': [`${BASE}/shoo-drift-hi/shoo-drift-hi-01.webp`],
  'shoo-drift-sport': [`${BASE}/shoo-drift-sport/shoo-drift-sport-01.webp`],
  'shoo-drift-lite': [`${BASE}/shoo-drift-lite/shoo-drift-lite-01.webp`],
  'shoo-drift-slide': [`${BASE}/shoo-drift-slide/shoo-drift-slide-01.webp`],
  'shoo-drift-sock': [`${BASE}/shoo-drift-sock/shoo-drift-sock-01.webp`],
  'shoo-drift-mini': [`${BASE}/shoo-drift-mini/shoo-drift-mini-01.webp`],
  'shoo-pulse-kids': [`${BASE}/shoo-pulse-kids/shoo-pulse-kids-01.webp`],
};

/** Generic fallback for a slug this map doesn't (yet) cover. */
const FALLBACK = [`${BASE}/shoo-drift-one/shoo-drift-one-01.webp`];

/**
 * Resolves the image list for a product. Real product.images[] (from the API)
 * always wins when present; the temporary map is Phase-1-only filler.
 *
 * Each product currently has exactly one temporary photo — the PDP gallery
 * repeats it rather than inventing fake angles. When real photography lands
 * (hero/side/front/rear/detail per product), those extra ProductImage rows
 * populate the same gallery with zero UI changes.
 */
export function getProductImages(product) {
  // Thrift-condition close-ups (outsole, heel, etc.) are tagged and live in
  // the same product.images[] rows, but they're not part of the main
  // gallery — see getConditionImage() below for those.
  const real = product?.images
    ?.filter((img) => img.url && !img.conditionCategory)
    ?.map((img) => img.url);
  if (real?.length) return real;
  // Accepts a full Product, a cart line (`slug`), or an OrderItem
  // (`productSlug`) — all three shapes flow through the same components.
  const slug = product?.slug ?? product?.productSlug;
  return PRODUCT_IMAGES[slug] ?? FALLBACK;
}

export function getProductImage(product) {
  return getProductImages(product)[0];
}

/** The condition close-up photo for one category (OUTSOLE, HEEL_WEAR, …),
 * or null when the admin hasn't uploaded one — never falls back to a
 * placeholder, since "no photo" is a valid, honest state here. */
export function getConditionImage(product, category) {
  return product?.images?.find((img) => img.conditionCategory === category)?.url ?? null;
}
