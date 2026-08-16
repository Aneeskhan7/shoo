/**
 * Payment method tabs from Figma (40:151) — 46px tall, hairline border.
 * Options may carry `disabled` + `note`; a disabled tab renders the "Coming
 * Soon" affordance and cannot be selected.
 *
 * flex + flex-1 (not inline-flex): three tabs each sized to their own
 * label/badge content could overflow a narrow mobile screen with nothing to
 * absorb the extra width, which is what was making the disabled Card/Bank
 * tabs render squashed and overlapping. Equal-width flex-1 tabs always fit
 * the container, however narrow.
 */
export default function TabGroup({ options, value, onChange, ariaLabel = 'Options' }) {
  return (
    <div
      className="flex h-[52px] w-full max-w-[420px] overflow-hidden rounded-[8px] border border-current/20"
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
            className={`relative flex h-full flex-1 flex-col items-center justify-center gap-[2px] border-r border-current/15 px-1 text-[12px] leading-none transition-colors last:border-r-0 sm:flex-row sm:gap-2 sm:px-3 sm:text-[14px] ${
              selected ? 'bg-green text-black' : 'hover:bg-current/5'
            } ${opt.disabled ? 'cursor-not-allowed opacity-40' : ''}`}
          >
            <span className="truncate">{opt.label}</span>
            {opt.disabled && (
              <span className="shrink-0 rounded-full border border-current/40 px-[6px] py-[1px] text-[8px] leading-[1.4] sm:text-[9px]">
                Soon
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
