import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminOrders, qk } from '../../lib/api';
import { formatPrice } from '../../components/ui/Price';

const STATUSES = ['all', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const STATUS_STYLE = {
  PENDING: 'bg-[#f2f2f2] text-grey-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-amber-100 text-amber-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green/30 text-black',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-grey-500/20 text-grey-700',
};

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');

  const params = { q: q || undefined, status, limit: 50 };
  const { data, isLoading, error } = useQuery({
    queryKey: qk.adminOrders(params),
    queryFn: () => getAdminOrders(params),
  });

  return (
    <div>
      <h1 className="text-[28px] font-black tracking-[-0.02em]">Orders</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order # or email…"
          className="h-[38px] w-[260px] rounded-full border border-black/15 bg-white px-4 text-[13px] outline-none focus:border-black"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-[38px] rounded-full border border-black/15 bg-white px-3 text-[13px] outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All statuses' : s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-[8px] border border-black/10 bg-white">
        {isLoading ? (
          <p className="p-8 text-center text-[13px] text-grey-500">Loading…</p>
        ) : error ? (
          <p className="p-8 text-center text-[13px] text-red-600">{error.message}</p>
        ) : data.orders.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-grey-500">No orders match those filters.</p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/10 text-[11px] tracking-[0.05em] text-grey-500">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/admin/orders/${o.id}`)}
                  className="cursor-pointer border-b border-black/5 last:border-b-0 hover:bg-black/[0.02]"
                >
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders/${o.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p>{o.customerName}</p>
                    <p className="text-grey-500">{o.email}</p>
                  </td>
                  <td className="px-4 py-3">{o.itemCount}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">{o.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-[3px] text-[10px] font-bold ${STATUS_STYLE[o.status] || ''}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-grey-500">
                    {new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
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
