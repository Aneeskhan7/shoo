import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore, useCartStore } from '../store';
import { validateCart, placeOrder, getAddresses, qk } from '../lib/api';
import Input from '../components/ui/Input';
import TabGroup from '../components/ui/TabGroup';
import ProductImage from '../components/ui/ProductImage';
import { formatPrice } from '../components/ui/Price';

/**
 * Checkout — Figma 40:2. Three steps + a sticky summary rail.
 *
 * Payment (40:151) draws three tabs: Card, Bank, Cash on Delivery. Only COD is
 * functional; Card and Bank render disabled with a "Coming Soon" marker, and
 * NO card field is wired to state or submitted anywhere. See plan Stage B.
 */
// Mirrors server/src/lib/pricing.js SHIPPING_METHODS — this list is display
// only (the server recomputes the real cost), but it must show the same
// numbers or the radio list and the summary total disagree before submit.
const SHIPPING = [
  { id: 'STANDARD', label: 'Standard Shipping', eta: '5–7 business days', cost: 250 },
  { id: 'EXPRESS', label: 'Express Shipping', eta: '2–3 business days', cost: 350, recommended: true },
  { id: 'NEXT_DAY', label: 'Next Day Delivery', eta: '1 business day', cost: 700 },
];

const PAYMENT_TABS = [
  { id: 'COD', label: '📱 Cash on Delivery' },
  { id: 'CARD', label: '💳 Card', disabled: true },
  { id: 'BANK', label: '🏦 Bank', disabled: true },
];

const STEPS = ['Information', 'Shipping', 'Payment'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, lines, promoCode, shippingMethod, setShippingMethod, clear } = useCartStore();
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(0);
  const [prefilled, setPrefilled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Pakistan',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Members get their default address filled in. Purely a convenience — the
  // form stays fully editable and guests see exactly the same checkout.
  const { data: addressData } = useQuery({
    queryKey: qk.addresses(),
    queryFn: getAddresses,
    enabled: Boolean(user),
    retry: false,
  });
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const applyAddress = (a) => {
    setSelectedAddressId(a.id);
    setForm((f) => ({
      ...f,
      firstName: a.firstName,
      lastName: a.lastName,
      phone: a.phone,
      street: a.street,
      city: a.city,
      postalCode: a.postalCode,
      country: a.country,
    }));
  };

  useEffect(() => {
    if (prefilled || !user) return;
    const saved = addressData?.addresses?.find((a) => a.isDefault) ?? addressData?.addresses?.[0];
    if (saved) setSelectedAddressId(saved.id);
    setForm((f) => ({
      ...f,
      email: f.email || user.email,
      firstName: f.firstName || saved?.firstName || user.firstName,
      lastName: f.lastName || saved?.lastName || user.lastName,
      phone: f.phone || saved?.phone || '',
      street: f.street || saved?.street || '',
      city: f.city || saved?.city || '',
      postalCode: f.postalCode || saved?.postalCode || '',
      country: saved?.country || f.country,
    }));
    if (addressData) setPrefilled(true);
  }, [user, addressData, prefilled]);

  const payload = { items: lines(), shippingMethod, promoCode: promoCode || undefined };
  const { data: totals } = useQuery({
    queryKey: qk.cart(payload.items, shippingMethod, promoCode),
    queryFn: () => validateCart(payload),
    enabled: items.length > 0,
    retry: false,
  });

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-off-white text-black">
        <h1 className="text-h1">Your cart is empty</h1>
        <Link to="/shop" className="rounded-full bg-black px-7 py-4 text-[14px] text-off-white">
          Browse the Collection →
        </Link>
      </div>
    );
  }

  // Pakistan uses a strict 5-digit postal code; anywhere else just needs
  // something plausible, since the address form isn't country-specific.
  const postalCodeError = !form.postalCode
    ? null
    : form.country.trim().toLowerCase() === 'pakistan'
      ? /^\d{5}$/.test(form.postalCode.trim())
        ? null
        : 'Pakistani postal codes are 5 digits, e.g. 44000'
      : form.postalCode.trim().length >= 3
        ? null
        : 'Enter a valid postal code';

  const infoValid =
    form.email.includes('@') &&
    form.firstName &&
    form.lastName &&
    form.phone.length >= 6 &&
    form.street &&
    form.city &&
    form.postalCode &&
    !postalCodeError &&
    form.country;

  const submit = async () => {
    setSubmitting(true);
    setFormError(null);
    try {
      const { order } = await placeOrder({
        items: lines(),
        email: form.email,
        shippingMethod,
        paymentMethod: 'COD',
        promoCode: promoCode || undefined,
        address: {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          street: form.street,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        },
      });
      clear();
      navigate(`/order/${order.orderNumber}?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-off-white pt-[120px] text-black lg:pt-[128px]">
      {/* Progress bar (40:16) */}
      <div className="flex h-[60px] items-center gap-2 border-b border-black/10 px-4 sm:gap-6 lg:px-20">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold sm:h-[22px] sm:w-[22px] sm:text-[11px] ${
                i <= step ? 'bg-black text-off-white' : 'bg-black/10 text-grey-500'
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`whitespace-nowrap text-[11px] font-medium tracking-[0.02em] sm:text-[12px] ${
                i <= step ? '' : 'text-grey-500'
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="ml-1.5 h-px w-4 shrink-0 bg-black/15 sm:ml-4 sm:w-8" />}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Form column */}
        <div className="flex-1 px-6 py-12 lg:px-20">
          {step === 0 && (
            <section>
              {/* Only surfaces once there's an actual choice to make — with
                  0 or 1 saved addresses the auto-prefill above already
                  covers it, and guest checkout never sees this at all. */}
              {user && addressData?.addresses?.length > 1 && (
                <div className="mb-8 max-w-[700px]">
                  <h2 className="text-[11px] font-medium tracking-[0.1em]">DELIVERY ADDRESS</h2>
                  <div className="mt-4 flex flex-col gap-2">
                    {addressData.addresses.map((a) => (
                      <label
                        key={a.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-[8px] border bg-white p-4 ${
                          selectedAddressId === a.id ? 'border-black' : 'border-black/15'
                        }`}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={selectedAddressId === a.id}
                          onChange={() => applyAddress(a)}
                          className="mt-[3px] h-[16px] w-[16px] accent-black"
                        />
                        <span className="text-[13px] leading-[1.5]">
                          <span className="font-semibold">{a.label}</span>
                          {a.isDefault && (
                            <span className="ml-2 rounded-full bg-green px-2 py-[2px] text-[9px] font-bold text-black">
                              DEFAULT
                            </span>
                          )}
                          <br />
                          {a.firstName} {a.lastName} · {a.street}, {a.city}, {a.country}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <h2 className="text-[11px] font-medium tracking-[0.1em]">CONTACT INFORMATION</h2>
              <div className="mt-6 flex max-w-[700px] flex-col gap-4">
                <Input label="Email" name="email" type="email" value={form.email} onChange={set('email')} />
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Input label="First name" name="firstName" value={form.firstName} onChange={set('firstName')} />
                  <Input label="Last name" name="lastName" value={form.lastName} onChange={set('lastName')} />
                </div>
                <Input
                  label="Phone (required for cash on delivery)"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                />
                <Input label="Address" name="street" value={form.street} onChange={set('street')} />
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Input label="City" name="city" value={form.city} onChange={set('city')} />
                  <Input
                    label="Postal code"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={set('postalCode')}
                    error={postalCodeError}
                  />
                  <Input label="Country" name="country" value={form.country} onChange={set('country')} />
                </div>
              </div>
              <button
                type="button"
                disabled={!infoValid}
                onClick={() => setStep(1)}
                className="mt-8 rounded-full bg-black px-5 py-3 text-[12px] font-bold text-off-white disabled:opacity-30 sm:px-8 sm:py-[18px] sm:text-[14px]"
              >
                Continue to Shipping →
              </button>
            </section>
          )}

          {step === 1 && (
            <section>
              <h2 className="text-h1">Shipping Method</h2>
              <div className="mt-6 flex max-w-[700px] flex-col gap-3">
                {SHIPPING.map((s) => (
                  <label
                    key={s.id}
                    className={`flex h-[72px] cursor-pointer items-center gap-4 rounded-[8px] border bg-white px-5 ${
                      shippingMethod === s.id ? 'border-black' : 'border-black/15'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === s.id}
                      onChange={() => setShippingMethod(s.id)}
                      className="h-[20px] w-[20px] accent-black"
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-2 text-[15px] font-medium">
                        {s.label}
                        {s.recommended && (
                          <span className="rounded-full bg-green px-2 py-[2px] text-[9px] font-bold text-black">
                            Recommended
                          </span>
                        )}
                      </span>
                      <span className="block text-[13px] text-grey-500">{s.eta}</span>
                    </span>
                    <span className="text-[15px] font-medium">
                      {s.cost === 0 ? 'Free' : formatPrice(s.cost)}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="rounded-full border border-black/20 px-5 py-3 text-[12px] font-bold text-black transition-colors hover:border-black sm:px-8 sm:py-[18px] sm:text-[14px]"
                >
                  ← Information
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full bg-black px-5 py-3 text-[12px] font-bold text-off-white sm:px-8 sm:py-[18px] sm:text-[14px]"
                >
                  Continue to Payment →
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h2 className="text-h1">Payment</h2>
              <p className="mt-3 text-[14px] text-grey-500">
                Pay in cash when your order arrives. No card details are collected or stored.
              </p>

              <div className="mt-6">
                <TabGroup
                  options={PAYMENT_TABS}
                  value="COD"
                  onChange={() => {}}
                  ariaLabel="Payment method"
                />
              </div>

              <div className="mt-6 max-w-[700px] rounded-[8px] border border-black/15 bg-white p-6">
                <p className="text-[15px] font-semibold">Cash on Delivery</p>
                <p className="mt-2 text-[14px] leading-[1.55] text-grey-700">
                  You’ll pay <strong>{formatPrice(totals?.total, { currency: true })}</strong> to the
                  courier when your order is delivered to {form.city || 'your address'}. We’ll call{' '}
                  {form.phone || 'your number'} before dispatch to confirm.
                </p>
              </div>

              {formError && (
                <p className="mt-4 max-w-[700px] rounded-[8px] bg-red-50 p-4 text-[13px] text-red-700">
                  {formError}
                </p>
              )}

              <div className="mt-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                  className="rounded-full border border-black/20 px-5 py-3 text-[12px] font-bold text-black transition-colors hover:border-black disabled:opacity-40 sm:px-8 sm:py-[18px] sm:text-[14px]"
                >
                  ← Shipping
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="rounded-full bg-green px-5 py-3 text-[12px] font-bold text-black disabled:opacity-50 sm:px-8 sm:py-[18px] sm:text-[14px]"
                >
                  {submitting ? 'Placing order…' : 'Place Order · Cash on Delivery'}
                </button>
              </div>

              <ul className="mt-8 flex flex-wrap gap-8 text-[12px] text-grey-500">
                <li>🔒 SSL Encrypted</li>
                <li>↩ Free Returns</li>
                <li>📦 Tracked Delivery</li>
              </ul>
            </section>
          )}
        </div>

        {/* Summary rail */}
        <aside className="w-full shrink-0 border-l border-black/10 bg-white px-6 py-12 lg:w-[580px] lg:px-12">
          <ul className="flex flex-col gap-5">
            {items.map((item) => (
              <li key={item.variantId} className="flex items-center gap-4">
                <div className="h-[64px] w-[64px] shrink-0 overflow-hidden rounded-[8px] bg-[#EDEDED] text-[#CCCCC7]">
                  <ProductImage product={item} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold">{item.name}</p>
                  <p className="text-[11px] text-grey-500">
                    {item.colorName} / {item.size} · Qty {item.quantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-8 flex flex-col gap-[10px] border-t border-black/10 pt-6 text-[14px]">
            <div className="flex justify-between">
              <dt className="text-grey-700">Subtotal</dt>
              <dd>{formatPrice(totals?.subtotal)}</dd>
            </div>
            {totals?.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-grey-700">Discount</dt>
                <dd>−{formatPrice(totals.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-grey-700">Shipping</dt>
              <dd>
                {step === 0
                  ? 'Calculated next'
                  : totals?.shippingCost
                    ? formatPrice(totals.shippingCost)
                    : 'Free'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-grey-700">Taxes</dt>
              <dd>{formatPrice(totals?.tax)}</dd>
            </div>
          </dl>

          <div className="mt-6 flex items-baseline justify-between border-t border-black/10 pt-6">
            <span className="text-[18px] font-bold">Total</span>
            <span className="text-[22px] font-bold">
              {formatPrice(totals?.total, { currency: true })}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
