import { Link } from 'react-router-dom';

/**
 * Size Guide — Figma 40:192 (1440×2000). Sections:
 *   40:206 hero        260  #0A0A0A  — eyebrow + 96px Black + 18px lead
 *   40:211 measure     300  white panel (left) + #F2F2F2 diagram panel (right)
 *   40:227 men's chart 820  #F5F4F0  — black header row, zebra rows
 *   40:364 help bar     88  #0A0A0A  — copy left, green pill right
 *   40:368 kids chart  448  #F2F2F2  — 4 columns, zebra rows
 */
const MENS = [
  ['US 6', 'UK 5.5', 'EU 39', '24.5 cm', 'Narrow', 'Snug — half size up if wide'],
  ['US 7', 'UK 6.5', 'EU 40', '25.5 cm', 'Medium', 'True to size'],
  ['US 8', 'UK 7.5', 'EU 41', '26.5 cm', 'Medium', 'True to size'],
  ['US 9', 'UK 8.5', 'EU 42', '27.0 cm', 'Med/Wide', 'True to size — Most popular'],
  ['US 10', 'UK 9.5', 'EU 43', '28.0 cm', 'Medium', 'True to size'],
  ['US 11', 'UK 10.5', 'EU 44', '29.0 cm', 'Medium', 'True to size'],
  ['US 12', 'UK 11.5', 'EU 45', '30.0 cm', 'Medium', 'Roomy toe — size down if narrow'],
  ['US 13', 'UK 12.5', 'EU 46', '31.0 cm', 'Medium', 'One size down recommended'],
];

const KIDS = [
  ['1Y / US 4K', 'EU 19', '11.0 cm', '0–12 months'],
  ['2Y / US 6K', 'EU 22', '13.5 cm', '1–2 years'],
  ['4Y / US 11K', 'EU 28', '17.5 cm', '3–5 years'],
  ['6Y / US 13K', 'EU 31', '19.5 cm', '5–7 years'],
  ['8Y / US 1', 'EU 33', '21.0 cm', '7–9 years'],
];

const WIDTHS = [
  ['N — Narrow', 'Slim, high-arch feet.'],
  ['M — Medium', 'Standard. Works for most.'],
  ['W — Wide', 'Extra room in toe box.'],
  ['XW — Extra Wide', 'Max width. Go half size down.'],
];

const STEPS = [
  'Trace foot on paper.',
  'Measure heel to longest toe in cm.',
  'Add 0.5 cm for comfort.',
  'Match to chart below.',
];

/** Shared zebra table — black header, alternating white / #F2F2F2 rows. */
function Chart({ headers, rows, widths }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse overflow-hidden rounded-[8px]">
        <thead>
          <tr className="bg-black">
            {headers.map((h, i) => (
              <th
                key={h}
                className="h-[48px] px-4 text-center text-[11px] font-bold tracking-[0.1em] text-off-white"
                style={widths ? { width: widths[i] } : undefined}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={r[0]} className={ri % 2 === 0 ? 'bg-white' : 'bg-[#F2F2F2]'}>
              {r.map((cell, ci) => {
                const popular = typeof cell === 'string' && cell.includes('Most popular');
                return (
                  <td
                    key={ci}
                    className={`h-[52px] px-4 text-center text-[14px] ${
                      popular ? 'text-green-700' : 'text-black'
                    }`}
                  >
                    {popular ? (
                      <>
                        True to size <span className="text-grey-500">—</span>{' '}
                        <span className="font-medium">Most popular</span>
                      </>
                    ) : (
                      cell
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SizeGuidePage() {
  return (
    <div className="bg-off-white text-black">
      {/* ── Hero (40:206) — dark, 260px + 84px nav ───────────── */}
      <section className="flex flex-col gap-[14px] bg-black px-6 pb-[56px] pt-[140px] text-off-white lg:px-20">
        <p className="text-eyebrow text-grey-500">SIZING &amp; FIT GUIDE</p>
        <h1
          className="mt-[6px] font-black tracking-[-0.03em]"
          style={{ fontSize: 'clamp(40px, 6.67vw, 96px)' }}
        >
          Find Your Perfect Fit.
        </h1>
        <p className="max-w-[700px] text-[18px] leading-[1.5] text-off-white/75">
          Every SHOO runs true to size. Between sizes? Go half a size up.
        </p>
      </section>

      {/* ── How to Measure (40:211) — centered as one group, 300px ──── */}
      <section className="flex flex-col items-center justify-center gap-10 bg-[#F2F2F2] px-6 py-10 lg:h-[300px] lg:flex-row lg:gap-16">
        <div className="flex flex-col items-start">
          <h2 className="whitespace-nowrap text-[24px] font-bold tracking-[-0.01em]">
            How to Measure
          </h2>
          <ol className="mt-5 flex flex-col items-start gap-[10px] text-[13px] text-grey-700">
            {STEPS.map((s, i) => (
              <li key={s} className="flex gap-2">
                <span className="text-grey-500">{i + 1}.</span>
                <span className="whitespace-nowrap">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Below lg: stacked + centered, so the box itself sits dead-center
            (as a row, the trailing text pulled the combined block's center
            off to one side, leaving the box looking off-center). lg: keeps
            the original side-by-side arrangement. */}
        <div className="flex flex-col items-center gap-3 lg:flex-row lg:gap-6">
          {/* Foot diagram — outline box, ellipse, toe dots (placeholder art) */}
          <div className="relative h-[136px] w-[130px] border border-grey-500/60">
            <span className="absolute left-1/2 top-[6px] flex -translate-x-1/2 gap-[3px]">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="h-[7px] w-[7px] rounded-full bg-[#CCCCC7]" />
              ))}
            </span>
            <span className="absolute left-1/2 top-[14px] h-[112px] w-[52px] -translate-x-1/2 rounded-[50%] bg-[#CCCCC7]" />
          </div>
          <p className="text-[14px] text-grey-700">
            ≈ 27 cm <span className="mx-1 text-grey-500">=</span> US 9
          </p>
        </div>
      </section>

      {/* ── Men's chart (40:227) — 820px ─────────────────────── */}
      <section className="bg-off-white px-6 py-[48px] lg:px-20">
        <p className="text-eyebrow text-grey-500">MEN’S SIZE CHART</p>
        <div className="mt-[22px]">
          <Chart headers={['US', 'UK', 'EU', 'CM', 'WIDTH', 'FIT NOTE']} rows={MENS} />
        </div>

        <p className="text-eyebrow mt-[48px] text-grey-500">WIDTH GUIDE</p>
        <div className="mt-[22px] grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
          {WIDTHS.map(([name, note], i) => (
            <div
              key={name}
              className={`px-6 py-5 ${i > 0 ? 'lg:border-l lg:border-black/10' : ''} ${
                i === 0 ? 'lg:pl-0' : ''
              }`}
            >
              <p className="text-[14px] font-bold">{name}</p>
              <p className="mt-2 text-[13px] text-grey-500">{note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Help bar (40:364) — dark, 88px ───────────────────── */}
      <section className="flex flex-col items-start justify-between gap-5 bg-black px-6 py-6 text-off-white sm:flex-row sm:items-center lg:h-[88px] lg:px-20 lg:py-0">
        <p className="text-[16px]">Still unsure? Our sizing team replies in under 2 hours.</p>
        <Link
          to="/about"
          className="shrink-0 rounded-full bg-green px-[24px] py-[12px] text-[14px] font-bold text-black transition-opacity hover:opacity-85"
        >
          Chat With Us →
        </Link>
      </section>

      {/* ── Kids' chart (40:368) — #F2F2F2, 448px ────────────── */}
      <section className="bg-[#F2F2F2] px-6 py-[48px] lg:px-20">
        <p className="text-eyebrow text-grey-500">KIDS’ SIZE CHART</p>
        <div className="mt-[22px]">
          <Chart
            headers={['US KIDS', 'EU', 'CM LENGTH', 'APPROX. AGE']}
            rows={KIDS}
            widths={['25%', '25%', '25%', '25%']}
          />
        </div>
      </section>
    </div>
  );
}
