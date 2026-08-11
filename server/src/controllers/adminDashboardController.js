import prisma from '../config/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const LOW_STOCK_THRESHOLD = 5;

/** GET /api/admin/dashboard — every number here is a live DB query, nothing fabricated. */
export const getDashboard = asyncHandler(async (_req, res) => {
  const [
    totalProducts,
    activeProducts,
    totalOrders,
    ordersByStatus,
    inventoryAgg,
    recentOrders,
    productsWithStock,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.productVariant.aggregate({ _sum: { stock: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        userId: true,
        guestEmail: true,
        user: { select: { email: true } },
      },
    }),
    prisma.product.findMany({
      select: { id: true, name: true, slug: true, isActive: true, variants: { select: { stock: true } } },
    }),
  ]);

  const statusCounts = Object.fromEntries(ordersByStatus.map((r) => [r.status, r._count._all]));

  let soldOutProducts = 0;
  const lowStockProducts = [];
  for (const p of productsWithStock) {
    const stocks = p.variants.map((v) => v.stock);
    const total = stocks.reduce((a, b) => a + b, 0);
    const soldOut = stocks.length > 0 && stocks.every((s) => s === 0);
    if (soldOut) soldOutProducts += 1;
    else if (total > 0 && total <= LOW_STOCK_THRESHOLD) {
      lowStockProducts.push({ id: p.id, name: p.name, slug: p.slug, totalStock: total });
    }
  }

  res.json({
    products: {
      total: totalProducts,
      active: activeProducts,
      soldOut: soldOutProducts,
    },
    orders: {
      total: totalOrders,
      pending: statusCounts.PENDING || 0,
      confirmed: statusCounts.CONFIRMED || 0,
      processing: statusCounts.PROCESSING || 0,
      shipped: statusCounts.SHIPPED || 0,
      delivered: statusCounts.DELIVERED || 0,
      cancelled: statusCounts.CANCELLED || 0,
    },
    totalInventoryUnits: inventoryAgg._sum.stock || 0,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt,
      customerEmail: o.user?.email || o.guestEmail,
    })),
    lowStockProducts: lowStockProducts.slice(0, 10),
  });
});
