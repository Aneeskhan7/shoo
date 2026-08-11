import { z } from 'zod';
import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import { sendOrderStatusEmail } from '../lib/orderEmails.js';

const STATUS_EMAIL_FIELD = { SHIPPED: 'shippedEmailSentAt', DELIVERED: 'deliveredEmailSentAt' };

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

// Forward flow, plus a cancel/refund exit at the points that still make
// business sense. Terminal states have no further moves.
const TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

const listQuery = z.object({
  q: z.string().trim().optional(),
  status: z.enum(['all', ...ORDER_STATUSES]).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const orderListSelect = {
  id: true,
  orderNumber: true,
  status: true,
  paymentMethod: true,
  paymentStatus: true,
  total: true,
  createdAt: true,
  userId: true,
  guestEmail: true,
  user: { select: { firstName: true, lastName: true, email: true } },
  address: { select: { firstName: true, lastName: true, phone: true } },
  items: { select: { quantity: true } },
};

const shapeListRow = (o) => ({
  id: o.id,
  orderNumber: o.orderNumber,
  status: o.status,
  paymentMethod: o.paymentMethod,
  paymentStatus: o.paymentStatus,
  total: o.total,
  createdAt: o.createdAt,
  customerName: o.user ? `${o.user.firstName} ${o.user.lastName}` : `${o.address.firstName} ${o.address.lastName}`,
  email: o.user?.email || o.guestEmail,
  phone: o.address.phone,
  itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
});

/** GET /api/admin/orders */
export const listAdminOrders = asyncHandler(async (req, res) => {
  const f = listQuery.parse(req.query);

  const where = {
    ...(f.status !== 'all' ? { status: f.status } : {}),
    ...(f.q
      ? {
          OR: [
            { orderNumber: { contains: f.q, mode: 'insensitive' } },
            { guestEmail: { contains: f.q, mode: 'insensitive' } },
            { user: { email: { contains: f.q, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select: orderListSelect,
      orderBy: { createdAt: 'desc' },
      skip: (f.page - 1) * f.limit,
      take: f.limit,
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    orders: rows.map(shapeListRow),
    pagination: { page: f.page, limit: f.limit, total, pages: Math.ceil(total / f.limit) || 1 },
  });
});

/** GET /api/admin/orders/:id — full detail, nothing hidden from staff. */
export const getAdminOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      items: true,
      address: true,
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ order });
});

const statusInput = z.object({ status: z.enum(ORDER_STATUSES) });

/**
 * PATCH /api/admin/orders/:id/status
 *
 * Cancelling restores inventory exactly once: the transaction re-reads the
 * order's CURRENT status from the DB (not a value trusted from the request)
 * and only restores stock on a genuine …→CANCELLED move, so double-cancelling
 * — which TRANSITIONS already forbids since CANCELLED has no outgoing moves —
 * can't double-restore even under a race.
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status: nextStatus } = statusInput.parse(req.body);
  const { id } = req.params;

  let didTransition = false;

  const order = await prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!current) throw new ApiError(404, 'Order not found');

    if (current.status === nextStatus) return current; // no-op, not an error

    const allowed = TRANSITIONS[current.status] || [];
    if (!allowed.includes(nextStatus)) {
      throw new ApiError(
        400,
        `Cannot move an order from ${current.status} to ${nextStatus}. Allowed next steps: ${
          allowed.join(', ') || 'none — this is a final status'
        }.`,
      );
    }

    if (nextStatus === 'CANCELLED') {
      for (const item of current.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    didTransition = true;

    return tx.order.update({
      where: { id },
      data: { status: nextStatus },
      include: { items: true, address: true, user: { select: { firstName: true, lastName: true, email: true } } },
    });
  });

  res.json({ order });

  // Fire-and-forget, after the response is sent — a Resend hiccup must never
  // fail the admin's status update. Guarded by the per-status *EmailSentAt
  // timestamp so the same order can never get a duplicate SHIPPED/DELIVERED email.
  const emailField = STATUS_EMAIL_FIELD[nextStatus];
  if (didTransition && emailField && !order[emailField]) {
    sendOrderStatusEmail(order, nextStatus)
      .then((result) => {
        if (result.sent) {
          return prisma.order.update({ where: { id: order.id }, data: { [emailField]: new Date() } });
        }
        console.error(`[order-email] ${nextStatus} email not sent for ${order.orderNumber}: ${result.reason}`);
      })
      .catch((err) => console.error(`[order-email] ${nextStatus} email failed for ${order.orderNumber}:`, err));
  }
});
