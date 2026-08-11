import { useState } from 'react';
import { formatPrice } from '../ui/Price';

/**
 * Filter chip row from Figma 41:155 — pill chips, 14/7 padding, active chip is
 * solid black. The design uses chips rather than a sidebar, so the PLP follows
 * that; facets that don't fit as chips live in the "All filters" panel below.
 */
const SILHOUETTES = ['All', 'Runners', 'High Top', 'Classic', 'Trail'];

const SILHOUETTE_VALUE = {
  Runners: 'Runners',
  'High Top': 'High-Top',
  Classic: 'Lifestyle',
  Trail: 'Trainers',
};

const SORTS = [
  ['newest', 'Newest'],
  ['featured', 'Featured'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['name', 'Name A–Z'],
];

function Chip({ active, children, ...props }) {
  return (
    <button
      type="button"
      className={`flex items-center gap-[6px] rounded-full px-[14px] py-[7px] text-[12px] font-medium tracking-[0.01em] transition-colors ${
        active
          ? 'border border-black bg-black text-off-white'
          : 'border border-[#d3d3d3] bg-white text-grey-700 hover:border-black'
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function FilterBar({ params, setParam, clearAll, filters }) {
  const [open, setOpen] = useState(false);

  const silhouette = params.get('silhouette');
  const activeChips = ['gender', 'size', 'color', 'brand', 'category', 'tag', 'available']
    .map((key) => [key, params.get(key)])
    .filter(([, v]) => v);

  return (
    <div className="bg-off-white">
      <div className="flex flex-wrap items-center gap-[8px] px-6 py-4 lg:px-20">
        {SILHOUETTES.map((s) => {
          const value = SILHOUETTE_VALUE[s];
          const active = s === 'All' ? !silhouette : silhouette === value;
          return (
            <Chip
              key={s}
              active={active}
              onClick={() => setParam('silhouette', s === 'All' ? null : value)}
            >
              {s}
            </Chip>
          );
        })}

        {activeChips.map(([key, value]) => (
          <Chip key={key} onClick={() => setParam(key, null)}>
            <span className="capitalize">
              {key === 'available' ? 'In stock' : `${key}: ${value}`}
            </span>
            <span className="text-grey-500" aria-hidden="true">
              ×
            </span>
          </Chip>
        ))}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="rounded-full border border-[#d3d3d3] bg-white px-[14px] py-[7px] text-[12px] font-medium text-grey-700 hover:border-black"
        >
          All filters {open ? '−' : '+'}
        </button>

        {(silhouette || activeChips.length > 0) && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[12px] tracking-[0.02em] text-grey-500 underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        )}

        <label className="ml-auto flex items-center gap-2 text-[12px] text-grey-500">
          Sort
          <select
            value={params.get('sort') || 'newest'}
            onChange={(e) => setParam('sort', e.target.value)}
            className="rounded-full border border-[#d3d3d3] bg-white px-[14px] py-[7px] text-[12px] font-medium text-grey-700 outline-none focus:border-black"
          >
            {SORTS.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {open && filters && (
        <div className="grid gap-6 border-t border-black/10 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-20">
          <fieldset>
            <legend className="text-label text-grey-500">Size</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {filters.sizes.map((s) => (
                <Chip key={s} active={params.get('size') === s} onClick={() => setParam('size', s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-label text-grey-500">Colour</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {filters.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={params.get('color') === c.name}
                  onClick={() => setParam('color', c.name)}
                  className={`h-[28px] w-[28px] rounded-full transition-all ${
                    params.get('color') === c.name
                      ? 'border-[2.5px] border-black'
                      : 'border border-[#d3d3d3]'
                  }`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-label text-grey-500">Gender</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {filters.genders.map((g) => (
                <Chip
                  key={g}
                  active={params.get('gender') === g}
                  onClick={() => setParam('gender', g)}
                >
                  {g}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-label text-grey-500">
              Max price — {formatPrice(params.get('maxPrice') || filters.priceRange.max)}
            </legend>
            <input
              type="range"
              min={filters.priceRange.min}
              max={filters.priceRange.max}
              step="5"
              value={params.get('maxPrice') || filters.priceRange.max}
              onChange={(e) => setParam('maxPrice', e.target.value)}
              className="mt-4 w-full accent-black"
            />
          </fieldset>

          <fieldset>
            <legend className="text-label text-grey-500">Availability</legend>
            <label className="mt-3 flex items-center gap-2 text-[13px] text-grey-700">
              <input
                type="checkbox"
                checked={params.get('available') === 'true'}
                onChange={(e) => setParam('available', e.target.checked ? 'true' : null)}
                className="h-[16px] w-[16px] accent-black"
              />
              In stock only
            </label>
          </fieldset>
        </div>
      )}
    </div>
  );
}
