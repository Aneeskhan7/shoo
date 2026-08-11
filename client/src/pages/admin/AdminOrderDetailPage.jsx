import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAdminOrder, updateAdminOrderStatus, qk } from '../../lib/api';
import { formatPrice } from '../../components/ui/Price';

const TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data, isLoading, error: loadError } = useQuery({
    queryKey: qk.adminOrder(id),
    queryFn: () => getAdminOrder(id),
  });

  if (isLoading) return <p className="text-eyebrow text-grey-500">Loading…</p>;
  if (loadError) return <p className="text-[14px] text-red-600">{loadError.message}</p>;

  const { order } = data;
  const nextOptions = TRANSITIONS[order.status] || [];

  const changeStatus = async (status) => {
    if (status === 'CANCELLED' && !confirmCancel) {
      setConfirmCancel(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await updateAdminOrderStatus(id, status);
      qc.invalidateQueries({ queryKey: qk.adminOrder(id) });
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: qk.adminDashboard() });
      setConfirmCancel(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-[820px]">
      <Link to="/admin/orders" className="text-[13px] text-grey-500 hover:underline">
        ← Orders
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-black tracking-[-0.02em]">{order.orderNumber}</h1>
        <span className="rounded-full bg-black px-4 py-[8px] text-[12px] font-bold text-off-white">
          {order.status}
        </span>
      </div>
      <p className="mt-1 text-[13px] text-grey-500">
        Placed {new Date(order.createdAt).toLocaleString('en-GB')}
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-[8px] bg-red-100 p-3 text-[13px] text-red-700">
          {error}
        </p>
      )}

      <section className="mt-6 rounded-[8px] border border-black/10 bg-white p-6">
        <h2 className="text-[14px] font-bold">Update status</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {nextOptions.length === 0 ? (
            <p className="text-[13px] text-grey-500">No further transitions — this is a final status.</p>
          ) : (
            nextOptions.map((s) => (
              <button
                key={s}
                type="button"
                disabled={busy}
                onClick={() => changeStatus(s)}
                className={`rounded-full px-4 py-[9px] text-[12px] font-bold disabled:opacity-40 ${
                  s === 'CANCELLED'
                    ? 'bg-red-600 text-white hover:opacity-85'
                    : 'bg-black text-off-white hover:opacity-85'
                }`}
              >
                {s === 'CANCELLED' && confirmCancel ? 'Confirm cancel — restores stock' : `Move to ${s}`}
              </button>
            ))
          )}
          {confirmCancel && (
            <button
              type="button"
              onClick={() => setConfirmCancel(false)}
              className="rounded-full border border-black/15 px-4 py-[9px] text-[12px]"
            >
              Never mind
            </button>
          )}
        </div>
      </section>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section className="rounded-[8px] border border-black/10 bg-white p-6">
          <h2 className="text-[14px] font-bold">Customer</h2>
          <p className="mt-2 text-[13px]">
            {order.address.firstName} {order.address.lastName}
          </p>
          <p className="text-[13px] text-grey-500">{order.user?.email || order.guestEmail}</p>
          <p className="text-[13px] text-grey-500">{order.address.phone}</p>
        </section>

        <section className="rounded-[8px] border border-black/10 bg-white p-6">
          <h2 className="text-[14px] font-bold">Delivery</h2>
          <p className="mt-2 text-[13px]">{order.address.street}</p>
          <p className="text-[13px] text-grey-500">
            {order.address.city}, {order.address.postalCode}
          </p>
          <p className="text-[13px] text-grey-500">{order.address.country}</p>
        </section>
      </div>

      <section className="mt-6 rounded-[8px] border border-black/10 bg-white p-6">
        <h2 className="text-[14px] font-bold">Items</h2>
        <div className="mt-3 flex flex-col gap-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-black/5 pb-3 text-[13px] last:border-b-0 last:pb-0">
              <div>
                <p className="font-semibold">{item.productName}</p>
                <p className="text-grey-500">
                  {item.colorName} · {item.size} · Qty {item.quantity}
                </p>
              </div>
              <p className="font-semibold">{formatPrice(item.total)}</p>
            </div>
          ))}
        </div>

        <dl className="mt-4 flex flex-col gap-2 border-t border-black/10 pt-4 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-grey-500">Subtotal</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between">
              <dt className="text-grey-500">Discount{order.promoCode ? ` (${order.promoCode})` : ''}</dt>
              <dd>−{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-grey-500">Shipping</dt>
            <dd>{Number(order.shippingCost) === 0 ? 'Free' : formatPrice(order.shippingCost)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-grey-500">Tax</dt>
            <dd>{formatPrice(order.tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-2 text-[15px] font-bold">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-[12px] text-grey-500">
          {order.paymentMethod} · {order.paymentStatus}
        </p>
      </section>
    </div>
  );
}
