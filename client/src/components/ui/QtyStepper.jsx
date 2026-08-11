/** − / value / + row from the cart frame (39:163). */
export default function QtyStepper({ value, onChange, min = 1, max = 20, label = 'Quantity' }) {
  return (
    <div
      className="inline-flex h-[44px] items-center rounded-full border border-current/20"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="flex h-full w-[44px] items-center justify-center rounded-l-full text-[18px] transition-opacity hover:opacity-60 disabled:opacity-25"
      >
        −
      </button>
      <span className="min-w-[32px] text-center text-[16px] tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="flex h-full w-[44px] items-center justify-center rounded-r-full text-[18px] transition-opacity hover:opacity-60 disabled:opacity-25"
      >
        +
      </button>
    </div>
  );
}
