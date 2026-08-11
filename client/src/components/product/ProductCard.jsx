import { Link } from 'react-router-dom';
import StarRating from '../ui/StarRating';
import ProductImage from '../ui/ProductImage';
import { formatPrice } from '../ui/Price';
import { useCartStore, useUIStore } from '../../store';

/**
 * Product card, measured from Figma 41:256 (search results grid):
 *   card 268w · white · 0.5px #d3d3d3 · r8
 *   media 268×360 · #f2f2f2 · r8
 *   name 14 semibold · color 12 #808080 · rating 11 #c93 · price 18 bold
 *   Quick View 176×36 r999 #f2f2f2 · Add to Cart 240×40 r6 #0a0a0a
 * The card is a light surface on every frame it appears in.
 */
export default function ProductCard({ product, badge }) {
  const add = useCartStore((s) => s.add);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const primaryColor = product.colors?.[0];
  const inStockVariants = product.variants?.filter((v) => v.stock > 0) ?? [];
  const firstInStock = inStockVariants[0];
  // More than one size in stock — quick-adding would silently pick one for
  // them, so send them to the PDP to choose instead of guessing.
  const needsSizeChoice = new Set(inStockVariants.map((v) => v.size)).size > 1;
  const soldOut = !product.inStock;
  // Falls back to the plain AVAILABLE/SOLD_OUT read for any older cached
  // response that predates the LIMITED state.
  const stockStatus = product.stockStatus ?? (soldOut ? 'SOLD_OUT' : 'AVAILABLE');
  const STATUS_COPY = { AVAILABLE: 'Available', LIMITED: 'Limited sizes', SOLD_OUT: 'Sold' };
  const STATUS_CLASS = {
    AVAILABLE: 'bg-green text-black',
    LIMITED: 'border border-black bg-white text-black',
    SOLD_OUT: 'bg-black text-off-white',
  };

  const quickAdd = (e) => {
    e.preventDefault();
    if (!firstInStock) return;
    add({
      variantId: firstInStock.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size: firstInStock.size,
      colorName: firstInStock.colorName,
      colorHex: firstInStock.colorHex,
      price: Number(firstInStock.price),
    });
    setCartOpen(true);
  };

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-[8px] border-[0.5px] border-[#d3d3d3] bg-white text-black">
      <Link to={`/products/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[268/360] w-full overflow-hidden rounded-[8px] bg-[#f2f2f2] text-[#ccccc7]">
          <ProductImage product={product} />
          {badge && (
            <span className="absolute left-3 top-3 rounded-[4px] bg-green px-[10px] py-[5px] text-[9px] font-bold tracking-[0.06em] text-black">
              {badge}
            </span>
          )}
          <span
            className={`absolute right-3 top-3 rounded-[4px] px-[10px] py-[5px] text-[9px] font-bold tracking-[0.06em] ${STATUS_CLASS[stockStatus]}`}
          >
            {STATUS_COPY[stockStatus]}
          </span>
        </div>

        <div className="flex flex-1 flex-col px-[14px] pb-[14px] pt-[14px]">
          <h3 className="text-[14px] font-semibold tracking-[-0.005em]">{product.name}</h3>
          {primaryColor && (
            <p className="mt-[8px] text-[12px] tracking-[0.01em] text-grey-500">
              {primaryColor.name}
            </p>
          )}
          <StarRating
            value={product.rating ?? 5}
            count={product.reviewCount ?? undefined}
            className="mt-[8px]"
          />
          <p className="mt-[14px] text-[18px] font-bold">
            {formatPrice(product.minPrice)}
            {product.maxPrice !== product.minPrice && '+'}
          </p>
          <p className="mt-[10px] text-[11px] tracking-[0.01em] text-grey-500">Free shipping</p>
        </div>
      </Link>

      <div className="mt-auto flex flex-col items-center gap-[10px] px-[14px] pb-[14px]">
        <Link
          to={`/products/${product.slug}`}
          className="flex h-[36px] w-[176px] items-center justify-center rounded-full bg-[#f2f2f2] text-[12px] font-medium tracking-[0.01em] text-grey-700 transition-colors hover:bg-[#e8e8e8]"
        >
          Quick View
        </Link>
        {needsSizeChoice ? (
          <Link
            to={`/products/${product.slug}`}
            className="flex h-[40px] w-full items-center justify-center rounded-[6px] bg-black text-[12px] font-medium tracking-[0.01em] text-off-white transition-opacity hover:opacity-85"
          >
            Select Size
          </Link>
        ) : (
          <button
            type="button"
            onClick={quickAdd}
            disabled={soldOut}
            className="flex h-[40px] w-full items-center justify-center rounded-[6px] bg-black text-[12px] font-medium tracking-[0.01em] text-off-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {soldOut ? 'Sold out' : 'Add to Cart'}
          </button>
        )}
      </div>
    </article>
  );
}
