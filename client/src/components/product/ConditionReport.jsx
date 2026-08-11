import { useState } from 'react';
import { getConditionImage } from '../../lib/productImages';

/**
 * Thrift Shoe Condition & Transparency — Figma-adjacent, built to match the
 * existing PDP visual language (black/off-white, lime accent, same border
 * and type scale as the rest of ProductPage) rather than a new design system.
 *
 * Shows the admin's actual entered condition, verbatim — never invented,
 * never softened. Renders nothing if the product has no condition data yet
 * (older products created before this feature), rather than implying a
 * false "everything's fine" report that was never actually reviewed.
 */
const CATEGORY_LABELS = {
  OUTSOLE: 'Outsole',
  HEEL_WEAR: 'Heel Wear',
  TOE_BOX: 'Toe Box',
  CREASES: 'Creases',
  SCRATCHES: 'Scratches',
  STAINS: 'Stains',
  LABELS: 'Labels',
  DEFECTS: 'Defects',
};
// Fixed display order regardless of how the API returns rows.
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

const STATUS_LABEL = {
  NONE: 'None',
  MINIMAL: 'Minimal',
  LIGHT: 'Light',
  MODERATE: 'Moderate',
  HEAVY: 'Heavy',
  PRESENT: 'Present',
};

// NONE reads as a clean/positive signal for most categories — except LABELS,
// where PRESENT (the original tag is still attached) is the positive state.
// Escalation stays within the existing black/off-white/lime palette.
const statusPillClass = (category, status) => {
  const positive = category === 'LABELS' ? status === 'PRESENT' : status === 'NONE';
  if (positive) return 'border border-black/15 bg-green/20 text-black';
  if (status === 'HEAVY' || (status === 'PRESENT' && category === 'DEFECTS')) {
    return 'border border-black bg-black text-off-white';
  }
  return 'border border-black/20 bg-white text-grey-700';
};

function ConditionRow({ product, category }) {
  const [expanded, setExpanded] = useState(false);
  const item = product.conditionItems.find((c) => c.category === category);
  if (!item) return null;

  const photo = getConditionImage(product, category);

  return (
    <div className="border-b border-black/10 py-4 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="w-[110px] shrink-0 text-[13px] font-semibold">{CATEGORY_LABELS[category]}</p>
          <span className={`rounded-full px-[12px] py-[5px] text-[11px] font-medium tracking-[0.01em] ${statusPillClass(category, item.status)}`}>
            {STATUS_LABEL[item.status]}
          </span>
        </div>
        {photo && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 text-[12px] text-grey-500 underline-offset-2 hover:underline"
            aria-expanded={expanded}
          >
            <img src={photo} alt="" className="h-[28px] w-[28px] rounded-[4px] border border-black/10 object-cover" />
            {expanded ? 'Hide photo' : `View ${CATEGORY_LABELS[category].toLowerCase()} photo`}
          </button>
        )}
      </div>
      {item.note && <p className="mt-2 text-[13px] leading-[1.5] text-grey-700">{item.note}</p>}
      {expanded && photo && (
        <div className="mt-3 aspect-square w-full max-w-[320px] overflow-hidden rounded-[8px] bg-[#EDEDED]">
          <img src={photo} alt={`${CATEGORY_LABELS[category]} close-up`} className="h-full w-full object-contain" />
        </div>
      )}
    </div>
  );
}

export default function ConditionReport({ product }) {
  const items = product.conditionItems;
  if (!items?.length) return null;

  const present = CATEGORY_ORDER.filter((cat) => items.some((c) => c.category === cat));
  if (!present.length) return null;

  const half = Math.ceil(present.length / 2);
  const columns = [present.slice(0, half), present.slice(half)];

  return (
    <section className="border-t border-black/10 py-[72px]">
      <div className="container-content">
        <h2 className="text-h1">SHOO Condition Report</h2>
        <p className="mt-3 max-w-[560px] text-[14px] leading-[1.55] text-grey-500">
          Every SHOO piece is pre-owned. Here's exactly what our team found — no surprises at your door.
        </p>
        <div className="mt-8 grid gap-x-12 lg:grid-cols-2">
          {columns.map((col, i) => (
            <div key={i} className="flex flex-col">
              {col.map((category) => (
                <ConditionRow key={category} product={product} category={category} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
