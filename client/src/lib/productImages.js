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

/** Resolves the image list for a product from its real ProductImage rows. */
export function getProductImages(product) {
  // Thrift-condition close-ups (outsole, heel, etc.) are tagged and live in
  // the same product.images[] rows, but they're not part of the main
  // gallery — see getConditionImage() below for those.
  const real = product?.images
    ?.filter((img) => img.url && !img.conditionCategory)
    ?.map((img) => img.url);
  return real?.length ? real : FALLBACK;
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
