import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getOrder, qk } from '../lib/api';
import { useAuthStore } from '../store';
import ProductImage from '../components/ui/ProductImage';
import { formatPrice } from '../components/ui/Price';

/**
 * Order Confirmation — lifted from the confirmation block inside the Checkout
 * frame (40:182): "Thank you, {name}." + "Order #SH-… · Estimated delivery".
 * Guest orders are read back with the email used at checkout.
 */
export default function OrderConfirmedPage() {
  const { orderNumber } = useParams();
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: qk.order(orderNumber),
    queryFn: () => getOrder(orderNumber, email),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-off-white text-black">
        <span className="text-eyebrow text-grey-500">Loading order…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-off-white text-black">
        <h1 className="text-h1">Couldn’t load that order</h1>
        <p className="text-[14px] text-grey-500">{error.message}</p>
        <Link to="/" className="rounded-full bg-black px-7 py-4 text-[14px] text-off-white">
          Back home
        </Link>
      </div>
    );
  }

  const { order } = data;
  const eta = new Date(order.createdAt);
  eta.setDate(eta.getDate() + 3);
  const etaEnd = new Date(eta);
  etaEnd.setDate(etaEnd.getDate() + 2);
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-off-white pt-[84px] text-black">
      <div className="container-content py-20">
        <span className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-green text-[24px] text-black">
          ✓
        </span>

        <h1 className="text-display-l mt-8">Thank you, {order.address.firstName}.</h1>
        <p className="mt-4 text-[16px] text-grey-700">
          Order <strong>#{order.orderNumber}</strong> · Estimated delivery {fmt(eta)}–{fmt(etaEnd)}
        </p>

        <div className="mt-6 inline-flex flex-col gap-1 rounded-[8px] border border-green bg-green/10 px-6 py-4">
          <p className="text-[11px] font-medium tracking-[0.1em]">CASH ON DELIVERY</p>
          <p className="text-[20px] font-bold">
            {formatPrice(order.total, { currency: true })} due on arrival
          </p>
          <p className="text-[12px] text-grey-700">
            We’ll call {order.guestPhone || order.address.phone} before dispatch.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-10 lg:flex-row">
          <div className="flex-1">
            <h2 className="text-[11px] font-medium tracking-[0.1em]">YOUR ORDER</h2>
            <ul className="mt-5 flex flex-col gap-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 rounded-[8px] bg-white p-4">
                  <div className="h-[64px] w-[64px] shrink-0 overflow-hidden rounded-[8px] bg-[#EDEDED] text-[#CCCCC7]">
                    <ProductImage product={item} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold">{item.productName}</p>
                    <p className="text-[12px] text-grey-500">
                      {item.colorName} / {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-[14px] font-medium">{formatPrice(item.total)}</p>
                </li>
              ))}
            </ul>
          </div>

          <aside className="w-full shrink-0 rounded-[8px] bg-[#EDEDED] p-8 lg:w-[420px]">
            <h2 className="text-[18px] font-bold">Summary</h2>
            <dl className="mt-5 flex flex-col gap-[10px] text-[14px]">
              <div className="flex justify-between">
                <dt className="text-grey-700">Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-grey-700">Discount</dt>
                  <dd>−{formatPrice(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-grey-700">Shipping</dt>
                <dd>
                  {Number(order.shippingCost) === 0 ? 'Free' : formatPrice(order.shippingCost)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-grey-700">Taxes</dt>
                <dd>{formatPrice(order.tax)}</dd>
              </div>
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-black/15 pt-5">
              <span className="text-[16px] font-bold">Total</span>
              <span className="text-[20px] font-bold">
                {formatPrice(order.total, { currency: true })}
              </span>
            </div>

            <div className="mt-6 text-[13px] leading-[1.6] text-grey-700">
              <p className="font-semibold text-black">Delivering to</p>
              <p className="mt-1">
                {order.address.firstName} {order.address.lastName}
                <br />
                {order.address.street}
                <br />
                {order.address.city} {order.address.postalCode}
                <br />
                {order.address.country}
              </p>
              {order.shippingLabel && <p className="mt-3">{order.shippingLabel}</p>}
            </div>
          </aside>
        </div>

        {/* Optional membership offer — guests only, after the order is already
            placed. Nothing here is required and nothing blocks the page. */}
        {!user && !order.userId && (
          <aside className="mt-14 flex flex-wrap items-center justify-between gap-6 rounded-[12px] bg-black p-8 text-off-white lg:p-10">
            <div>
              <p className="text-eyebrow text-green">Optional</p>
              <h2 className="mt-3 text-[24px] font-bold tracking-[-0.01em]">
                Want to save your order and join SHOO?
              </h2>
              <p className="mt-3 max-w-[520px] text-[14px] leading-[1.6] text-off-white/60">
                Join with <strong className="text-off-white">{order.guestEmail || email}</strong> and
                this order moves into your history automatically. Free, and never required to buy.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/join?email=${encodeURIComponent(order.guestEmail || email)}&next=${encodeURIComponent('/account/orders')}`}
                className="rounded-full bg-green px-8 py-[16px] text-[14px] font-bold tracking-[0.02em] text-black"
              >
                JOIN SHOO
              </Link>
              <Link
                to="/shop"
                className="rounded-full border border-off-white/30 px-8 py-[16px] text-[14px] font-medium"
              >
                No thanks
              </Link>
            </div>
          </aside>
        )}

        <div className="mt-12 flex flex-wrap gap-4">
          {/* Only ever shown when this order is actually the signed-in
              user's own — getMyOrder re-verifies ownership server-side
              regardless, this just avoids offering a dead-end link. */}
          {user && order.userId === user.id && (
            <Link
              to={`/account/orders/${order.orderNumber}`}
              className="inline-flex rounded-full bg-green px-8 py-[18px] text-[14px] font-bold text-black"
            >
              View My Order →
            </Link>
          )}
          <Link
            to="/shop"
            className="inline-flex rounded-full bg-black px-8 py-[18px] text-[14px] font-bold text-off-white"
          >
            Continue Shopping →
          </Link>
        </div>
      </div>
    </div>
  );
}
