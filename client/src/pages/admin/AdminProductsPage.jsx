import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAdminProducts, deleteAdminProduct, qk } from '../../lib/api';
import { formatPrice } from '../../components/ui/Price';

function StockBadge({ product }) {
  if (product.soldOut) {
    return <span className="rounded-full bg-red-100 px-2 py-[3px] text-[10px] font-bold text-red-700">SOLD OUT</span>;
  }
  if (product.totalStock <= 5) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-[3px] text-[10px] font-bold text-amber-700">
        LOW · {product.totalStock}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-green/30 px-2 py-[3px] text-[10px] font-bold text-black">
      {product.totalStock} IN STOCK
    </span>
  );
}

export default function AdminProductsPage() {
  const [q, setQ] = useState('');
  const [stockStatus, setStockStatus] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState(null);
  const qc = useQueryClient();

  const params = { q: q || undefined, stockStatus, status, sort, limit: 100 };
  const { data, isLoading, error } = useQuery({
    queryKey: qk.adminProducts(params),
    queryFn: () => getAdminProducts(params),
  });

  const confirmDelete = async (product) => {
    setNotice(null);
    try {
      await deleteAdminProduct(product.id);
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      setNotice({ type: 'success', text: `Deleted "${product.name}".` });
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-black tracking-[-0.02em]">Products</h1>
        <Link
          to="/admin/products/new"
          className="rounded-full bg-black px-5 py-[10px] text-[13px] font-bold text-off-white hover:opacity-85"
        >
          + Add product
        </Link>
      </div>

      {notice && (
        <p
          role="status"
          className={`mt-4 rounded-[8px] p-3 text-[13px] ${
            notice.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green/20 text-black'
          }`}
        >
          {notice.text}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="h-[38px] w-[240px] rounded-full border border-black/15 bg-white px-4 text-[13px] outline-none focus:border-black"
        />
        <select
          value={stockStatus}
          onChange={(e) => setStockStatus(e.target.value)}
          className="h-[38px] rounded-full border border-black/15 bg-white px-3 text-[13px] outline-none"
        >
          <option value="all">All stock</option>
          <option value="in-stock">In stock</option>
          <option value="low">Low stock</option>
          <option value="sold-out">Sold out</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-[38px] rounded-full border border-black/15 bg-white px-3 text-[13px] outline-none"
        >
          <option value="all">Active + inactive</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-[38px] rounded-full border border-black/15 bg-white px-3 text-[13px] outline-none"
        >
          <option value="newest">Newest</option>
          <option value="name">Name A–Z</option>
          <option value="stock-asc">Stock: low to high</option>
          <option value="stock-desc">Stock: high to low</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-[8px] border border-black/10 bg-white">
        {isLoading ? (
          <p className="p-8 text-center text-[13px] text-grey-500">Loading…</p>
        ) : error ? (
          <p className="p-8 text-center text-[13px] text-red-600">{error.message}</p>
        ) : data.products.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-grey-500">No products match those filters.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/10 text-[11px] tracking-[0.05em] text-grey-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.products.map((p) => (
                <tr key={p.id} className="border-b border-black/5 last:border-b-0 hover:bg-black/[0.02]">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-grey-500">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    {p.minPrice == null
                      ? '—'
                      : p.minPrice === p.maxPrice
                        ? formatPrice(p.minPrice)
                        : `${formatPrice(p.minPrice)}–${formatPrice(p.maxPrice)}`}
                  </td>
                  <td className="px-4 py-3">
                    <StockBadge product={p} />
                  </td>
                  <td className="px-4 py-3">
                    {p.isActive ? (
                      <span className="text-grey-700">Active</span>
                    ) : (
                      <span className="text-grey-500">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{p.isFeatured ? '★' : ''}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="rounded-full border border-black/15 px-3 py-[6px] text-[12px] font-medium hover:border-black"
                      >
                        Edit
                      </Link>
                      {deleting === p.id ? (
                        <span className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => confirmDelete(p)}
                            className="rounded-full bg-red-600 px-3 py-[6px] text-[12px] font-bold text-white"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(null)}
                            className="rounded-full border border-black/15 px-3 py-[6px] text-[12px]"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleting(p.id)}
                          className="rounded-full border border-red-200 px-3 py-[6px] text-[12px] font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
