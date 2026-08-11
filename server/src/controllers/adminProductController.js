import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import { UPLOAD_DIR } from '../lib/upload.js';
import { uploadProductImageToCloudinary, deleteCloudinaryImage } from '../lib/cloudinary.js';

/**
 * Removes one image's underlying file — Cloudinary if it has a publicId
 * (every image uploaded after the Cloudinary migration), local disk
 * otherwise (anything uploaded before it). Best-effort: a missing/already-
 * gone remote asset must never block the DB row from being deleted.
 */
function removeImageFile(image) {
  if (image.publicId) {
    deleteCloudinaryImage(image.publicId).catch(() => {});
  } else {
    fs.unlink(path.join(UPLOAD_DIR, path.basename(image.url)), () => {});
  }
}

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Appends -2, -3… until the slug is free. Small catalogue — a loop is fine. */
async function uniqueSlug(base, excludeId) {
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${n++}`;
  }
}

const productInclude = {
  brand: { select: { id: true, name: true, slug: true } },
  category: { select: { id: true, name: true, slug: true } },
  variants: true,
  images: { orderBy: { position: 'asc' } },
  tags: { select: { tag: true } },
  conditionItems: true,
};

// ─── Thrift condition ───────────────────────────────────────
const CONDITION_CATEGORIES = [
  'OUTSOLE',
  'HEEL_WEAR',
  'TOE_BOX',
  'CREASES',
  'SCRATCHES',
  'STAINS',
  'LABELS',
  'DEFECTS',
];
const WEAR_STATUSES = ['NONE', 'MINIMAL', 'LIGHT', 'MODERATE', 'HEAVY'];
const DEFECT_STATUSES = ['NONE', 'PRESENT'];

const conditionItemInput = z
  .object({
    category: z.enum(CONDITION_CATEGORIES),
    status: z.enum([...WEAR_STATUSES, ...DEFECT_STATUSES]),
    note: z.string().trim().max(500).optional().nullable(),
  })
  .superRefine((item, ctx) => {
    // LABELS and DEFECTS are presence checks ("is the original label still
    // there / is there a defect"), not a wear gradient — the rest use the
    // 5-point wear scale.
    const allowed = ['DEFECTS', 'LABELS'].includes(item.category) ? DEFECT_STATUSES : WEAR_STATUSES;
    if (!allowed.includes(item.status)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${item.category} only accepts: ${allowed.join(', ')}`,
        path: ['status'],
      });
    }
  });

const sizeValue = (size) => parseFloat(String(size).replace(/[^\d.]/g, '')) || 0;

const shape = (p) => {
  const stocks = p.variants.map((v) => v.stock);
  const totalStock = stocks.reduce((a, b) => a + b, 0);
  return {
    ...p,
    tags: p.tags.map((t) => t.tag),
    variants: [...p.variants].sort((a, b) => sizeValue(a.size) - sizeValue(b.size)),
    totalStock,
    soldOut: stocks.length > 0 && stocks.every((s) => s === 0),
    minPrice: p.variants.length ? Math.min(...p.variants.map((v) => Number(v.price))) : null,
    maxPrice: p.variants.length ? Math.max(...p.variants.map((v) => Number(v.price))) : null,
  };
};

const listQuery = z.object({
  q: z.string().trim().optional(),
  stockStatus: z.enum(['all', 'in-stock', 'low', 'sold-out']).default('all'),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  sort: z.enum(['newest', 'name', 'stock-asc', 'stock-desc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const LOW_STOCK_THRESHOLD = 5;

/** GET /api/admin/meta — brand/category id lists for the product form's
 *  dropdowns. Separate from the public /products/filters endpoint (which
 *  deliberately omits ids) rather than changing that response shape. */
export const getProductMeta = asyncHandler(async (_req, res) => {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } }),
    prisma.category.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } }),
  ]);
  res.json({ brands, categories, genders: ['MEN', 'WOMEN', 'KIDS', 'UNISEX'] });
});

/** GET /api/admin/products — admin sees every product, active or not. */
export const listAdminProducts = asyncHandler(async (req, res) => {
  const f = listQuery.parse(req.query);

  const where = {
    ...(f.status === 'active' ? { isActive: true } : {}),
    ...(f.status === 'inactive' ? { isActive: false } : {}),
    ...(f.q
      ? {
          OR: [
            { name: { contains: f.q, mode: 'insensitive' } },
            { slug: { contains: f.q, mode: 'insensitive' } },
            { brand: { name: { contains: f.q, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const orderBy = { newest: { createdAt: 'desc' }, name: { name: 'asc' } }[f.sort] ?? {
    createdAt: 'desc',
  };

  const rows = await prisma.product.findMany({ where, include: productInclude, orderBy });
  let products = rows.map(shape);

  if (f.stockStatus === 'sold-out') products = products.filter((p) => p.soldOut);
  if (f.stockStatus === 'in-stock') products = products.filter((p) => !p.soldOut && p.totalStock > LOW_STOCK_THRESHOLD);
  if (f.stockStatus === 'low')
    products = products.filter((p) => !p.soldOut && p.totalStock > 0 && p.totalStock <= LOW_STOCK_THRESHOLD);

  if (f.sort === 'stock-asc') products.sort((a, b) => a.totalStock - b.totalStock);
  if (f.sort === 'stock-desc') products.sort((a, b) => b.totalStock - a.totalStock);

  const total = products.length;
  const start = (f.page - 1) * f.limit;
  products = products.slice(start, start + f.limit);

  res.json({
    products,
    pagination: { page: f.page, limit: f.limit, total, pages: Math.ceil(total / f.limit) || 1 },
  });
});

export const getAdminProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: productInclude,
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ product: shape(product) });
});

const variantInput = z
  .object({
    // Present = update this existing variant; absent = create a new one.
    id: z.string().uuid().optional(),
    size: z.string().trim().min(1, 'Size is required'),
    colorName: z.string().trim().min(1, 'Color name is required'),
    colorHex: z
      .string()
      .trim()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a hex value like #0A0A0A'),
    price: z.number().nonnegative('Price cannot be negative'),
    // Thrift stock: each size/color is a single physical pair — 0 (sold) or
    // 1 (available), never a bulk quantity.
    stock: z.number().int().min(0).max(1, 'Each size/color is a single pair — stock is 0 or 1'),
  })
  .strict();

const productInput = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens')
    .optional(),
  description: z.string().trim().max(4000).optional().nullable(),
  story: z.string().trim().max(4000).optional().nullable(),
  tagline: z.string().trim().max(200).optional().nullable(),
  brandId: z.string().uuid('Select a brand'),
  categoryId: z.string().uuid('Select a category'),
  gender: z.enum(['MEN', 'WOMEN', 'KIDS', 'UNISEX']).default('UNISEX'),
  silhouette: z.string().trim().max(60).optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string().trim().min(1)).default([]),
  variants: z.array(variantInput).default([]),
  conditions: z.array(conditionItemInput).default([]),
});

/** No two condition rows may claim the same category — the form always
 * submits at most one per category, but this is never trusted from the client. */
function assertNoDuplicateConditions(conditions) {
  const seen = new Set();
  for (const c of conditions) {
    if (seen.has(c.category)) throw new ApiError(400, `Duplicate condition category: ${c.category}`);
    seen.add(c.category);
  }
}

/** No two variants of the same product may share a size+color combo. */
function assertNoDuplicateVariants(variants) {
  const seen = new Set();
  for (const v of variants) {
    const key = `${v.size}::${v.colorName}`.toLowerCase();
    if (seen.has(key)) {
      throw new ApiError(400, `Duplicate variant: ${v.colorName} / ${v.size}`);
    }
    seen.add(key);
  }
}

const skuFor = (slug, v) =>
  `${slug}-${v.colorName}-${v.size}`.toUpperCase().replace(/[^A-Z0-9]+/g, '-');

/** POST /api/admin/products */
export const createProduct = asyncHandler(async (req, res) => {
  const body = productInput.parse(req.body);
  assertNoDuplicateVariants(body.variants);
  assertNoDuplicateConditions(body.conditions);

  const slug = await uniqueSlug(body.slug ? slugify(body.slug) : slugify(body.name));

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug,
      description: body.description || null,
      story: body.story || null,
      tagline: body.tagline || null,
      brandId: body.brandId,
      categoryId: body.categoryId,
      gender: body.gender,
      silhouette: body.silhouette || null,
      isActive: body.isActive,
      isFeatured: body.isFeatured,
      tags: { create: body.tags.map((tag) => ({ tag })) },
      variants: {
        create: body.variants.map(({ id: _id, ...v }) => ({ ...v, sku: skuFor(slug, v) })),
      },
      conditionItems: {
        create: body.conditions.map((c) => ({ category: c.category, status: c.status, note: c.note || null })),
      },
    },
    include: productInclude,
  });

  res.status(201).json({ product: shape(product) });
});

/**
 * PUT /api/admin/products/:id — full replace of editable fields. Variants and
 * tags are replaced wholesale (delete + recreate) rather than diffed: this is
 * an admin form submitting its whole current state, not a patch, so there's
 * no risk of clobbering fields the request didn't mention — it mentions all
 * of them by design. Order history is untouched either way since OrderItem
 * snapshots product/variant data at purchase time rather than referencing it live.
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Product not found');

  const body = productInput.parse(req.body);
  assertNoDuplicateVariants(body.variants);
  assertNoDuplicateConditions(body.conditions);

  const slug = body.slug
    ? await uniqueSlug(slugify(body.slug), id)
    : existing.slug;

  const product = await prisma.$transaction(async (tx) => {
    await tx.productTag.deleteMany({ where: { productId: id } });

    // Same wholesale-replace pattern as tags: the form submits its full
    // current state for all 8 categories every save.
    await tx.productConditionItem.deleteMany({ where: { productId: id } });
    if (body.conditions.length) {
      await tx.productConditionItem.createMany({
        data: body.conditions.map((c) => ({
          productId: id,
          category: c.category,
          status: c.status,
          note: c.note || null,
        })),
      });
    }

    // Existing variants not present in the submitted list are removed —
    // guarded the same way product delete is: a variant that's already on an
    // order can't be deleted (OrderItem.variantId has no cascade), so this
    // surfaces as a clear 409 rather than a raw Prisma error.
    const currentVariantIds = new Set(
      (await tx.productVariant.findMany({ where: { productId: id }, select: { id: true } })).map(
        (v) => v.id,
      ),
    );
    const submittedIds = new Set(body.variants.filter((v) => v.id).map((v) => v.id));
    const toDelete = [...currentVariantIds].filter((vid) => !submittedIds.has(vid));
    if (toDelete.length) {
      const inUse = await tx.orderItem.count({ where: { variantId: { in: toDelete } } });
      if (inUse > 0) {
        throw new ApiError(
          409,
          'One or more removed sizes/colors already have order history — deactivate the product instead of deleting those variants.',
        );
      }
      await tx.productVariant.deleteMany({ where: { id: { in: toDelete } } });
    }

    for (const v of body.variants) {
      if (v.id && currentVariantIds.has(v.id)) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: { size: v.size, colorName: v.colorName, colorHex: v.colorHex, price: v.price, stock: v.stock },
        });
      } else {
        const { id: _id, ...rest } = v;
        await tx.productVariant.create({
          data: { ...rest, productId: id, sku: skuFor(slug, v) },
        });
      }
    }

    return tx.product.update({
      where: { id },
      data: {
        name: body.name,
        slug,
        description: body.description || null,
        story: body.story || null,
        tagline: body.tagline || null,
        brandId: body.brandId,
        categoryId: body.categoryId,
        gender: body.gender,
        silhouette: body.silhouette || null,
        isActive: body.isActive,
        isFeatured: body.isFeatured,
        tags: { create: body.tags.map((tag) => ({ tag })) },
      },
      include: productInclude,
    });
  });

  res.json({ product: shape(product) });
});

/** DELETE /api/admin/products/:id */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new ApiError(404, 'Product not found');

  const orderCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderCount > 0) {
    throw new ApiError(
      409,
      'This product has order history and cannot be deleted. Deactivate it instead (set it inactive) to keep past orders intact.',
    );
  }

  // Images aren't referenced by anything else once the row is gone.
  const images = await prisma.productImage.findMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } }); // variants/images/tags cascade
  images.forEach(removeImageFile);

  res.status(204).end();
});

// ─── Images ───────────────────────────────────────────────────

const conditionCategoryInput = z.enum(CONDITION_CATEGORIES).optional();

/** POST /api/admin/products/:id/images (multipart, field name "image")
 *  Optional "conditionCategory" field tags the shot as a thrift-condition
 *  close-up (outsole, heel, etc.) instead of a regular gallery photo — same
 *  Cloudinary upload, same ProductImage row, just tagged. A condition photo
 *  never counts toward gallery position or becomes the primary image. */
export const uploadProductImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new ApiError(404, 'Product not found');
  if (!req.file) throw new ApiError(400, 'No image file was uploaded');

  const conditionCategory = conditionCategoryInput.parse(req.body.conditionCategory || undefined) ?? null;

  let result;
  try {
    result = await uploadProductImageToCloudinary(req.file.buffer, req.file.mimetype, {
      slug: product.slug,
    });
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    throw new ApiError(502, 'Could not upload the image. Please try again.');
  }

  const galleryCount = conditionCategory
    ? 0
    : await prisma.productImage.count({ where: { productId: id, conditionCategory: null } });
  const image = await prisma.productImage.create({
    data: {
      productId: id,
      url: result.secure_url,
      publicId: result.public_id,
      altText: req.body.altText || product.name,
      colorName: req.body.colorName || null,
      conditionCategory,
      position: galleryCount,
      isPrimary: !conditionCategory && galleryCount === 0,
    },
  });

  res.status(201).json({ image });
});

/** DELETE /api/admin/products/:id/images/:imageId */
export const deleteProductImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image || image.productId !== id) throw new ApiError(404, 'Image not found');

  await prisma.productImage.delete({ where: { id: imageId } });
  removeImageFile(image);

  // If the primary image was removed, promote the next one so the product
  // never ends up with zero primary images while it still has photos.
  if (image.isPrimary) {
    const next = await prisma.productImage.findFirst({
      where: { productId: id, conditionCategory: null },
      orderBy: { position: 'asc' },
    });
    if (next) await prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
  }

  res.status(204).end();
});

/** PATCH /api/admin/products/:id/images/:imageId/primary */
export const setPrimaryImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image || image.productId !== id) throw new ApiError(404, 'Image not found');
  if (image.conditionCategory) {
    throw new ApiError(400, 'A condition close-up cannot be the product\'s primary image');
  }

  await prisma.$transaction([
    prisma.productImage.updateMany({ where: { productId: id }, data: { isPrimary: false } }),
    prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);

  res.json({ ok: true });
});
