import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAdminPost,
  createAdminPost,
  updateAdminPost,
  uploadAdminPostCover,
  qk,
} from '../../lib/api';

const emptyForm = () => ({ title: '', slug: '', excerpt: '', content: '', isPublished: false });

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-grey-700">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  'h-[42px] rounded-[6px] border border-black/15 bg-white px-3 text-[14px] outline-none focus:border-black';

export default function AdminBlogFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: qk.adminPost(id),
    queryFn: () => getAdminPost(id),
    enabled: isEdit,
  });

  const [form, setForm] = useState(emptyForm());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (existing?.post) {
      const p = existing.post;
      setForm({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt || '',
        content: p.content,
        isPublished: p.isPublished,
      });
    }
  }, [existing]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = { ...form, excerpt: form.excerpt || null, slug: form.slug || undefined };
      if (isEdit) {
        await updateAdminPost(id, payload);
        qc.invalidateQueries({ queryKey: qk.adminPost(id) });
        qc.invalidateQueries({ queryKey: qk.adminPosts() });
      } else {
        const { post } = await createAdminPost(payload);
        qc.invalidateQueries({ queryKey: qk.adminPosts() });
        navigate(`/admin/blog/${post.id}/edit`, { replace: true });
        return;
      }
      navigate('/admin/blog');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !isEdit) return;
    setUploading(true);
    setError(null);
    try {
      await uploadAdminPostCover(id, file);
      qc.invalidateQueries({ queryKey: qk.adminPost(id) });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (isEdit && loadingExisting) return <p className="text-eyebrow text-grey-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="flex items-center gap-3">
        <Link to="/admin/blog" className="text-[13px] text-grey-500 hover:text-black">
          ← Blog
        </Link>
      </div>
      <h1 className="mt-3 text-[28px] font-black tracking-[-0.02em]">
        {isEdit ? `Edit "${existing?.post?.title || ''}"` : 'New post'}
      </h1>

      {error && (
        <p role="alert" className="mt-4 rounded-[8px] bg-red-100 p-3 text-[13px] text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
        <Field label="Title">
          <input required value={form.title} onChange={set('title')} className={inputCls} maxLength={160} />
        </Field>

        <Field label="Slug (leave blank to auto-generate from the title)">
          <input
            value={form.slug}
            onChange={set('slug')}
            placeholder="auto-generated"
            className={inputCls}
            pattern="[a-z0-9-]*"
          />
        </Field>

        <Field label="Excerpt (shown on the Journal list + used as the meta description)">
          <textarea
            value={form.excerpt}
            onChange={set('excerpt')}
            maxLength={300}
            rows={3}
            className="rounded-[6px] border border-black/15 bg-white p-3 text-[14px] outline-none focus:border-black"
          />
        </Field>

        <Field label="Content (Markdown)">
          <textarea
            required
            value={form.content}
            onChange={set('content')}
            rows={16}
            className="rounded-[6px] border border-black/15 bg-white p-3 font-mono text-[13px] leading-[1.6] outline-none focus:border-black"
          />
        </Field>

        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-grey-700">Cover image</span>
          {existing?.post?.coverImage && (
            <img
              src={existing.post.coverImage}
              alt=""
              className="h-[140px] w-[220px] rounded-[6px] object-cover"
            />
          )}
          {isEdit ? (
            <label className="w-fit cursor-pointer rounded-full border border-black/15 px-4 py-[8px] text-[13px] font-medium hover:border-black">
              {uploading ? 'Uploading…' : existing?.post?.coverImage ? 'Replace cover' : 'Upload cover'}
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading} />
            </label>
          ) : (
            <p className="text-[11px] text-grey-500">Save first to add a cover image</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-[13px] text-grey-700">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
            className="h-[16px] w-[16px] accent-black"
          />
          Published — live on /journal
        </label>

        <div className="mt-2 flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-black px-6 py-[12px] text-[13px] font-bold text-off-white hover:opacity-85 disabled:opacity-50"
          >
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create post'}
          </button>
          <Link
            to="/admin/blog"
            className="rounded-full border border-black/15 px-6 py-[12px] text-[13px] font-medium hover:border-black"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
