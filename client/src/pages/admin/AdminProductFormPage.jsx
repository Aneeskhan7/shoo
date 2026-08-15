import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAdminMeta,
  createAdminBrand,
  getAdminProduct,
  createAdminProduct,
  updateAdminProduct,
  uploadAdminProductImage,
  deleteAdminProductImage,
  setAdminPrimaryImage,
  qk,
} from '../../lib/api';
import { formatPrice } from '../../components/ui/Price';

const GENDERS = ['UNISEX', 'MEN', 'WOMEN', 'KIDS'];
const KNOWN_TAGS = ['new-release', 'bestseller', 'sale'];

const emptyVariant = () => ({
  size: '',
  colorName: '',
  colorHex: '#0A0A0A',
  price: '', // this field is always the actual/original price, never the discounted one
  discountPercent: '0',
  stock: '1',
});

/** Original price when a discount is running, else just the sale price. */
const actualPriceOf = (v) => String(v.compareAtPrice ?? v.price);
const discountPercentOf = (v) =>
  v.compareAtPrice && Number(v.compareAtPrice) > Number(v.price)
    ? String(Math.round((1 - Number(v.price) / Number(v.compareAtPrice)) * 100))
    : '0';

// Thrift Shoe Condition & Transparency — exact eight categories, DEFECTS
// uses its own two-value scale, the rest share the wear scale.
const CONDITION_CATEGORIES = [
  { key: 'OUTSOLE', label: 'Outsole' },
  { key: 'HEEL_WEAR', label: 'Heel Wear' },
  { key: 'TOE_BOX', label: 'Toe Box' },
  { key: 'CREASES', label: 'Creases' },
  { key: 'SCRATCHES', label: 'Scratches' },
  { key: 'STAINS', label: 'Stains' },
  { key: 'LABELS', label: 'Labels' },
  { key: 'DEFECTS', label: 'Defects' },
];
const WEAR_STATUSES = ['NONE', 'MINIMAL', 'LIGHT', 'MODERATE', 'HEAVY'];
// LABELS and DEFECTS are presence checks, not a wear gradient.
const DEFECT_STATUSES = ['NONE', 'PRESENT'];
const statusesFor = (category) => (['DEFECTS', 'LABELS'].includes(category) ? DEFECT_STATUSES : WEAR_STATUSES);

const emptyConditions = () =>
  Object.fromEntries(CONDITION_CATEGORIES.map((c) => [c.key, { status: 'NONE', note: '' }]));

const emptyForm = () => ({
  name: '',
  description: '',
  tagline: '',
  story: '',
  brandId: '',
  categoryId: '',
  gender: 'UNISEX',
  silhouette: '',
  isActive: true,
  isFeatured: false,
  tags: [],
  variants: [emptyVariant()],
  conditions: emptyConditions(),
});

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

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: meta } = useQuery({ queryKey: qk.adminMeta(), queryFn: getAdminMeta });
  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: qk.adminProduct(id),
    queryFn: () => getAdminProduct(id),
    enabled: isEdit,
  });

  const [form, setForm] = useState(emptyForm());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [addingBrand, setAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [brandBusy, setBrandBusy] = useState(false);

  useEffect(() => {
    if (existing?.product) {
      const p = existing.product;
      setForm({
        name: p.name,
        description: p.description || '',
        tagline: p.tagline || '',
        story: p.story || '',
        brandId: p.brandId,
        categoryId: p.categoryId,
        gender: p.gender,
        silhouette: p.silhouette || '',
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        tags: p.tags,
        variants: p.variants.length
          ? p.variants.map((v) => ({
              ...v,
              price: actualPriceOf(v),
              discountPercent: discountPercentOf(v),
              stock: String(v.stock),
            }))
          : [emptyVariant()],
        conditions: {
          ...emptyConditions(),
          ...Object.fromEntries(
            (p.conditionItems || []).map((c) => [c.category, { status: c.status, note: c.note || '' }]),
          ),
        },
      });
    }
  }, [existing]);

  useEffect(() => {
    if (meta && !isEdit) {
      setForm((f) => ({
        ...f,
        brandId: f.brandId || meta.brands[0]?.id || '',
        categoryId: f.categoryId || meta.categories[0]?.id || '',
      }));
    }
  }, [meta, isEdit]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setChecked = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }));

  const toggleTag = (tag) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));

  const setVariant = (i, key, value) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, vi) => (vi === i ? { ...v, [key]: value } : v)),
    }));

  const addVariant = () => setForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] }));
  const removeVariant = (i) =>
    setForm((f) => ({ ...f, variants: f.variants.filter((_, vi) => vi !== i) }));

  const setCondition = (category, key, value) =>
    setForm((f) => ({
      ...f,
      conditions: { ...f.conditions, [category]: { ...f.conditions[category], [key]: value } },
    }));

  const addBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setBrandBusy(true);
    setError(null);
    try {
      const { brand } = await createAdminBrand({ name: newBrandName.trim() });
      await qc.invalidateQueries({ queryKey: qk.adminMeta() });
      setForm((f) => ({ ...f, brandId: brand.id }));
      setNewBrandName('');
      setAddingBrand(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBrandBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        ...form,
        description: form.description || undefined,
        tagline: form.tagline || undefined,
        story: form.story || undefined,
        silhouette: form.silhouette || undefined,
        variants: form.variants
          .filter((v) => v.size.trim() && v.colorName.trim())
          .map((v) => {
            // v.price is always the actual/original price the admin typed —
            // the discount, when set, derives the real selling price from it.
            const actual = Number(v.price);
            const discount = Number(v.discountPercent || 0);
            const price = discount > 0 ? Math.round(actual * (1 - discount / 100)) : actual;
            return {
              ...(v.id ? { id: v.id } : {}),
              size: v.size.trim(),
              colorName: v.colorName.trim(),
              colorHex: v.colorHex,
              price,
              compareAtPrice: discount > 0 ? actual : null,
              stock: Number(v.stock),
            };
          }),
        conditions: CONDITION_CATEGORIES.map(({ key }) => ({
          category: key,
          status: form.conditions[key].status,
          note: form.conditions[key].note.trim() || undefined,
        })),
      };
      if (isEdit) {
        await updateAdminProduct(id, payload);
        qc.invalidateQueries({ queryKey: qk.adminProduct(id) });
        qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      } else {
        const { product } = await createAdminProduct(payload);
        qc.invalidateQueries({ queryKey: ['admin', 'products'] });
        navigate(`/admin/products/${product.id}/edit`, { replace: true });
        return;
      }
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onUpload = async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    setError(null);
    // Sequential, not concurrent: each upload picks its gallery position/
    // primary flag from a fresh count of existing images, so two requests
    // racing each other could both land on the same position.
    for (let i = 0; i < files.length; i += 1) {
      setUploading(files.length > 1 ? `${i + 1}/${files.length}` : true);
      try {
        await uploadAdminProductImage(id, files[i]);
        qc.invalidateQueries({ queryKey: qk.adminProduct(id) });
      } catch (err) {
        setError(files.length > 1 ? `${files[i].name}: ${err.message}` : err.message);
      }
    }
    setUploading(false);
  };

  const removeImage = async (imageId) => {
    try {
      await deleteAdminProductImage(id, imageId);
      qc.invalidateQueries({ queryKey: qk.adminProduct(id) });
    } catch (err) {
      setError(err.message);
    }
  };

  const makePrimary = async (imageId) => {
    try {
      await setAdminPrimaryImage(id, imageId);
      qc.invalidateQueries({ queryKey: qk.adminProduct(id) });
    } catch (err) {
      setError(err.message);
    }
  };

  const [uploadingCategory, setUploadingCategory] = useState(null);

  const onUploadConditionPhoto = (category) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingCategory(category);
    setError(null);
    try {
      await uploadAdminProductImage(id, file, category);
      qc.invalidateQueries({ queryKey: qk.adminProduct(id) });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingCategory(null);
    }
  };

  const conditionImages = existing?.product?.images?.filter((img) => img.conditionCategory) || [];

  if (isEdit && loadingExisting) return <p className="text-eyebrow text-grey-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-[880px]">
      <div className="flex items-center gap-3">
        <Link to="/admin/products" className="text-[13px] text-grey-500 hover:underline">
          ← Products
        </Link>
      </div>
      <h1 className="mt-2 text-[28px] font-black tracking-[-0.02em]">
        {isEdit ? `Edit ${existing?.product?.name || ''}` : 'Add product'}
      </h1>

      {error && (
        <p role="alert" className="mt-4 rounded-[8px] bg-red-100 p-3 text-[13px] text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={submit} className="mt-6 flex flex-col gap-8">
        <section className="grid gap-4 rounded-[8px] border border-black/10 bg-white p-6 sm:grid-cols-2">
          <Field label="Product name">
            <input required value={form.name} onChange={set('name')} className={inputCls} />
          </Field>
          <Field label="Tagline">
            <input value={form.tagline} onChange={set('tagline')} className={inputCls} />
          </Field>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-grey-700">Brand</span>
            {addingBrand ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. Nike"
                  className={`${inputCls} flex-1`}
                  onKeyDown={(e) => e.key === 'Escape' && setAddingBrand(false)}
                />
                <button
                  type="button"
                  onClick={addBrand}
                  disabled={brandBusy || !newBrandName.trim()}
                  className="h-[42px] shrink-0 rounded-[6px] bg-black px-3 text-[12px] font-medium text-off-white disabled:opacity-40"
                >
                  {brandBusy ? '…' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setAddingBrand(false)}
                  className="h-[42px] shrink-0 rounded-[6px] border border-black/15 px-3 text-[12px] font-medium hover:border-black"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  required
                  value={form.brandId}
                  onChange={set('brandId')}
                  className={`${inputCls} flex-1`}
                >
                  {meta?.brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setAddingBrand(true)}
                  className="h-[42px] shrink-0 rounded-[6px] border border-black/15 px-3 text-[12px] font-medium hover:border-black"
                >
                  + New
                </button>
              </div>
            )}
          </div>
          <Field label="Category">
            <select required value={form.categoryId} onChange={set('categoryId')} className={inputCls}>
              {meta?.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Gender">
            <select value={form.gender} onChange={set('gender')} className={inputCls}>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Silhouette (drives the 3D grid filter)">
            <input value={form.silhouette} onChange={set('silhouette')} className={inputCls} placeholder="Runners, Lifestyle…" />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={set('description')}
              rows={3}
              className="rounded-[6px] border border-black/15 bg-white px-3 py-2 text-[14px] outline-none focus:border-black"
            />
          </Field>
          <Field label="Story (PDP editorial copy)">
            <textarea
              value={form.story}
              onChange={set('story')}
              rows={3}
              className="rounded-[6px] border border-black/15 bg-white px-3 py-2 text-[14px] outline-none focus:border-black"
            />
          </Field>

          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={form.isActive} onChange={setChecked('isActive')} />
              Active (visible on the storefront)
            </label>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={form.isFeatured} onChange={setChecked('isFeatured')} />
              Featured
            </label>
          </div>

          <div className="sm:col-span-2">
            <span className="text-[12px] font-medium text-grey-700">Tags</span>
            <div className="mt-2 flex gap-2">
              {KNOWN_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-3 py-[6px] text-[12px] ${
                    form.tags.includes(tag) ? 'border-black bg-black text-off-white' : 'border-black/15'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[8px] border border-black/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold">Sizes, colors &amp; stock</h2>
            <button
              type="button"
              onClick={addVariant}
              className="rounded-full border border-black/15 px-3 py-[6px] text-[12px] font-medium hover:border-black"
            >
              + Add size/color
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {form.variants.map((v, i) => (
              <div key={v.id || i} className="grid grid-cols-2 gap-2 rounded-[6px] border border-black/10 p-3 sm:grid-cols-7">
                <Field label="Size">
                  <input
                    required
                    value={v.size}
                    onChange={(e) => setVariant(i, 'size', e.target.value)}
                    className={inputCls}
                    placeholder="US 9"
                  />
                </Field>
                <Field label="Color name">
                  <input
                    required
                    value={v.colorName}
                    onChange={(e) => setVariant(i, 'colorName', e.target.value)}
                    className={inputCls}
                    placeholder="Deep Noir"
                  />
                </Field>
                <Field label="Color">
                  <input
                    type="color"
                    value={v.colorHex}
                    onChange={(e) => setVariant(i, 'colorHex', e.target.value)}
                    className="h-[42px] w-full rounded-[6px] border border-black/15"
                  />
                </Field>
                <Field label="Price (PKR)">
                  <input
                    required
                    type="number"
                    min="0"
                    value={v.price}
                    onChange={(e) => setVariant(i, 'price', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Discount %">
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={v.discountPercent}
                    onChange={(e) => setVariant(i, 'discountPercent', e.target.value)}
                    className={inputCls}
                    placeholder="0"
                  />
                  {Number(v.discountPercent) > 0 && Number(v.price) > 0 && (
                    <span className="text-[11px] text-grey-500">
                      → {formatPrice(Math.round(Number(v.price) * (1 - Number(v.discountPercent) / 100)))}
                    </span>
                  )}
                </Field>
                <Field label="Stock">
                  <label className={`flex h-[42px] items-center gap-2 rounded-[6px] border border-black/15 bg-white px-3 text-[13px] ${String(v.stock) === '1' ? 'text-black' : 'text-grey-500'}`}>
                    <input
                      type="checkbox"
                      checked={String(v.stock) === '1'}
                      onChange={(e) => setVariant(i, 'stock', e.target.checked ? '1' : '0')}
                      className="h-[16px] w-[16px] accent-black"
                    />
                    {String(v.stock) === '1' ? 'In stock' : 'Sold'}
                  </label>
                </Field>
                <div className="flex flex-col gap-1">
                  <span aria-hidden="true" className="select-none text-[12px] font-medium text-transparent">
                    Remove
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    disabled={form.variants.length === 1}
                    className="h-[42px] w-full rounded-[6px] border border-red-200 text-[12px] font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[8px] border border-black/10 bg-white p-6">
          <h2 className="text-[16px] font-bold">Condition &amp; Details</h2>
          <p className="mt-1 text-[13px] text-grey-500">
            SHOO sells thrifted shoes — this is what the customer sees on the product page. Be honest.
          </p>
          <div className="mt-4 flex flex-col divide-y divide-black/10">
            {CONDITION_CATEGORIES.map(({ key, label }) => {
              const c = form.conditions[key];
              const photo = conditionImages.find((img) => img.conditionCategory === key);
              return (
                <div key={key} className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-[140px_140px_1fr_auto] sm:items-start">
                  <p className="text-[13px] font-semibold">{label}</p>
                  <select
                    value={c.status}
                    onChange={(e) => setCondition(key, 'status', e.target.value)}
                    className={inputCls}
                  >
                    {statusesFor(key).map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <input
                    value={c.note}
                    onChange={(e) => setCondition(key, 'note', e.target.value)}
                    placeholder="Optional detail — e.g. Visible wear on the forefoot and heel."
                    className={inputCls}
                  />
                  {!isEdit ? (
                    <p className="text-[11px] text-grey-500 sm:self-center">Save first to add a photo</p>
                  ) : photo ? (
                    <div className="flex items-center gap-2">
                      <img src={photo.url} alt={`${label} condition`} className="h-[42px] w-[42px] rounded-[4px] border border-black/10 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(photo.id)}
                        className="rounded-[4px] border border-red-200 px-2 py-1 text-[10px] text-red-600 hover:bg-red-50"
                      >
                        Remove photo
                      </button>
                    </div>
                  ) : (
                    <label className="flex h-[42px] w-fit cursor-pointer items-center rounded-[6px] border border-dashed border-black/25 px-3 text-[11px] text-grey-500 hover:border-black">
                      {uploadingCategory === key ? 'Uploading…' : '+ Photo'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="hidden"
                        onChange={onUploadConditionPhoto(key)}
                        disabled={Boolean(uploadingCategory)}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[8px] border border-black/10 bg-white p-6">
          <h2 className="text-[16px] font-bold">Images</h2>
          {!isEdit ? (
            <p className="mt-2 text-[13px] text-grey-500">Save the product first, then add images.</p>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-3">
                {existing?.product?.images.filter((img) => !img.conditionCategory).map((img) => (
                  <div key={img.id} className="relative w-[140px]">
                    <img
                      src={img.url}
                      alt={img.altText || ''}
                      className="h-[140px] w-[140px] rounded-[6px] border border-black/10 object-cover"
                    />
                    {img.isPrimary && (
                      <span className="absolute left-1 top-1 rounded-full bg-green px-2 py-[2px] text-[9px] font-bold text-black">
                        PRIMARY
                      </span>
                    )}
                    <div className="mt-1 flex gap-1">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => makePrimary(img.id)}
                          className="flex-1 rounded-[4px] border border-black/15 py-1 text-[10px] hover:border-black"
                        >
                          Make primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="rounded-[4px] border border-red-200 px-2 text-[10px] text-red-600 hover:bg-red-50"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <label className="flex h-[140px] w-[140px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[6px] border border-dashed border-black/25 text-[12px] text-grey-500 hover:border-black">
                  {uploading ? `Uploading ${typeof uploading === 'string' ? uploading : ''}…` : '+ Upload'}
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={onUpload}
                    disabled={Boolean(uploading)}
                  />
                </label>
              </div>
              <p className="mt-2 text-[11px] text-grey-500">
                JPEG, PNG, WebP or AVIF, up to 5MB each. Select multiple files to upload them all at once.
              </p>
            </>
          )}
        </section>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-black px-6 py-[14px] text-[14px] font-bold text-off-white hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </button>
          {isEdit && existing?.product && (
            <span className="text-[12px] text-grey-500">
              Total value in stock: {formatPrice(existing.product.totalStock * (existing.product.minPrice || 0))}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
