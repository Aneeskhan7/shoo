import { useEffect, useState } from 'react';

function timeLeft(endsAt) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * Ticks down to `endsAt` (ISO string) once a second, renders nothing once it
 * hits zero — callers already gate on a still-future offerEndsAt before
 * mounting this, but this is the second line of defense against a stale
 * render lingering past expiry.
 *
 * `compact` (product card): one inline "HHh MMm SSs" string.
 * default (product page): a bigger boxed unit-by-unit timer.
 *
 * `label`, when given, is only rendered alongside a still-live timer — so a
 * label like "Offer ends in" never lingers on screen once the offer expires
 * and this returns null.
 */
export default function CountdownTimer({ endsAt, compact = false, label, className = '' }) {
  const [left, setLeft] = useState(() => timeLeft(endsAt));

  useEffect(() => {
    setLeft(timeLeft(endsAt));
    const id = setInterval(() => setLeft(timeLeft(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!left) return null;

  if (compact) {
    return (
      <span className={className}>
        {label && <span className="mr-[6px]">{label}</span>}
        <span className="tabular-nums">
          {left.days > 0 ? `${left.days}d ` : ''}
          {pad(left.hours)}h {pad(left.minutes)}m {pad(left.seconds)}s
        </span>
      </span>
    );
  }

  const units = [
    ...(left.days > 0 ? [['d', left.days]] : []),
    ['h', left.hours],
    ['m', left.minutes],
    ['s', left.seconds],
  ];

  return (
    <div className={`flex items-center gap-[10px] ${className}`}>
      {label && <span className="text-[11px] font-medium tracking-[0.04em] text-grey-700">{label}</span>}
      <div className="flex items-center gap-[6px]">
        {units.map(([unit, value], i) => (
          <div key={unit} className="flex items-center gap-[6px]">
            {i > 0 && <span className="text-[14px] font-bold text-black/30">:</span>}
            <div className="flex flex-col items-center rounded-[4px] bg-black px-[8px] py-[4px] text-off-white">
              <span className="text-[15px] font-bold leading-none tabular-nums">{pad(value)}</span>
              <span className="mt-[2px] text-[8px] uppercase leading-none tracking-[0.06em] text-off-white/60">
                {unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
