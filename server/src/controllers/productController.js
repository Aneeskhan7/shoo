import { z } from 'zod';
import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

const listQuery = z.object({
  q: z.string().trim().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  gender: z.enum(['MEN', 'WOMEN', 'KIDS', 'UNISEX']).optional(),
  silhouette: z.string().optional(),
  size: z.string().optional(), // "US 9" or "US 9,US 10"
  color: z.string().optional(),
  tag: z.string().optional(),
  // "Recently Viewed" on the PDP needs a handful of specific products by
  // slug rather than a filtered page — same csv() convention as size/color/
  // brand/tag above, so it's just another where-clause branch, not a new
  // endpoint.
  slugs: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  // In-stock-only toggle. z.coerce.boolean() would treat the string "false"
  // as truthy, so this reads the literal value instead.
  available: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'featured', 'name']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

const csv = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : undefined);

const productInclude = {
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  // Insertion order, so the first colourway stays the primary one. Sizes are
  // sorted numerically in shape() — "US 10" sorts before "US 7" as a string.
  variants: true,
  images: { orderBy: { position: 'asc' } },
  tags: { select: { tag: true } },
};

// A grid card only ever renders images[0] (see getProductImage() /
// ProductImage.jsx's default index=0) — shipping the product's full
// gallery (every angle, every condition-report close-up) to every card on
// a 48-product listing page is pure unused payload. This variant caps it
// at the one photo a card can actually show, and excludes condition
// close-ups outright (client already filters them, but there's no reason
// to ship them at all here). Only for list-shaped responses — getProduct's
// primary product keeps the full `productInclude` gallery, since the PDP's
// thumbnail rail and condition report need every image.
const cardProductInclude = {
  ...productInclude,
  images: {
    where: { conditionCategory: null },
    orderBy: { position: 'asc' },
    take: 1,
    select: { id: true, url: true, altText: true },
  },
};

const sizeValue = (size) => parseFloat(String(size).replace(/[^\d.]/g, '')) || 0;

/** Flattens variants into the price range + swatch list the cards and PLP need. */
const shape = (p) => {
  const prices = p.variants.map((v) => Number(v.price));
  const colors = [...new Map(p.variants.map((v) => [v.colorName, v.colorHex])).entries()].map(
    ([name, hex]) => ({ name, hex }),
  );
  const colorRank = new Map(colors.map((c, i) => [c.name, i]));

  const variants = [...p.variants].sort(
    (a, b) =>
      colorRank.get(a.colorName) - colorRank.get(b.colorName) ||
      sizeValue(a.size) - sizeValue(b.size),
  );

  const stocks = p.variants.map((v) => v.stock);
  const inStock = stocks.some((s) => s > 0);
  // Every size/color is its own physical thrift pair — AVAILABLE only while
  // none have sold, LIMITED once some (but not all) have, SOLD_OUT once
  // every pair under this listing is gone.
  const stockStatus = !inStock ? 'SOLD_OUT' : stocks.every((s) => s > 0) ? 'AVAILABLE' : 'LIMITED';

  // Discount badge follows the same variant minPrice picks — the cheapest
  // variant's compareAtPrice, when it's actually higher than what it charges.
  const cheapest = p.variants.length
    ? p.variants.reduce((a, b) => (Number(a.price) <= Number(b.price) ? a : b))
    : null;
  const discountPercent =
    cheapest?.compareAtPrice && Number(cheapest.compareAtPrice) > Number(cheapest.price)
      ? Math.round((1 - Number(cheapest.price) / Number(cheapest.compareAtPrice)) * 100)
      : 0;

  return {
    ...p,
    variants,
    tags: p.tags.map((t) => t.tag),
    colors,
    sizes: [...new Set(variants.map((v) => v.size))].sort((a, b) => sizeValue(a) - sizeValue(b)),
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    compareAtPrice: discountPercent > 0 ? Number(cheapest.compareAtPrice) : null,
    discountPercent,
    inStock,
    stockStatus,
  };
};

export const listProducts = asyncHandler(async (req, res) => {
  const f = listQuery.parse(req.query);

  const variantFilter = {};
  if (csv(f.size)) variantFilter.size = { in: csv(f.size) };
  if (csv(f.color)) variantFilter.colorName = { in: csv(f.color) };
  if (f.minPrice != null || f.maxPrice != null) {
    variantFilter.price = {
      ...(f.minPrice != null ? { gte: f.minPrice } : {}),
      ...(f.maxPrice != null ? { lte: f.maxPrice } : {}),
    };
  }
  // A size only counts as "available" if that exact size actually has
  // stock — otherwise a sold-out size would still match the filter. Same
  // stock requirement powers the explicit "in stock only" toggle; both
  // fold into the same variant match so "size 9, in stock" means one
  // variant satisfying both, not two different variants each satisfying one.
  if (csv(f.size) || f.available) variantFilter.stock = { gt: 0 };

  const where = {
    isActive: true,
    ...(csv(f.slugs) ? { slug: { in: csv(f.slugs) } } : {}),
    ...(f.gender ? { gender: f.gender } : {}),
    ...(csv(f.silhouette) ? { silhouette: { in: csv(f.silhouette) } } : {}),
    ...(csv(f.category) ? { category: { slug: { in: csv(f.category) } } } : {}),
    ...(csv(f.brand) ? { brand: { slug: { in: csv(f.brand) } } } : {}),
    ...(csv(f.tag) ? { tags: { some: { tag: { in: csv(f.tag) } } } } : {}),
    ...(Object.keys(variantFilter).length ? { variants: { some: variantFilter } } : {}),
    ...(f.q
      ? {
          OR: [
            { name: { contains: f.q, mode: 'insensitive' } },
            { description: { contains: f.q, mode: 'insensitive' } },
            { tagline: { contains: f.q, mode: 'insensitive' } },
            { brand: { name: { contains: f.q, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const orderBy = {
    newest: { createdAt: 'desc' },
    name: { name: 'asc' },
    featured: { isFeatured: 'desc' },
    'price-asc': { createdAt: 'desc' },
    'price-desc': { createdAt: 'desc' },
  }[f.sort];

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: cardProductInclude,
      orderBy,
      // Price sorts are resolved after shaping, since price lives on variants.
      ...(f.sort.startsWith('price')
        ? {}
        : { skip: (f.page - 1) * f.limit, take: f.limit }),
    }),
    prisma.product.count({ where }),
  ]);

  let products = rows.map(shape);
  if (f.sort === 'price-asc') products.sort((a, b) => a.minPrice - b.minPrice);
  if (f.sort === 'price-desc') products.sort((a, b) => b.minPrice - a.minPrice);
  if (f.sort.startsWith('price')) {
    products = products.slice((f.page - 1) * f.limit, f.page * f.limit);
  }

  res.json({
    products,
    pagination: {
      page: f.page,
      limit: f.limit,
      total,
      pages: Math.ceil(total / f.limit) || 1,
    },
  });
});

export const featuredProducts = asyncHandler(async (req, res) => {
  const take = Math.min(Number(req.query.limit) || 8, 24);
  const rows = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: cardProductInclude,
    orderBy: { createdAt: 'desc' },
    take,
  });
  res.json({ products: rows.map(shape) });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: {
      ...productInclude,
      reviews: { orderBy: { createdAt: 'desc' } },
      conditionItems: true,
    },
  });
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');

  const ratings = product.reviews.map((r) => r.rating);
  const related = await prisma.product.findMany({
    where: { isActive: true, categoryId: product.categoryId, NOT: { id: product.id } },
    include: cardProductInclude,
    take: 4,
  });

  res.json({
    product: {
      ...shape(product),
      rating: ratings.length
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null,
      reviewCount: ratings.length,
    },
    related: related.map(shape),
  });
});

/** Powers the 3D grid's silhouette filter without shipping every variant. */
export const listSilhouettes = asyncHandler(async (_req, res) => {
  const rows = await prisma.product.findMany({
    where: { isActive: true, silhouette: { not: null } },
    select: { silhouette: true },
    distinct: ['silhouette'],
  });
  res.json({ silhouettes: rows.map((r) => r.silhouette) });
});

export const listFilters = asyncHandler(async (_req, res) => {
  const [brands, categories, variants] = await Promise.all([
    prisma.brand.findMany({ select: { name: true, slug: true }, orderBy: { name: 'asc' } }),
    prisma.category.findMany({ select: { name: true, slug: true }, orderBy: { name: 'asc' } }),
    prisma.productVariant.findMany({ select: { size: true, colorName: true, colorHex: true, price: true } }),
  ]);

  const prices = variants.map((v) => Number(v.price));
  res.json({
    brands,
    categories,
    sizes: [...new Set(variants.map((v) => v.size))].sort((a, b) => sizeValue(a) - sizeValue(b)),
    colors: [...new Map(variants.map((v) => [v.colorName, v.colorHex])).entries()].map(
      ([name, hex]) => ({ name, hex }),
    ),
    genders: ['MEN', 'WOMEN', 'KIDS', 'UNISEX'],
    priceRange: { min: Math.min(...prices, 0), max: Math.max(...prices, 0) },
  });
});
