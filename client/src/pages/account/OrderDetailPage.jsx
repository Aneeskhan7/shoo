import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyOrder, qk } from '../../lib/api';
import ProductImage from '../../components/ui/ProductImage';
import { formatPrice } from '../../components/ui/Price';
import OrderStatusTracker from '../../components/account/OrderStatusTracker';

export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: qk.myOrder(orderNumber),
    queryFn: () => getMyOrder(orderNumber),
    retry: false,
  });

  if (isLoading) return <p className="text-[14px] text-grey-500">Loading order…</p>;

  if (isError) {
    return (
      <div className="rounded-[8px] bg-white p-12">
        <h2 className="text-[20px] font-bold">Order not found</h2>
        <p className="mt-3 text-[14px] text-grey-500">{error.message}</p>
        <Link to="/account/orders" className="mt-6 inline-block text-[13px] underline">
          ← Back to order history
        </Link>
      </div>
    );
  }

  const { order } = data;

  return (
    <div>
      <Link to="/account/orders" className="text-[13px] text-grey-500 underline-offset-2 hover:underline">
        ← Order history
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-h1">#{order.orderNumber}</h2>
          <p className="mt-2 text-[14px] text-grey-500">
            Placed{' '}
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            {order.shippingLabel ? ` · ${order.shippingLabel}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-black px-3 py-[6px] text-[10px] font-bold tracking-[0.08em] text-off-white">
            {order.status}
          </span>
          <span className="rounded-full border border-black/15 px-3 py-[6px] text-[10px] font-medium tracking-[0.08em] text-grey-700">
            {order.paymentMethod === 'COD' ? 'CASH ON DELIVERY' : order.paymentMethod} ·{' '}
            {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="mt-8 max-w-[640px] rounded-[8px] bg-white p-6">
        <OrderStatusTracker status={order.status} />
      </div>

      <div className="mt-10 flex flex-col gap-10 lg:flex-row">
        <ul className="flex flex-1 flex-col gap-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 rounded-[8px] bg-white p-4">
              <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[8px] bg-[#EDEDED] text-[#CCCCC7]">
                <ProductImage product={item} />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold">{item.productName}</p>
                <p className="mt-1 text-[12px] text-grey-500">
                  {item.colorName} / {item.size} · Qty {item.quantity}
                </p>
              </div>
              <p className="text-[14px] font-medium">{formatPrice(item.total)}</p>
            </li>
          ))}
        </ul>

        <aside className="w-full shrink-0 rounded-[8px] bg-[#EDEDED] p-8 lg:w-[380px]">
          <h3 className="text-[16px] font-bold">Summary</h3>
          <dl className="mt-5 flex flex-col gap-[10px] text-[14px]">
            <div className="flex justify-between">
              <dt className="text-grey-700">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between">
                <dt className="text-grey-700">Discount{order.promoCode ? ` (${order.promoCode})` : ''}</dt>
                <dd>−{formatPrice(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-grey-700">Shipping</dt>
              <dd>{Number(order.shippingCost) === 0 ? 'Free' : formatPrice(order.shippingCost)}</dd>
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
            <p className="font-semibold text-black">Delivered to</p>
            <p className="mt-1">
              {order.address.firstName} {order.address.lastName}
              <br />
              {order.address.street}
              <br />
              {order.address.city} {order.address.postalCode}
              <br />
              {order.address.country}
              <br />
              {order.address.phone}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
