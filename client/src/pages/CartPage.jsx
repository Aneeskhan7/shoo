import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { useCartStore } from '../store';
import { validateCart, qk } from '../lib/api';
import QtyStepper from '../components/ui/QtyStepper';
import ProductImage from '../components/ui/ProductImage';
import { formatPrice } from '../components/ui/Price';

/**
 * Cart — Figma 39:146 (1440×984).
 *   left column: white item cards, 86px thumb, green rail on the first row
 *   right column: #EDEDED summary panel, Subtotal / Shipping / Taxes / Total
 *   Totals come from POST /cart/validate — never computed in the browser.
 */
export default function CartPage() {
  const { items, setQuantity, remove, promoCode, setPromoCode, lines } = useCartStore();
  const [code, setCode] = useState(promoCode ?? '');
  const [promoError, setPromoError] = useState(null);

  const payload = { items: lines(), shippingMethod: 'STANDARD', promoCode: promoCode || undefined };

  const { data: totals, isFetching } = useQuery({
    queryKey: qk.cart(payload.items, 'STANDARD', promoCode),
    queryFn: () => validateCart(payload),
    enabled: items.length > 0,
    retry: false,
  });

  const applyPromo = async (e) => {
    e.preventDefault();
    setPromoError(null);
    const next = code.trim().toUpperCase();
    if (!next) return;
    try {
      await validateCart({ ...payload, promoCode: next });
      setPromoCode(next);
    } catch (err) {
      setPromoError(err.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-off-white text-black">
        <h1 className="text-display-l">Your Cart</h1>
        <p className="text-[15px] text-grey-500">Nothing here yet.</p>
        <Link
          to="/shop"
          className="rounded-full bg-black px-7 py-4 text-[14px] font-semibold text-off-white"
        >
          Browse the Collection →
        </Link>
      </div>
    );
  }

  const count = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="min-h-screen bg-off-white pt-[84px] text-black">
      <div className="px-6 pt-12 lg:px-[64px]">
        <h1 className="text-display-l">Your Cart</h1>
        <p className="mt-1 text-[13px] text-grey-500">
          {count} item{count === 1 ? '' : 's'}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-8 px-6 pb-24 lg:flex-row lg:gap-[32px] lg:px-[64px]">
        {/* Items */}
        <div className="flex-1">
          <ul className="flex flex-col gap-[16px]">
            {items.map((item, i) => (
              <li
                key={item.variantId}
                className="relative flex items-center gap-5 overflow-hidden rounded-[8px] bg-white p-[16px]"
              >
                {i === 0 && <span className="absolute inset-y-4 left-0 w-[3px] bg-green" />}
                <Link
                  to={`/products/${item.slug}`}
                  className="h-[86px] w-[86px] shrink-0 overflow-hidden rounded-[8px] bg-[#EDEDED] text-[#CCCCC7]"
                >
                  <ProductImage product={item} />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link to={`/products/${item.slug}`} className="hover:opacity-70">
                    <p className="text-[15px] font-bold">{item.name}</p>
                  </Link>
                  <p className="mt-1 text-[12px] text-grey-500">
                    {item.colorName} / {item.size}
                  </p>
                  <div className="mt-3">
                    <QtyStepper
                      value={item.quantity}
                      onChange={(q) => setQuantity(item.variantId, q)}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 self-start">
                  <p className="text-[16px] font-bold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(item.variantId)}
                    className="text-[12px] text-grey-500 underline-offset-2 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <form
            onSubmit={applyPromo}
            className="mt-[16px] flex max-w-[420px] items-center gap-3 rounded-[8px] border border-black/10 bg-white p-[14px]"
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Promo code"
              aria-label="Promo code"
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-grey-500"
            />
            <button
              type="submit"
              className="rounded-full bg-black px-[18px] py-[8px] text-[12px] font-semibold text-off-white transition-opacity hover:opacity-85"
            >
              Apply
            </button>
          </form>
          {promoError && <p className="mt-2 text-[12px] text-red-600">{promoError}</p>}
          {promoCode && !promoError && (
            <p className="mt-2 text-[12px] text-grey-700">
              Code <strong>{promoCode}</strong> applied.{' '}
              <button
                type="button"
                onClick={() => {
                  setPromoCode(null);
                  setCode('');
                }}
                className="underline underline-offset-2"
              >
                Remove
              </button>
            </p>
          )}
        </div>

        {/* Summary */}
        <aside className="w-full shrink-0 rounded-[8px] bg-[#EDEDED] p-[40px] lg:w-[480px]">
          <h2 className="text-[24px] font-bold">Order Summary</h2>

          <dl className="mt-6 flex flex-col gap-[14px] text-[14px]">
            <div className="flex justify-between">
              <dt className="text-grey-700">Subtotal ({count} items)</dt>
              <dd className="font-medium">{formatPrice(totals?.subtotal)}</dd>
            </div>
            {totals?.discount > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Discount</dt>
                <dd className="font-medium">−{formatPrice(totals.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-grey-700">Shipping</dt>
              <dd className="font-medium">
                {totals?.shippingCost ? formatPrice(totals.shippingCost) : 'Free'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-grey-700">Taxes (est.)</dt>
              <dd className="font-medium">{formatPrice(totals?.tax)}</dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-black/15 pt-5">
            <div className="flex items-baseline justify-between">
              <span className="text-[18px] font-bold">Total</span>
              <span className="text-[22px] font-bold" aria-live="polite">
                {isFetching ? '…' : formatPrice(totals?.total, { currency: true })}
              </span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-6 flex h-[54px] items-center justify-center rounded-full bg-black text-[15px] font-bold text-off-white transition-opacity hover:opacity-85"
          >
            Checkout →
          </Link>
          <Link
            to="/shop"
            className="mt-3 flex h-[46px] items-center justify-center rounded-full bg-white text-[13px] font-medium"
          >
            Continue Shopping
          </Link>

          <ul className="mt-6 flex flex-col gap-[9px] text-[12px] text-grey-700">
            <li>🔒 Secure checkout</li>
            <li>↩ Free 30-day returns</li>
            <li>📦 Ships within 2 business days</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
