import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore, useUIStore } from '../../store';
import { formatPrice } from '../ui/Price';
import QtyStepper from '../ui/QtyStepper';
import ProductImage from '../ui/ProductImage';

export default function CartDrawer() {
  const { cartOpen, setCartOpen } = useUIStore();
  const { items, setQuantity, remove } = useCartStore();
  const panelRef = useRef(null);

  // Client-side subtotal is a preview only; the server re-prices at checkout.
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  useEffect(() => {
    if (!cartOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // body.style.overflow alone doesn't stop Lenis (it drives scroll via its
    // own wheel/touch listeners) — same fix as the mobile nav menu.
    window.__lenis?.stop();
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      window.__lenis?.start();
    };
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Close cart"
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 bg-black/60"
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-off-white text-black outline-none"
      >
        <header className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <h2 className="text-[20px] font-bold">Your Cart</h2>
          <button type="button" onClick={() => setCartOpen(false)} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M1 1l18 18M19 1L1 19" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-[15px] text-grey-700">Your cart is empty.</p>
            <Link
              to="/shop"
              onClick={() => setCartOpen(false)}
              className="rounded-full bg-black px-6 py-3 text-[13px] font-medium text-off-white"
            >
              Browse the Collection →
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-4">
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex gap-4 border-b border-black/10 py-4 last:border-0"
                >
                  <div className="h-[80px] w-[80px] shrink-0 overflow-hidden rounded-[8px] bg-[#f2f2f2] text-[#ccccc7]">
                    <ProductImage product={item} />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="text-[14px] font-semibold">{item.name}</p>
                    <p className="mt-1 text-[12px] text-grey-500">
                      {item.colorName} / {item.size}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <QtyStepper
                        value={item.quantity}
                        onChange={(q) => setQuantity(item.variantId, q)}
                        max={1}
                      />
                      <span className="text-[14px] font-bold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.variantId)}
                      className="mt-2 self-start text-[12px] text-grey-500 underline-offset-2 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-black/10 px-6 py-5">
              <div className="flex justify-between text-[15px]">
                <span>Subtotal</span>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-[12px] text-grey-500">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="flex h-[52px] items-center justify-center rounded-full bg-green text-[15px] font-semibold text-black"
                >
                  Checkout →
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setCartOpen(false)}
                  className="flex h-[44px] items-center justify-center rounded-full border border-black/20 text-[14px]"
                >
                  View Cart
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
