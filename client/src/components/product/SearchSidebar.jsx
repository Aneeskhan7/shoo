/**
 * Left facet rail — Figma 41:170 (280px, white, CATEGORY/SIZE/COLOR/PRICE
 * checkbox groups). Search-only: the Shop page keeps FilterBar's chip-only
 * layout, which is its own deliberate (and separately documented) choice.
 *
 * Counts are computed from the current result page, not the full catalog —
 * there's no facet-count endpoint, and this list is already what's on screen.
 */
const CATEGORY_OPTIONS = [
  ['Runners', 'Runners'],
  ['High Top', 'High-Top'],
  ['Classic', 'Lifestyle'],
  ['Trail', 'Trainers'],
];

// Thresholds match the current PKR price scale (~16,500–47,500), not the
// old $100/$150 split.
const PRICE_BUCKETS = [
  ['Under PKR 25,000', { minPrice: null, maxPrice: '25000' }],
  ['PKR 25,000–40,000', { minPrice: '25000', maxPrice: '40000' }],
  ['PKR 40,000+', { minPrice: '40000', maxPrice: null }],
];

function FacetCheckbox({ checked, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className="flex w-full items-center gap-[10px] py-[7px] text-left"
    >
      <span
        className={`flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-[3px] border-[1.5px] ${
          checked ? 'border-black bg-black' : 'border-[#d3d3d3] bg-transparent'
        }`}
      >
        {checked && <span className="text-[10px] font-bold leading-none text-off-white">✓</span>}
      </span>
      <span className={`text-[13px] tracking-[0.005em] ${checked ? 'text-black' : 'text-grey-700'}`}>
        {label}
      </span>
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="w-full">
      <p className="text-eyebrow text-black">{title}</p>
      <div className="mt-3 flex flex-col">{children}</div>
    </div>
  );
}

function Divider() {
  return <div className="my-4 h-px w-full bg-[#d3d3d3]" />;
}

export default function SearchSidebar({ params, setParam, setParamsMulti, filters, list, className = '' }) {
  const silhouette = params.get('silhouette');
  const size = params.get('size');
  const color = params.get('color');
  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');
  const available = params.get('available') === 'true';

  const countSilhouette = (value) => list.filter((p) => p.silhouette === value).length;
  const countSize = (s) => list.filter((p) => p.variants?.some((v) => v.size === s)).length;
  const countColor = (c) => list.filter((p) => p.colors?.some((col) => col.name === c)).length;
  const countInStock = () => list.filter((p) => p.inStock).length;

  const activeBucket = PRICE_BUCKETS.find(
    ([, b]) => (b.minPrice ?? null) === minPrice && (b.maxPrice ?? null) === maxPrice,
  )?.[0];

  return (
    <aside className={`flex flex-col ${className}`}>
      <Section title="Category">
        {CATEGORY_OPTIONS.map(([label, value]) => (
          <FacetCheckbox
            key={value}
            label={`${label} (${countSilhouette(value)})`}
            checked={silhouette === value}
            onClick={() => setParam('silhouette', silhouette === value ? null : value)}
          />
        ))}
      </Section>
      <Divider />

      {filters?.sizes?.length > 0 && (
        <>
          <Section title="Size">
            {filters.sizes.map((s) => (
              <FacetCheckbox
                key={s}
                label={`${s} (${countSize(s)})`}
                checked={size === s}
                onClick={() => setParam('size', size === s ? null : s)}
              />
            ))}
          </Section>
          <Divider />
        </>
      )}

      {filters?.colors?.length > 0 && (
        <>
          <Section title="Color">
            {filters.colors.map((c) => (
              <FacetCheckbox
                key={c.name}
                label={`${c.name} (${countColor(c.name)})`}
                checked={color === c.name}
                onClick={() => setParam('color', color === c.name ? null : c.name)}
              />
            ))}
          </Section>
          <Divider />
        </>
      )}

      <Section title="Price">
        {PRICE_BUCKETS.map(([label, bucket]) => (
          <FacetCheckbox
            key={label}
            label={label}
            checked={activeBucket === label}
            onClick={() =>
              setParamsMulti(
                activeBucket === label
                  ? [
                      ['minPrice', null],
                      ['maxPrice', null],
                    ]
                  : [
                      ['minPrice', bucket.minPrice],
                      ['maxPrice', bucket.maxPrice],
                    ],
              )
            }
          />
        ))}
      </Section>
      <Divider />

      <Section title="Availability">
        <FacetCheckbox
          label={`In stock only (${countInStock()})`}
          checked={available}
          onClick={() => setParam('available', available ? null : 'true')}
        />
      </Section>
    </aside>
  );
}
