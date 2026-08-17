import prisma from '../config/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Same public gate as productController.js's listProducts — an inactive
// product has no public URL to begin with.
const ORIGIN = (process.env.CLIENT_URL || 'https://www.shoo.business').replace(/\/$/, '');

// Static routes, mirroring robots.txt's Disallow list and the Seo noindex
// set — cart/checkout/account/sign-in/join/order lookups/search never
// belong in a sitemap. changefreq/priority are hints, not guarantees.
const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/shop', changefreq: 'daily', priority: '0.9' },
  { path: '/lookbook', changefreq: 'weekly', priority: '0.6' },
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/size-guide', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact', changefreq: 'yearly', priority: '0.3' },
  { path: '/careers', changefreq: 'monthly', priority: '0.3' },
  { path: '/press', changefreq: 'monthly', priority: '0.3' },
  { path: '/faq', changefreq: 'monthly', priority: '0.4' },
  { path: '/journal', changefreq: 'weekly', priority: '0.6' },
];

// Mirrors the slugs in client/src/lib/collections.js's COLLECTIONS map —
// duplicated here rather than imported since client and server are
// separate bundles/runtimes. Keep the two lists in sync.
const COLLECTION_SLUGS = [
  'mens-sneakers',
  'womens-sneakers',
  'kids-sneakers',
  'unisex-sneakers',
  'new-releases',
  'running-shoes',
  'high-top-sneakers',
  'lifestyle-sneakers',
  'trail-sneakers',
];

const escapeXml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

/** GET /api/sitemap.xml — public, no auth. Server-rendered rather than a
 *  static file, since the catalogue changes constantly via admin and a
 *  static file would go stale the moment a product is added/deactivated. */
export const sitemap = asyncHandler(async (_req, res) => {
  const [products, newestProduct, posts] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.product.findFirst({ where: { isActive: true }, orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  const urls = [
    ...STATIC_ROUTES.map((r) => ({
      loc: `${ORIGIN}${r.path}`,
      // Only /  and /shop track the catalogue's freshness — the other
      // static pages don't change when a product does, so a fabricated
      // lastmod for them would be actively misleading.
      lastmod: ['/', '/shop'].includes(r.path) ? newestProduct?.updatedAt : undefined,
      changefreq: r.changefreq,
      priority: r.priority,
    })),
    ...COLLECTION_SLUGS.map((slug) => ({
      loc: `${ORIGIN}/collections/${slug}`,
      lastmod: newestProduct?.updatedAt,
      changefreq: 'daily',
      priority: '0.8',
    })),
    ...products.map((p) => ({
      loc: `${ORIGIN}/products/${p.slug}`,
      lastmod: p.updatedAt,
      changefreq: 'weekly',
      priority: '0.7',
    })),
    ...posts.map((p) => ({
      loc: `${ORIGIN}/journal/${p.slug}`,
      lastmod: p.updatedAt,
      changefreq: 'monthly',
      priority: '0.5',
    })),
  ];

  const body = urls
    .map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join('\n');

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
});
