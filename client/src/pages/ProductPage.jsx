import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getProduct,
  getProducts,
  getReviews,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  qk,
} from '../lib/api';
import { useAuthStore, useCartStore, useRecentlyViewedStore, useUIStore } from '../store';
import StarRating from '../components/ui/StarRating';
import ProductImage from '../components/ui/ProductImage';
import { getProductImages } from '../lib/productImages';
import ProductCard from '../components/product/ProductCard';
import ReviewCard from '../components/product/ReviewCard';
import ConditionReport from '../components/product/ConditionReport';
import { formatPrice } from '../components/ui/Price';

/**
 * Product Detail — Figma 39:2 (1440×1944).
 *   gallery 760×820 (#f5f4f0 panel) · buy panel 680×820, 72/60 padding
 *   title 64px Black -3% · price 32px Bold · swatches 36px · sizes r6
 *   CTA 999px pill, 28/18 padding · reviews 560 · related 480
 */
export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const qc = useQueryClient();
  const add = useCartStore((s) => s.add);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: qk.product(slug),
    queryFn: () => getProduct(slug),
  });
  const { data: reviewData } = useQuery({
    queryKey: qk.reviews(slug),
    queryFn: () => getReviews(slug),
    enabled: Boolean(data),
  });

  const product = data?.product;
  const [colorName, setColorName] = useState(null);
  const [size, setSize] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  // Gallery is built to hold hero/side/front/rear/detail shots once real
  // photography lands. Today every product has exactly one temporary image,
  // so the thumbnail rail below simply doesn't render rather than faking
  // five angles from one source photo.
  const images = product ? getProductImages(product) : [];

  // Wishlist is member-only; guests simply never fetch it.
  const { data: wishlist } = useQuery({
    queryKey: qk.wishlist(),
    queryFn: getWishlist,
    enabled: Boolean(user),
    retry: false,
  });
  const wishlisted = Boolean(
    product && wishlist?.items?.some((i) => i.product.id === product.id),
  );

  const wishlistMutation = useMutation({
    mutationFn: () =>
      wishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.wishlist() }),
  });

  const toggleWishlist = () => {
    if (!user) {
      navigate(`/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }
    wishlistMutation.mutate();
  };

  // Recently Viewed — client-only, persisted slug list; reuses the existing
  // product list endpoint to render, no new backend surface.
  const recentSlugs = useRecentlyViewedStore((s) => s.slugs);
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.add);
  useEffect(() => {
    if (product) addRecentlyViewed(product.slug);
  }, [product?.slug, addRecentlyViewed]);

  const otherRecentSlugs = useMemo(
    () => recentSlugs.filter((s) => s !== product?.slug).slice(0, 4),
    [recentSlugs, product?.slug],
  );
  const { data: catalogData } = useQuery({
    queryKey: qk.products({ limit: 48 }),
    queryFn: () => getProducts({ limit: 48 }),
    enabled: otherRecentSlugs.length > 0,
    staleTime: 60_000,
  });
  const recentlyViewed = otherRecentSlugs
    .map((s) => catalogData?.products?.find((p) => p.slug === s))
    .filter(Boolean);

  const activeColor = colorName ?? product?.colors?.[0]?.name ?? null;

  const sizesForColor = useMemo(() => {
    if (!product) return [];
    return product.variants.filter((v) => v.colorName === activeColor);
  }, [product, activeColor]);

  const variant = sizesForColor.find((v) => v.size === size) ?? null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white pt-[120px] text-black lg:pt-[128px]">
        <div className="mx-auto flex max-w-[1440px] animate-pulse flex-col lg:flex-row">
          <div className="h-[420px] w-full bg-black/5 lg:h-[820px] lg:w-[760px]" />
          <div className="flex-1 space-y-6 px-6 py-10 lg:px-[72px] lg:py-[60px]">
            <div className="h-4 w-40 bg-black/10" />
            <div className="h-16 w-3/4 bg-black/10" />
            <div className="h-4 w-1/2 bg-black/10" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-off-white text-black">
        <p className="text-eyebrow text-grey-500">Product</p>
        <h1 className="text-h1">{error?.message || 'Product not found'}</h1>
        <Link to="/shop" className="rounded-full bg-black px-6 py-3 text-[13px] text-off-white">
          Browse the Collection →
        </Link>
      </div>
    );
  }

  const addToCart = () => {
    if (!variant || variant.stock < 1) return;
    add({
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size: variant.size,
      colorName: variant.colorName,
      colorHex: variant.colorHex,
      price: Number(variant.price),
    });
    setCartOpen(true);
  };

  const price = variant ? Number(variant.price) : product.minPrice;

  return (
    <div className="bg-off-white text-black">
      {/* ── Gallery + buy panel ─────────────────────────────── */}
      <section className="flex flex-col pt-[120px] lg:flex-row lg:pt-[128px]">
        <div className="flex w-full flex-col lg:w-[760px]">
          <div className="relative flex aspect-[760/820] w-full items-center justify-center bg-[#EDEDED] text-[#CCCCC7] lg:aspect-auto lg:h-[820px]">
            <ProductImage product={product} index={activeImage} eager fit="contain" />
          </div>

          {images.length > 1 && (
            <div className="flex gap-[10px] p-4">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={activeImage === i}
                  className={`h-[64px] w-[64px] overflow-hidden rounded-[8px] border-2 transition-colors ${
                    activeImage === i ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <ProductImage product={product} index={i} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex w-full flex-col px-6 py-10 lg:h-[820px] lg:w-[680px] lg:px-[72px] lg:py-[60px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-[8px] text-[12px]">
            <Link to="/" className="tracking-[0.02em] text-black/45 hover:text-black">
              Home
            </Link>
            <span className="text-black/25">/</span>
            <Link to="/shop" className="tracking-[0.02em] text-black/45 hover:text-black">
              Products
            </Link>
            <span className="text-black/25">/</span>
            <span className="tracking-[0.02em]">{product.name}</span>
          </nav>

          <h1
            className="mt-[20px] font-black tracking-[-0.03em]"
            style={{ fontSize: 'clamp(38px, 4.44vw, 64px)', lineHeight: 0.9 }}
          >
            {product.name}
          </h1>

          {product.tagline && (
            <p className="mt-[12px] max-w-[520px] text-[16px] leading-[1.5] text-grey-700">
              {product.tagline}
            </p>
          )}

          <div className="mt-[20px] flex items-center gap-[10px]">
            <StarRating value={product.rating ?? 5} size={14} color="#ffbf33" />
            <span className="text-[13px] tracking-[0.02em] text-grey-500">
              {product.rating ?? '—'} ({product.reviewCount ?? 0} reviews)
            </span>
          </div>

          <div className="mt-[20px] flex items-center gap-[16px]">
            <p className="text-[32px] font-bold tracking-[-0.01em]">
              {formatPrice(price, { currency: true })}
            </p>
            <span className="rounded-full bg-green px-[12px] py-[6px] text-[10px] font-bold tracking-[0.04em] text-black">
              3D Preview Available
            </span>
          </div>

          {/* Colour */}
          <p className="mt-[28px] text-[11px] font-medium tracking-[0.1em]">
            COLOR — {activeColor}
          </p>
          <div className="mt-[12px] flex gap-[10px]">
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
                  className={`h-[36px] w-[36px] rounded-full transition-all ${
                    selected ? 'border-[2.5px] border-black' : 'border border-[#d3d3d3]'
                  }`}
                  style={{ background: c.hex }}
                />
              );
            })}
          </div>

          {/* Size */}
          <div className="mt-[24px] flex items-baseline justify-between">
            <p className="text-[11px] font-medium tracking-[0.1em]">
              SIZE {size ? `— ${size} Selected` : '— Select a size'}
            </p>
            <Link to="/size-guide" className="text-[12px] text-grey-500 underline-offset-2 hover:underline">
              Size guide
            </Link>
          </div>
          <div className="mt-[12px] flex flex-wrap gap-[8px]">
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
                  className={`rounded-[6px] px-[14px] py-[10px] text-[12px] font-medium tracking-[0.02em] transition-colors ${
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

          <div className="mt-[28px] flex items-center gap-[12px]">
            <button
              type="button"
              onClick={addToCart}
              disabled={!variant || variant.stock < 1}
              className="rounded-full bg-black px-[28px] py-[18px] text-[14px] font-bold tracking-[0.02em] text-off-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {!size
                ? 'Select a size'
                : variant?.stock < 1
                  ? 'Sold out'
                  : `Add to Cart — ${formatPrice(price)}`}
            </button>
            {/* Members save to their wishlist. Guests are only sent to sign-in
                by their own explicit click — never automatically. */}
            <button
              type="button"
              onClick={toggleWishlist}
              aria-pressed={wishlisted}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              title={user ? undefined : 'Sign in to save to your wishlist'}
              className={`flex h-[52px] w-[52px] items-center justify-center rounded-full border-[1.5px] text-[22px] transition-colors ${
                wishlisted ? 'border-green bg-green text-black' : 'border-[#d3d3d3] hover:border-black'
              }`}
            >
              {wishlisted ? '♥' : '♡'}
            </button>
          </div>

          <p className="mt-[16px] text-[12px] tracking-[0.02em] text-grey-500">
            ✦ Free shipping over PKR 30,000 · Free returns
          </p>

          {product.story && (
            <p className="mt-[24px] max-w-[520px] text-[14px] leading-[1.55] text-grey-700">
              {product.story}
            </p>
          )}
        </div>
      </section>

      <ConditionReport product={product} />

      {/* ── Reviews ─────────────────────────────────────────── */}
      <section className="border-t border-black/10 py-[72px]">
        <div className="container-content">
          <div className="flex flex-wrap items-end gap-6">
            <h2 className="text-h1">Customer Reviews</h2>
            <div className="flex items-baseline gap-3">
              <span className="text-[40px] font-black leading-none">
                {reviewData?.summary.average ?? product.rating ?? '—'}
              </span>
              <span className="text-[14px] text-grey-500">
                out of 5 · {reviewData?.summary.count ?? product.reviewCount ?? 0} reviews
              </span>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(reviewData?.reviews ?? []).map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
            {reviewData && reviewData.reviews.length === 0 && (
              <p className="text-[14px] text-grey-500">No reviews yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── You might also like ─────────────────────────────── */}
      {data.related?.length > 0 && (
        <section className="border-t border-black/10 py-[72px]">
          <div className="container-content">
            <h2 className="text-h1">You might also like</h2>
            <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
              {data.related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recently Viewed ─────────────────────────────────── */}
      {recentlyViewed.length > 0 && (
        <section className="border-t border-black/10 py-[72px]">
          <div className="container-content">
            <h2 className="text-h1">Recently Viewed</h2>
            <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
              {recentlyViewed.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
