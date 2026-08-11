/**
 * Payment method tabs from Figma (40:151) — 46px tall, hairline border.
 * Options may carry `disabled` + `note`; a disabled tab renders the "Coming
 * Soon" affordance and cannot be selected.
 */
export default function TabGroup({ options, value, onChange, ariaLabel = 'Options' }) {
  return (
    <div
      className="inline-flex h-[46px] overflow-hidden rounded-[8px] border border-current/20"
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const selected = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={opt.disabled}
            title={opt.disabled ? 'Coming soon' : undefined}
            onClick={() => !opt.disabled && onChange(opt.id)}
            className={`relative flex h-full items-center gap-2 border-r border-current/15 px-5 text-[15px] transition-colors last:border-r-0 ${
              selected ? 'bg-green text-black' : 'hover:bg-current/5'
            } ${opt.disabled ? 'cursor-not-allowed opacity-40' : ''}`}
          >
            <span>{opt.label}</span>
            {opt.disabled && (
              <span className="text-label rounded-full border border-current/40 px-2 py-[2px] text-[9px]">
                Soon
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
