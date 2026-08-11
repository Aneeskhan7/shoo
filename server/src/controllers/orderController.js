import { z } from 'zod';
import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import { priceCart, generateOrderNumber } from '../lib/pricing.js';
import { sendOrderConfirmationEmail } from '../lib/orderEmails.js';

const lineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
});

const createSchema = z.object({
  items: z.array(lineSchema).min(1, 'Your cart is empty'),
  email: z.string().email(),
  shippingMethod: z.enum(['STANDARD', 'EXPRESS', 'NEXT_DAY']).default('STANDARD'),
  // Card and Bank render in the UI but are not accepted — see plan Stage B.
  paymentMethod: z.enum(['COD', 'CARD', 'BANK']).default('COD'),
  promoCode: z.string().trim().optional(),
  notes: z.string().max(500).optional(),
  address: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().min(6, 'A phone number is required for cash on delivery'),
    street: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
});

const loadVariants = (ids) =>
  prisma.productVariant.findMany({
    where: { id: { in: ids } },
    include: { product: { select: { id: true, name: true, slug: true } } },
  });

/** POST /api/cart/validate — re-prices a client-side cart against the database. */
export const validateCart = asyncHandler(async (req, res) => {
  const { items, shippingMethod, promoCode } = z
    .object({
      items: z.array(lineSchema),
      shippingMethod: z.enum(['STANDARD', 'EXPRESS', 'NEXT_DAY']).default('STANDARD'),
      promoCode: z.string().trim().optional(),
    })
    .parse(req.body);

  if (!items.length) {
    return res.json({
      items: [],
      subtotal: 0,
      discount: 0,
      shippingCost: 0,
      tax: 0,
      total: 0,
      promoCode: null,
    });
  }

  const variants = await loadVariants(items.map((i) => i.variantId));
  const promo = promoCode
    ? await prisma.promoCode.findUnique({ where: { code: promoCode.toUpperCase() } })
    : null;
  if (promoCode && !promo) throw new ApiError(400, 'That promo code is not valid');

  res.json(priceCart({ lines: items, variants, shippingMethod, promo }));
});

export const createOrder = asyncHandler(async (req, res) => {
  const body = createSchema.parse(req.body);

  if (body.paymentMethod !== 'COD') {
    throw new ApiError(
      400,
      'Only Cash on Delivery is available right now. Card and bank payments are coming soon.',
    );
  }

  const order = await prisma.$transaction(async (tx) => {
    const variants = await tx.productVariant.findMany({
      where: { id: { in: body.items.map((i) => i.variantId) } },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });

    const promo = body.promoCode
      ? await tx.promoCode.findUnique({ where: { code: body.promoCode.toUpperCase() } })
      : null;
    if (body.promoCode && !promo) throw new ApiError(400, 'That promo code is not valid');

    // Every money value is recomputed here from database rows.
    const priced = priceCart({
      lines: body.items,
      variants,
      shippingMethod: body.shippingMethod,
      promo,
    });

    const address = await tx.address.create({
      data: { ...body.address, userId: req.user?.id ?? null },
    });

    // Conditional decrement: `stock: { gte }` makes the update a no-op under a
    // concurrent order, and count 0 aborts the whole transaction.
    for (const item of priced.items) {
      const { count } = await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (count === 0) throw new ApiError(400, `${item.productName} just sold out`);
    }

    if (promo) {
      await tx.promoCode.update({
        where: { id: promo.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    return tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user?.id ?? null,
        guestEmail: req.user ? null : body.email,
        guestPhone: req.user ? null : body.address.phone,
        addressId: address.id,
        status: 'PENDING',
        paymentMethod: 'COD',
        paymentStatus: 'UNPAID',
        shippingLabel: priced.shippingLabel,
        subtotal: priced.subtotal,
        discount: priced.discount,
        shippingCost: priced.shippingCost,
        tax: priced.tax,
        total: priced.total,
        promoCode: priced.promoCode,
        notes: body.notes,
        items: {
          create: priced.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            productName: i.productName,
            productSlug: i.slug,
            size: i.size,
            colorName: i.colorName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.total,
          })),
        },
      },
      include: { items: true, address: true },
    });
  });

  res.status(201).json({ order });

  // Fire-and-forget, after the response is already sent: the order is placed
  // either way, and a Resend hiccup must never fail checkout. Guarded by
  // confirmationEmailSentAt so this order's confirmation can never double-send.
  if (!order.confirmationEmailSentAt) {
    const email = req.user?.email ?? body.email;
    sendOrderConfirmationEmail(order, email)
      .then((result) => {
        if (result.sent) {
          return prisma.order.update({
            where: { id: order.id },
            data: { confirmationEmailSentAt: new Date() },
          });
        }
        console.error(`[order-email] confirmation not sent for ${order.orderNumber}: ${result.reason}`);
      })
      .catch((err) => console.error(`[order-email] confirmation failed for ${order.orderNumber}:`, err));
  }
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber: req.params.orderNumber },
    include: { items: true, address: true },
  });
  if (!order) throw new ApiError(404, 'Order not found');

  // A guest order is only readable by someone who knows the matching email.
  if (!order.userId) {
    const email = String(req.query.email || '').toLowerCase();
    if (!email || email !== order.guestEmail?.toLowerCase()) {
      throw new ApiError(403, 'Provide the email used to place this order');
    }
  } else if (order.userId !== req.user?.id) {
    throw new ApiError(403, 'You do not have access to this order');
  }

  res.json({ order });
});
