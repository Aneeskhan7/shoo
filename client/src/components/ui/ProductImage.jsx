import { useState } from 'react';
import { getProductImageEntries } from '../../lib/productImages';
import ShoePlaceholder from './ShoePlaceholder';

/**
 * Renders a product photo via the central temporary-image map
 * (lib/productImages.js) — see that file for how to swap in real SHOO
 * photography later. Falls back to the grey Figma placeholder shape only if
 * an image is genuinely missing or fails to load, so a broken URL never
 * shows as a blank box.
 *
 * `product` accepts either a full product object or a minimal
 * `{ slug, images? }` shape, so cart/order line items (which only ever
 * carried a slug) can use it too.
 *
 * Alt text resolution: explicit `alt` prop wins outright; otherwise
 * `colorName` (cart/order lines already carry this) is folded into the
 * resolved entry's alt so two colorways of the same shoe don't read
 * identically to a screen reader.
 */
export default function ProductImage({
  product,
  index = 0,
  eager = false,
  fit = 'cover',
  className = '',
  placeholderLabel,
  alt,
  colorName,
  width,
}) {
  const [failed, setFailed] = useState(false);
  const entries = getProductImageEntries(colorName ? { ...product, colorName } : product, { width });
  const entry = entries[index] ?? entries[0];

  if (!entry || failed) {
    return <ShoePlaceholder className={className} label={placeholderLabel} />;
  }

  return (
    <img
      src={entry.url}
      alt={alt || entry.alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchpriority={eager ? 'high' : undefined}
      decoding="async"
      onError={() => setFailed(true)}
      className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
    />
  );
}
