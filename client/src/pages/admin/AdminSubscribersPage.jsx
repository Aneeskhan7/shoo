import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminSubscribers, downloadAdminSubscribersCsv, qk } from '../../lib/api';

export default function AdminSubscribersPage() {
  const [q, setQ] = useState('');
  const [downloading, setDownloading] = useState(false);

  const params = { q: q || undefined, limit: 50 };
  const { data, isLoading, error } = useQuery({
    queryKey: qk.adminSubscribers(params),
    queryFn: () => getAdminSubscribers(params),
  });

  const handleExport = async () => {
    setDownloading(true);
    try {
      const blob = await downloadAdminSubscribersCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shoo-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-black tracking-[-0.02em]">Subscribers</h1>
        <button
          type="button"
          onClick={handleExport}
          disabled={downloading}
          className="h-[38px] rounded-full bg-black px-5 text-[13px] font-bold text-off-white transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {downloading ? 'Preparing…' : 'Download CSV'}
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email…"
          className="h-[38px] w-[260px] rounded-full border border-black/15 bg-white px-4 text-[13px] outline-none focus:border-black"
        />
        {data && <span className="text-[13px] text-grey-500">{data.pagination.total} total</span>}
      </div>

      <div className="mt-6 overflow-x-auto rounded-[8px] border border-black/10 bg-white">
        {isLoading ? (
          <p className="p-8 text-center text-[13px] text-grey-500">Loading…</p>
        ) : error ? (
          <p className="p-8 text-center text-[13px] text-red-600">{error.message}</p>
        ) : data.subscribers.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-grey-500">No subscribers yet.</p>
        ) : (
          <table className="w-full min-w-[420px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/10 text-[11px] tracking-[0.05em] text-grey-500">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {data.subscribers.map((s) => (
                <tr key={s.id} className="border-b border-black/5 last:border-b-0">
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3 text-grey-500">
                    {new Date(s.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
