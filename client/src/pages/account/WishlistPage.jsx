import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getWishlist, removeFromWishlist, qk } from '../../lib/api';
import ProductImage from '../../components/ui/ProductImage';
import { formatPrice } from '../../components/ui/Price';

export default function WishlistPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: qk.wishlist(), queryFn: getWishlist });

  const remove = useMutation({
    mutationFn: removeFromWishlist,
    // Direct cache write, not just invalidate — see ProductPage.jsx's
    // wishlist mutation for why (invalidateQueries' refetch wasn't firing).
    onSuccess: (_data, productId) => {
      qc.setQueryData(qk.wishlist(), (old) =>
        old ? { ...old, items: old.items.filter((i) => i.product.id !== productId) } : old,
      );
      qc.invalidateQueries({ queryKey: qk.wishlist() });
    },
  });

  const items = data?.items ?? [];

  if (isLoading) return <p className="text-[14px] text-grey-500">Loading wishlist…</p>;

  if (items.length === 0) {
    return (
      <div className="rounded-[8px] bg-white p-16 text-center">
        <h2 className="text-[20px] font-bold">Your wishlist is empty</h2>
        <p className="mt-3 text-[14px] text-grey-500">
          Tap the ♡ on any product to keep it here.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-black px-7 py-4 text-[14px] font-semibold text-off-white"
        >
          Browse the Collection →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-h1">Wishlist</h2>
      <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {items.map(({ id, product }) => (
          <article
            key={id}
            className="flex flex-col overflow-hidden rounded-[8px] border-[0.5px] border-[#d3d3d3] bg-white"
          >
            <Link to={`/products/${product.slug}`}>
              <div className="aspect-[268/360] w-full bg-[#f2f2f2] text-[#ccccc7]">
                <ProductImage product={product} />
              </div>
            </Link>
            <div className="flex flex-1 flex-col p-[14px]">
              <Link to={`/products/${product.slug}`}>
                <h3 className="text-[14px] font-semibold">{product.name}</h3>
              </Link>
              {product.colors?.[0] && (
                <p className="mt-2 text-[12px] text-grey-500">{product.colors[0].name}</p>
              )}
              <p className="mt-3 text-[18px] font-bold">{formatPrice(product.minPrice)}</p>
              {!product.inStock && (
                <p className="mt-1 text-[11px] font-medium text-grey-500">Sold out</p>
              )}
              <button
                type="button"
                onClick={() => remove.mutate(product.id)}
                className="mt-auto pt-4 text-left text-[12px] text-grey-500 underline-offset-2 hover:underline"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
