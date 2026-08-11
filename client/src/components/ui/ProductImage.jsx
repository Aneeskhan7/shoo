import { useState } from 'react';
import { getProductImages } from '../../lib/productImages';
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
 */
export default function ProductImage({
  product,
  index = 0,
  eager = false,
  fit = 'cover',
  className = '',
  placeholderLabel,
}) {
  const [failed, setFailed] = useState(false);
  const images = getProductImages(product);
  const src = images[index] ?? images[0];

  if (!src || failed) {
    return <ShoePlaceholder className={className} label={placeholderLabel} />;
  }

  return (
    <img
      src={src}
      alt={product?.name || product?.productName || 'Product photo'}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
    />
  );
}
