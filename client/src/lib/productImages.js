/**
 * ============================================================================
 * PRODUCT IMAGE RESOLUTION
 * ============================================================================
 * No component hardcodes an image path — every card/gallery/thumbnail calls
 * `getProductImages(product)` below, which reads the real ProductImage rows
 * from the database (`product.images[]`, uploaded via the admin panel's
 * Cloudinary pipeline). There is no placeholder catalogue: a product with no
 * uploaded images renders with an empty gallery.
 * ============================================================================
 */

/** No product has an image yet until one is uploaded via admin. */
const FALLBACK = [];

const CLOUDINARY_UPLOAD_MARKER = '/image/upload/';

/**
 * Admin-uploaded photos come straight off a phone/camera — 2-3MB+ at
 * ~1800×2400 — and were being served at that exact size everywhere: a
 * 268×360 shop card, a Lookbook tile, all of it. That's what made pages
 * with several product photos (Drop 01, the shop grid) slow to load.
 * Cloudinary can resize/re-encode on the fly from a URL alone — this drops
 * a transformation segment right after `/image/upload/` so every photo is
 * served at a sane display width, auto-quality, auto-format (WebP/AVIF
 * where the browser supports it) instead of the untouched original.
 * `c_limit` never upscales a smaller source past its real size.
 */
function optimizeCloudinaryUrl(url, width = 1000) {
  const i = url.indexOf(CLOUDINARY_UPLOAD_MARKER);
  if (i === -1) return url; // not a Cloudinary URL — leave it alone
  const insertAt = i + CLOUDINARY_UPLOAD_MARKER.length;
  return `${url.slice(0, insertAt)}w_${width},q_auto,f_auto,c_limit/${url.slice(insertAt)}`;
}

/**
 * Resolves the image list for a product. Two shapes come through here:
 *   - a full Product (`images[]` rows) — shop cards, PDP gallery, Lookbook.
 *   - a cart/order line snapshot (`{ image: 'https://...' }`, one URL
 *     captured at add-to-cart time) — cart drawer, cart page, checkout.
 * Cart lines never carry the full `images[]` array, so without the `image`
 * fallback here they'd resolve to nothing and show the placeholder icon.
 */
export function getProductImages(product) {
  // Thrift-condition close-ups (outsole, heel, etc.) are tagged and live in
  // the same product.images[] rows, but they're not part of the main
  // gallery — see getConditionImage() below for those.
  const real = product?.images
    ?.filter((img) => img.url && !img.conditionCategory)
    ?.map((img) => optimizeCloudinaryUrl(img.url));
  if (real?.length) return real;
  return product?.image ? [optimizeCloudinaryUrl(product.image)] : FALLBACK;
}

export function getProductImage(product) {
  return getProductImages(product)[0];
}

/** The condition close-up photo for one category (OUTSOLE, HEEL_WEAR, …),
 * or null when the admin hasn't uploaded one — never falls back to a
 * placeholder, since "no photo" is a valid, honest state here. */
export function getConditionImage(product, category) {
  const url = product?.images?.find((img) => img.conditionCategory === category)?.url;
  return url ? optimizeCloudinaryUrl(url, 700) : null;
}
