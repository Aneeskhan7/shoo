import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getAdminPosts, deleteAdminPost, qk } from '../../lib/api';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

export default function AdminBlogListPage() {
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({ queryKey: qk.adminPosts(), queryFn: getAdminPosts });
  const posts = data?.posts ?? [];

  const confirmDelete = async (post) => {
    setNotice(null);
    try {
      await deleteAdminPost(post.id);
      qc.invalidateQueries({ queryKey: qk.adminPosts() });
      setNotice({ type: 'success', text: `Deleted "${post.title}".` });
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-black tracking-[-0.02em]">Blog</h1>
        <Link
          to="/admin/blog/new"
          className="rounded-full bg-black px-5 py-[10px] text-[13px] font-bold text-off-white hover:opacity-85"
        >
          + New post
        </Link>
      </div>

      {notice && (
        <p
          role="status"
          className={`mt-4 rounded-[8px] p-3 text-[13px] ${
            notice.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green/20 text-black'
          }`}
        >
          {notice.text}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-[8px] border border-black/10 bg-white">
        {isLoading ? (
          <p className="p-8 text-center text-[13px] text-grey-500">Loading…</p>
        ) : error ? (
          <p className="p-8 text-center text-[13px] text-red-600">{error.message}</p>
        ) : posts.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-grey-500">No posts yet.</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-black/10 text-[11px] tracking-[0.05em] text-grey-500">
                <th className="px-4 py-3 font-medium">Post</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-black/5 last:border-b-0 hover:bg-black/[0.02]">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-grey-500">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    {p.isPublished ? (
                      <span className="rounded-full bg-green/30 px-2 py-[3px] text-[10px] font-bold text-black">
                        PUBLISHED
                      </span>
                    ) : (
                      <span className="rounded-full bg-black/5 px-2 py-[3px] text-[10px] font-bold text-grey-500">
                        DRAFT
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-grey-500">{fmt(p.publishedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/blog/${p.id}/edit`}
                        className="rounded-full border border-black/15 px-3 py-[6px] text-[12px] font-medium hover:border-black"
                      >
                        Edit
                      </Link>
                      {deleting === p.id ? (
                        <span className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => confirmDelete(p)}
                            className="rounded-full bg-red-600 px-3 py-[6px] text-[12px] font-bold text-white"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(null)}
                            className="rounded-full border border-black/15 px-3 py-[6px] text-[12px]"
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleting(p.id)}
                          className="rounded-full border border-red-200 px-3 py-[6px] text-[12px] font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
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
