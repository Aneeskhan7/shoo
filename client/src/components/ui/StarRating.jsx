/**
 * Stars are amber, not brand green. The file uses two shades: #c93 on product
 * cards (41:265) and #ffbf33 on the PDP (39:38) — passed in per context.
 */
export default function StarRating({
  value = 5,
  size = 11,
  count,
  color = '#c93',
  className = '',
}) {
  const rounded = Math.round(value);
  return (
    <span
      className={`inline-flex items-center gap-[1px] ${className}`}
      role="img"
      aria-label={`${value} out of 5 stars${count != null ? `, ${count} reviews` : ''}`}
      style={{ fontSize: size, lineHeight: 1, color }}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} aria-hidden="true" className={i <= rounded ? '' : 'opacity-30'}>
          ★
        </span>
      ))}
      {count != null && (
        <span aria-hidden="true" className="ml-[6px]">
          ({count})
        </span>
      )}
    </span>
  );
}
