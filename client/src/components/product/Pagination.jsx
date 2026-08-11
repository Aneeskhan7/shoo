export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  );

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-full border border-[#d3d3d3] bg-white px-[14px] py-[7px] text-[12px] font-medium text-grey-700 disabled:opacity-30"
      >
        ←
      </button>
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - nums[i - 1] > 1 && <span className="text-[12px] text-grey-500">…</span>}
          <button
            type="button"
            onClick={() => onChange(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`min-w-[34px] rounded-full px-[12px] py-[7px] text-[12px] font-medium ${
              n === page
                ? 'border border-black bg-black text-off-white'
                : 'border border-[#d3d3d3] bg-white text-grey-700 hover:border-black'
            }`}
          >
            {n}
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="rounded-full border border-[#d3d3d3] bg-white px-[14px] py-[7px] text-[12px] font-medium text-grey-700 disabled:opacity-30"
      >
        →
      </button>
    </nav>
  );
}
