import ProductCard from './ProductCard';

function Skeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[8px] border-[0.5px] border-[#d3d3d3] bg-white">
      <div className="aspect-[268/360] w-full bg-[#f2f2f2]" />
      <div className="space-y-3 p-[14px]">
        <div className="h-3 w-2/3 bg-black/10" />
        <div className="h-3 w-1/3 bg-black/10" />
        <div className="h-4 w-1/4 bg-black/10" />
      </div>
    </div>
  );
}

export default function ProductGrid({
  products,
  isLoading,
  error,
  emptyMessage,
  onClearFilters,
  badgeFor,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[8px] border border-black/10 bg-white p-10 text-center">
        <p className="text-[15px] font-semibold">Couldn’t load products</p>
        <p className="mt-2 text-[13px] text-grey-500">{error.message}</p>
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="rounded-[8px] border border-black/10 bg-white p-16 text-center">
        <p className="text-[18px] font-semibold">{emptyMessage || 'No products found'}</p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-6 inline-flex rounded-full bg-black px-7 py-3 text-[13px] font-semibold text-off-white transition-opacity hover:opacity-85"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} badge={badgeFor?.(p)} />
      ))}
    </div>
  );
}
