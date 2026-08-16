import { ApiError } from '../middleware/errorHandler.js';

/**
 * Shipping costs are placeholder PKR figures (typical domestic courier
 * pricing — TCS/Leopard-ish), NOT a currency conversion of the old $12/$24.
 * Product prices are dummy-for-now too; both need real business sign-off
 * before launch.
 *
 * No tax is charged — 0 pending a decision on whether/how GST applies.
 */
export const SHIPPING_METHODS = {
  STANDARD: { id: 'STANDARD', label: 'Standard Shipping', eta: '5–7 business days', cost: 250 },
  EXPRESS: { id: 'EXPRESS', label: 'Express Shipping', eta: '2–3 business days', cost: 350 },
  NEXT_DAY: { id: 'NEXT_DAY', label: 'Next Day Delivery', eta: '1 business day', cost: 700 },
};

export const TAX_RATE = 0;

const formatPKR = (n) => `PKR ${Math.round(Number(n)).toLocaleString('en-US')}`;

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Recomputes every money value from database rows. The client's cart only ever
 * supplies variantId + quantity — prices are never trusted from the browser.
 */
export function priceCart({ lines, variants, shippingMethod = 'STANDARD', promo = null }) {
  const byId = new Map(variants.map((v) => [v.id, v]));

  const items = lines.map(({ variantId, quantity }) => {
    const variant = byId.get(variantId);
    if (!variant) throw new ApiError(400, `Unknown variant: ${variantId}`);
    if (quantity < 1) throw new ApiError(400, 'Quantity must be at least 1');
    if (variant.stock < quantity) {
      throw new ApiError(
        400,
        `${variant.product.name} (${variant.colorName} / ${variant.size}) has only ${variant.stock} left`,
      );
    }
    const unitPrice = Number(variant.price);
    return {
      variantId: variant.id,
      productId: variant.productId,
      productName: variant.product.name,
      slug: variant.product.slug,
      size: variant.size,
      colorName: variant.colorName,
      quantity,
      unitPrice,
      total: round2(unitPrice * quantity),
    };
  });

  const subtotal = round2(items.reduce((sum, i) => sum + i.total, 0));

  const method = SHIPPING_METHODS[shippingMethod];
  if (!method) throw new ApiError(400, `Unknown shipping method: ${shippingMethod}`);

  const discount = promo ? applyPromo(promo, subtotal) : 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = round2(taxable * TAX_RATE);
  const shippingCost = method.cost;
  const total = round2(taxable + tax + shippingCost);

  return {
    items,
    subtotal,
    discount,
    shippingCost,
    shippingLabel: `${method.label} — ${method.eta}`,
    tax,
    total,
    promoCode: promo?.code ?? null,
  };
}

export function applyPromo(promo, subtotal) {
  if (!promo.isActive) throw new ApiError(400, 'This promo code is no longer active');
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    throw new ApiError(400, 'This promo code has expired');
  }
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
    throw new ApiError(400, 'This promo code has reached its usage limit');
  }
  if (promo.minOrder != null && subtotal < Number(promo.minOrder)) {
    throw new ApiError(400, `This code needs a minimum order of ${formatPKR(promo.minOrder)}`);
  }
  const raw =
    promo.type === 'PERCENT' ? (subtotal * Number(promo.value)) / 100 : Number(promo.value);
  return round2(Math.min(raw, subtotal));
}

/** Figma shows "SH-20260124" — date-based with a short random suffix for uniqueness. */
export function generateOrderNumber(date = new Date()) {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SH-${ymd}-${suffix}`;
}
