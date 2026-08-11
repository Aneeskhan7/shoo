import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAdminDashboard, qk } from '../../lib/api';
import { formatPrice } from '../../components/ui/Price';

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-[8px] border border-black/10 bg-white p-5">
      <p className="text-[11px] tracking-[0.08em] text-grey-500">{label}</p>
      <p className="mt-2 text-[28px] font-black tracking-[-0.02em]">{value}</p>
      {sub && <p className="mt-1 text-[12px] text-grey-500">{sub}</p>}
    </div>
  );
}

const STATUS_STYLE = {
  PENDING: 'bg-[#f2f2f2] text-grey-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-amber-100 text-amber-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green/30 text-black',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-grey-500/20 text-grey-700',
};

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: qk.adminDashboard(),
    queryFn: getAdminDashboard,
  });

  if (isLoading) return <p className="text-eyebrow text-grey-500">Loading…</p>;
  if (error) return <p className="text-[14px] text-red-600">{error.message}</p>;

  const { products, orders, totalInventoryUnits, recentOrders, lowStockProducts } = data;

  return (
    <div>
      <h1 className="text-[28px] font-black tracking-[-0.02em]">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="TOTAL PRODUCTS" value={products.total} />
        <StatCard label="ACTIVE PRODUCTS" value={products.active} />
        <StatCard label="SOLD OUT" value={products.soldOut} />
        <StatCard label="INVENTORY UNITS" value={totalInventoryUnits} />
        <StatCard label="TOTAL ORDERS" value={orders.total} />
        <StatCard label="PENDING" value={orders.pending} />
        <StatCard label="PROCESSING" value={orders.processing} />
        <StatCard label="SHIPPED" value={orders.shipped} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold">Recent orders</h2>
            <Link to="/admin/orders" className="text-[12px] text-grey-500 hover:underline">
              View all →
            </Link>
          </div>
          <div className="mt-3 overflow-hidden rounded-[8px] border border-black/10 bg-white">
            {recentOrders.length === 0 ? (
              <p className="p-6 text-center text-[13px] text-grey-500">No orders yet.</p>
            ) : (
              recentOrders.map((o) => (
                <Link
                  key={o.id}
                  to={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between border-b border-black/5 px-4 py-3 text-[13px] last:border-b-0 hover:bg-black/[0.02]"
                >
                  <div>
                    <p className="font-semibold">{o.orderNumber}</p>
                    <p className="text-grey-500">{o.customerEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(o.total)}</p>
                    <span
                      className={`inline-block rounded-full px-2 py-[2px] text-[10px] font-bold ${STATUS_STYLE[o.status] || ''}`}
                    >
                      {o.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="text-[16px] font-bold">Low stock</h2>
          <div className="mt-3 overflow-hidden rounded-[8px] border border-black/10 bg-white">
            {lowStockProducts.length === 0 ? (
              <p className="p-6 text-center text-[13px] text-grey-500">Nothing running low.</p>
            ) : (
              lowStockProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/admin/products/${p.id}/edit`}
                  className="flex items-center justify-between border-b border-black/5 px-4 py-3 text-[13px] last:border-b-0 hover:bg-black/[0.02]"
                >
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-amber-700">{p.totalStock} left</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
