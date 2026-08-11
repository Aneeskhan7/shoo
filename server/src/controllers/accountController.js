import { z } from 'zod';
import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Member-only routes. Everything here sits behind requireAuth — nothing in the
 * shopping or checkout path depends on any of it.
 */

// ─── Profile ────────────────────────────────────────────────
const profileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

export const getProfile = asyncHandler(async (req, res) => {
  const [orders, wishlist, addresses] = await Promise.all([
    prisma.order.count({ where: { userId: req.user.id } }),
    prisma.wishlistItem.count({ where: { userId: req.user.id } }),
    prisma.address.count({ where: { userId: req.user.id } }),
  ]);
  res.json({ user: req.user, counts: { orders, wishlist, addresses } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = profileSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });
  res.json({ user });
});

// ─── Saved addresses ────────────────────────────────────────
const addressSchema = z.object({
  label: z.string().min(1).default('Home'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(6, 'A phone number is required for cash on delivery'),
  street: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  isDefault: z.boolean().optional(),
});

export const listAddresses = asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  });
  res.json({ addresses });
});

export const createAddress = asyncHandler(async (req, res) => {
  const data = addressSchema.parse(req.body);
  const existing = await prisma.address.count({ where: { userId: req.user.id } });
  // First saved address is the default; later ones only if asked.
  const isDefault = data.isDefault ?? existing === 0;

  const address = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }
    return tx.address.create({ data: { ...data, isDefault, userId: req.user.id } });
  });

  res.status(201).json({ address });
});

const ownAddress = async (userId, id) => {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) throw new ApiError(404, 'Address not found');
  return address;
};

export const updateAddress = asyncHandler(async (req, res) => {
  await ownAddress(req.user.id, req.params.id);
  const data = addressSchema.partial().parse(req.body);

  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    return tx.address.update({ where: { id: req.params.id }, data });
  });

  res.json({ address });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  await ownAddress(req.user.id, req.params.id);
  // Addresses are referenced by orders, so detach rather than destroy history.
  const used = await prisma.order.count({ where: { addressId: req.params.id } });
  if (used > 0) {
    await prisma.address.update({ where: { id: req.params.id }, data: { userId: null } });
  } else {
    await prisma.address.delete({ where: { id: req.params.id } });
  }
  res.json({ ok: true });
});

// ─── Wishlist ───────────────────────────────────────────────
const productShape = {
  id: true,
  name: true,
  slug: true,
  tagline: true,
  variants: { select: { price: true, stock: true, colorName: true, colorHex: true } },
};

export const listWishlist = asyncHandler(async (req, res) => {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId: req.user.id },
    orderBy: { addedAt: 'desc' },
    include: { product: { select: productShape } },
  });

  const items = rows.map((r) => {
    const prices = r.product.variants.map((v) => Number(v.price));
    return {
      id: r.id,
      addedAt: r.addedAt,
      product: {
        id: r.product.id,
        name: r.product.name,
        slug: r.product.slug,
        tagline: r.product.tagline,
        minPrice: prices.length ? Math.min(...prices) : null,
        inStock: r.product.variants.some((v) => v.stock > 0),
        colors: [
          ...new Map(r.product.variants.map((v) => [v.colorName, v.colorHex])).entries(),
        ].map(([name, hex]) => ({ name, hex })),
      },
    };
  });

  res.json({ items });
});

export const addWishlist = asyncHandler(async (req, res) => {
  const { productId } = z.object({ productId: z.string().uuid() }).parse(req.body);
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new ApiError(404, 'Product not found');

  // Idempotent — adding twice is a no-op rather than a 409.
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: req.user.id, productId } },
    create: { userId: req.user.id, productId },
    update: {},
  });
  res.status(201).json({ ok: true });
});

export const removeWishlist = asyncHandler(async (req, res) => {
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.user.id, productId: req.params.productId },
  });
  res.json({ ok: true });
});

// ─── Order history ──────────────────────────────────────────
export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
  res.json({ orders });
});

export const getMyOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber: req.params.orderNumber },
    include: { items: true, address: true },
  });
  if (!order || order.userId !== req.user.id) throw new ApiError(404, 'Order not found');
  res.json({ order });
});
