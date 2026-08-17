import { absoluteUrl } from './seo';

// productController.js's shape() field -> schema.org Offer.availability
const AVAILABILITY = {
  AVAILABLE: 'https://schema.org/InStock',
  LIMITED: 'https://schema.org/LimitedAvailability',
  SOLD_OUT: 'https://schema.org/OutOfStock',
};

/**
 * Product + BreadcrumbList JSON-LD for a PDP. Every interpolated value
 * (name, tagline, brand, review text) originates from admin input via
 * Postgres — treated as untrusted throughout; useJsonLd writes via
 * textContent (never dangerouslySetInnerHTML), so it's never HTML-parsed.
 */
export function buildProductSchema({ product, images, activeColor, price, url }) {
  const offerBase = {
    priceCurrency: 'PKR',
    availability: AVAILABILITY[product.stockStatus] || AVAILABILITY.AVAILABLE,
    url: absoluteUrl(url),
  };

  const offers =
    product.minPrice !== product.maxPrice
      ? {
          '@type': 'AggregateOffer',
          ...offerBase,
          lowPrice: product.minPrice,
          highPrice: product.maxPrice,
        }
      : { '@type': 'Offer', ...offerBase, price: price ?? product.minPrice };

  const productNode = {
    '@type': 'Product',
    name: product.name,
    description: product.tagline || product.description || product.story || undefined,
    image: images?.map((i) => absoluteUrl(i)) ?? [],
    sku: product.variants?.[0]?.sku,
    brand: product.brand?.name ? { '@type': 'Brand', name: product.brand.name } : undefined,
    color: activeColor || undefined,
    category: product.category?.name || undefined,
    offers,
    // Thrift/resale catalogue — a pair with recorded condition items is
    // genuinely used, and it's a Google Merchant policy issue to leave this
    // unset or blanket-emit NewCondition on stock that isn't new.
    ...(product.conditionItems?.length > 0
      ? { itemCondition: 'https://schema.org/UsedCondition' }
      : {}),
    // Never inherit the UI's `rating ?? 5` display fallback — a fabricated
    // 5.0 with zero real reviews is exactly the kind of structured-data
    // misstatement Google's Merchant policies flag.
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    // Mirrors the page's own visible breadcrumb exactly (Home / Products / name).
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Products', item: absoluteUrl('/shop') },
      { '@type': 'ListItem', position: 3, name: product.name },
    ],
  };

  return { '@context': 'https://schema.org', '@graph': [productNode, breadcrumb] };
}
