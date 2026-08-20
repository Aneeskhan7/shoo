/**
 * Effective price for a variant right now — its flash `offerPrice` while the
 * parent product's `offerEndsAt` hasn't passed yet, else its standing
 * `price`. Time-gated at read time (storefront display, cart pricing,
 * checkout) so an expired offer needs no cron/cleanup job to "end" it.
 */
export function effectiveVariantPrice(offerEndsAt, variant) {
  const hasActiveOffer = offerEndsAt && new Date(offerEndsAt).getTime() > Date.now();
  return hasActiveOffer && variant.offerPrice != null
    ? Number(variant.offerPrice)
    : Number(variant.price);
}
