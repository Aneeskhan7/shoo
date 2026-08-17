import { z } from 'zod';
import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

const listSelect = {
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
};

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

/** GET /api/blog — published posts only, newest first. */
export const listPosts = asyncHandler(async (req, res) => {
  const f = listQuery.parse(req.query);
  const where = { isPublished: true };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      select: listSelect,
      orderBy: { publishedAt: 'desc' },
      skip: (f.page - 1) * f.limit,
      take: f.limit,
    }),
    prisma.blogPost.count({ where }),
  ]);

  res.json({
    posts,
    pagination: { page: f.page, limit: f.limit, total, pages: Math.ceil(total / f.limit) || 1 },
  });
});

/** GET /api/blog/:slug — 404s an unpublished post exactly like a missing
 *  one, so a draft's slug can't be probed/confirmed from the public API. */
export const getPost = asyncHandler(async (req, res) => {
  const post = await prisma.blogPost.findFirst({
    where: { slug: req.params.slug, isPublished: true },
  });
  if (!post) throw new ApiError(404, 'Post not found');
  res.json({ post });
});
