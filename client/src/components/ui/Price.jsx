/**
 * SHOO prices in PKR — no decimals (PKR isn't typically shown with paisa in
 * retail), comma-grouped. `formatPrice(19500)` → "PKR 19,500".
 *
 * The `currency` option used to switch between a bare "$69" and an
 * emphasized "USD $69" for totals. There's only one currency now, so every
 * call renders the same "PKR …" — the option is kept (rather than touched
 * at every one of its call sites) purely so existing `{ currency: true }`
 * callers don't need editing.
 */
export const formatPrice = (value) => {
  if (value == null) return '—';
  const n = Math.round(Number(value));
  return `PKR ${n.toLocaleString('en-US')}`;
};

export default function Price({ value, from, to, className = '' }) {
  if (from != null && to != null && from !== to) {
    return (
      <span className={className}>
        {formatPrice(from)} – {formatPrice(to)}
      </span>
    );
  }
  return <span className={className}>{formatPrice(value ?? from)}</span>;
}
