import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProduct, qk } from '../../lib/api';
import { getProductImages } from '../../lib/productImages';
import ProductImage from '../ui/ProductImage';
import { formatPrice } from '../ui/Price';
import { useCartStore, useUIStore } from '../../store';

/**
 * A real popup, not a page navigation — opens over the current grid instead
 * of unmounting it. Deliberately a *focused subset* of the PDP (image,
 * price, color/size, add to cart), not a re-render of it: reviews,
 * condition report, and related/recently-viewed stay PDP-only, reached via
 * "View full details →".
 *
 * Uses the exact same qk.product(slug) query ProductPage.jsx does — if
 * ProductCard's hover/focus handler already seeded this cache entry from
 * the list row, this opens instantly; otherwise it fetches like any other
 * query and shows its own small loading state (not a full-page skeleton).
 *
 * No URL/history sync on purpose — this isn't a route, so crawlability of
 * the real /products/:slug page (the point of the SEO work) is untouched.
 * Overlay mechanics (focus, Escape, backdrop click, scroll lock) mirror
 * CartDrawer.jsx exactly rather than inventing a new pattern.
 */
export default function QuickViewModal() {
  const quickViewSlug = useUIStore((s) => s.quickViewSlug);
  const setQuickViewSlug = useUIStore((s) => s.setQuickViewSlug);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const add = useCartStore((s) => s.add);
  const panelRef = useRef(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: qk.product(quickViewSlug),
    queryFn: () => getProduct(quickViewSlug),
    enabled: Boolean(quickViewSlug),
  });
  const product = data?.product;

  const [colorName, setColorName] = useState(null);
  const [size, setSize] = useState(null);

  // Reset selection whenever a different product opens — otherwise a size
  // picked on the last product you quick-viewed could silently carry over.
  useEffect(() => {
    setColorName(null);
    setSize(null);
  }, [quickViewSlug]);

  const close = () => setQuickViewSlug(null);

  useEffect(() => {
    if (!quickViewSlug) return undefined;
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      window.__lenis?.start();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickViewSlug]);

  const activeColor = colorName ?? product?.colors?.[0]?.name ?? null;
  const sizesForColor = useMemo(
    () => (product ? product.variants.filter((v) => v.colorName === activeColor) : []),
    [product, activeColor],
  );
  const variant = sizesForColor.find((v) => v.size === size) ?? null;

  const price = variant ? Number(variant.price) : product?.minPrice;
  const compareAtPrice = variant
    ? variant.compareAtPrice
      ? Number(variant.compareAtPrice)
      : null
    : product?.compareAtPrice;
  const discountPercent =
    compareAtPrice && price && compareAtPrice > price
      ? Math.round((1 - price / compareAtPrice) * 100)
      : 0;

  const addToCart = () => {
    if (!variant || variant.stock < 1) return;
    add({
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: getProductImages(product)[0],
      size: variant.size,
      colorName: variant.colorName,
      colorHex: variant.colorHex,
      price: Number(variant.price),
    });
    close();
    setCartOpen(true);
  };

  if (!quickViewSlug) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button type="button" aria-label="Close quick view" onClick={close} className="absolute inset-0 bg-black/60" />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={product ? `Quick view — ${product.name}` : 'Quick view'}
        className="absolute left-1/2 top-1/2 flex max-h-[90vh] w-[calc(100%-32px)] max-w-[880px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-[12px] bg-off-white text-black outline-none sm:flex-row"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white/90 text-black"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M1 1l18 18M19 1L1 19" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>

        {isLoading && !product && (
          <div className="flex w-full animate-pulse flex-col sm:flex-row">
            <div className="aspect-square w-full bg-black/5 sm:w-[380px]" />
            <div className="flex-1 space-y-4 p-8">
              <div className="h-4 w-1/3 bg-black/10" />
              <div className="h-8 w-3/4 bg-black/10" />
              <div className="h-6 w-1/4 bg-black/10" />
            </div>
          </div>
        )}

        {isError && !product && (
          <div className="flex w-full flex-col items-center justify-center gap-4 p-16 text-center">
            <p className="text-[15px] text-grey-700">Couldn't load this product.</p>
            <button type="button" onClick={close} className="text-[13px] underline underline-offset-2">
              Close
            </button>
          </div>
        )}

        {product && (
          <>
            <div className="relative aspect-square w-full shrink-0 bg-[#EDEDED] sm:w-[380px]">
              <ProductImage product={product} colorName={activeColor} eager fit="contain" />
            </div>

            <div className="flex w-full flex-col p-6 sm:p-8">
              <h2 className="text-[24px] font-black tracking-[-0.02em] sm:text-[28px]">{product.name}</h2>
              {product.tagline && (
                <p className="mt-2 text-[14px] leading-[1.5] text-grey-700">{product.tagline}</p>
              )}

              <div className="mt-4 flex items-center gap-[10px]">
                {discountPercent > 0 && (
                  <p className="text-[14px] text-grey-500 line-through">{formatPrice(compareAtPrice)}</p>
                )}
                <p className="text-[22px] font-bold tracking-[-0.01em]">{formatPrice(price)}</p>
                {discountPercent > 0 && (
                  <span className="rounded-[4px] bg-red-500 px-[7px] py-[3px] text-[10px] font-bold text-white">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              {product.colors?.length > 0 && (
                <>
                  <p className="mt-6 text-[11px] font-medium tracking-[0.1em]">COLOR — {activeColor}</p>
                  <div className="mt-3 flex gap-[10px]">
                    {product.colors.map((c) => {
                      const selected = c.name === activeColor;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          aria-label={c.name}
                          aria-pressed={selected}
                          onClick={() => {
                            setColorName(c.name);
                            setSize(null);
                          }}
                          className={`h-[32px] w-[32px] rounded-full transition-all ${
                            selected ? 'border-[2.5px] border-black' : 'border border-[#d3d3d3]'
                          }`}
                          style={{ background: c.hex }}
                        />
                      );
                    })}
                  </div>
                </>
              )}

              <p className="mt-6 text-[11px] font-medium tracking-[0.1em]">
                SIZE {size ? `— ${size} Selected` : '— Select a size'}
              </p>
              <div className="mt-3 flex flex-wrap gap-[8px]">
                {sizesForColor.map((v) => {
                  const selected = v.size === size;
                  const oos = v.stock < 1;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={oos}
                      aria-pressed={selected}
                      onClick={() => setSize(v.size)}
                      className={`rounded-[6px] px-[12px] py-[8px] text-[12px] font-medium tracking-[0.02em] transition-colors ${
                        selected
                          ? 'bg-black text-off-white'
                          : 'border border-[#d3d3d3] bg-white text-grey-700 hover:border-black'
                      } ${oos ? 'cursor-not-allowed line-through opacity-35' : ''}`}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={addToCart}
                disabled={!variant || variant.stock < 1}
                className="mt-6 rounded-full bg-black px-[24px] py-[15px] text-[13px] font-bold tracking-[0.02em] text-off-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {!size ? 'Select a size' : variant?.stock < 1 ? 'Sold out' : `Add to Cart — ${formatPrice(price)}`}
              </button>

              <Link
                to={`/products/${product.slug}`}
                onClick={close}
                className="mt-4 text-[13px] font-medium text-grey-700 underline-offset-2 hover:underline"
              >
                View full details →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
