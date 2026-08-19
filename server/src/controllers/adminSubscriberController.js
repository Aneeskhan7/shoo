import { z } from 'zod';
import prisma from '../config/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const listQuery = z.object({
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

/** GET /api/admin/subscribers */
export const listAdminSubscribers = asyncHandler(async (req, res) => {
  const f = listQuery.parse(req.query);
  const where = f.q ? { email: { contains: f.q, mode: 'insensitive' } } : {};

  const [rows, total] = await Promise.all([
    prisma.subscriber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (f.page - 1) * f.limit,
      take: f.limit,
    }),
    prisma.subscriber.count({ where }),
  ]);

  res.json({
    subscribers: rows,
    pagination: { page: f.page, limit: f.limit, total, pages: Math.ceil(total / f.limit) || 1 },
  });
});

const csvField = (value) => `"${String(value).replace(/"/g, '""')}"`;

/**
 * GET /api/admin/subscribers/export — full list as CSV (ignores pagination),
 * for importing into Google Sheets, Mailchimp/Klaviyo, or WhatsApp Business.
 */
export const exportAdminSubscribers = asyncHandler(async (req, res) => {
  const rows = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });

  const lines = [
    'Email,Subscribed At',
    ...rows.map((r) => `${csvField(r.email)},${csvField(r.createdAt.toISOString())}`),
  ];

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="shoo-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
  );
  res.send(lines.join('\n'));
});
