/** About page stat, e.g. "120+ / Brands carried globally" (39:281). */
export default function StatTile({ value, label }) {
  return (
    <div>
      <p className="text-display-l text-green">{value}</p>
      <p className="mt-3 text-[15px] opacity-60">{label}</p>
    </div>
  );
}
