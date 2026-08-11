import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyOrders, qk } from '../../lib/api';
import { formatPrice } from '../../components/ui/Price';

const STATUS_TONE = {
  PENDING: 'bg-green text-black',
  CONFIRMED: 'bg-green text-black',
  PROCESSING: 'bg-black text-off-white',
  SHIPPED: 'bg-black text-off-white',
  DELIVERED: 'bg-black text-off-white',
  CANCELLED: 'bg-[#d3d3d3] text-grey-700',
  REFUNDED: 'bg-[#d3d3d3] text-grey-700',
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({ queryKey: qk.myOrders(), queryFn: getMyOrders });
  const orders = data?.orders ?? [];

  if (isLoading) return <p className="text-[14px] text-grey-500">Loading orders…</p>;

  if (orders.length === 0) {
    return (
      <div className="rounded-[8px] bg-white p-16 text-center">
        <h2 className="text-[20px] font-bold">No orders yet</h2>
        <p className="mt-3 text-[14px] text-grey-500">
          Orders you place — as a guest with this email, or signed in — show up here.
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
    <div className="flex flex-col gap-4">
      <h2 className="text-h1">Order History</h2>
      {orders.map((o) => (
        <Link
          key={o.id}
          to={`/account/orders/${o.orderNumber}`}
          className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-[8px] bg-white p-6 transition-opacity hover:opacity-85"
        >
          <div className="min-w-[180px]">
            <p className="text-[15px] font-bold">#{o.orderNumber}</p>
            <p className="mt-1 text-[12px] text-grey-500">
              {new Date(o.createdAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-[5px] text-[10px] font-bold tracking-[0.08em] ${
              STATUS_TONE[o.status] ?? 'bg-[#d3d3d3] text-grey-700'
            }`}
          >
            {o.status}
          </span>

          <span className="rounded-full border border-black/15 px-3 py-[5px] text-[10px] font-medium tracking-[0.08em] text-grey-700">
            {o.paymentMethod === 'COD' ? 'CASH ON DELIVERY' : o.paymentMethod}
          </span>

          <p className="text-[13px] text-grey-500">
            {o.items.length} item{o.items.length === 1 ? '' : 's'}
          </p>

          <p className="ml-auto text-[18px] font-bold">
            {formatPrice(o.total, { currency: true })}
          </p>
        </Link>
      ))}
    </div>
  );
}
