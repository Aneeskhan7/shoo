import { z } from 'zod';
import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import { uploadBlogCoverToCloudinary, deleteCloudinaryImage } from '../lib/cloudinary.js';

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Appends -2, -3… until the slug is free — same pattern as products/brands. */
async function uniqueSlug(base, excludeId) {
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${n++}`;
  }
}

/** GET /api/admin/blog — admin sees drafts and published posts alike. */
export const listAdminPosts = asyncHandler(async (_req, res) => {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ posts });
});

export const getAdminPost = asyncHandler(async (req, res) => {
  const post = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
  if (!post) throw new ApiError(404, 'Post not found');
  res.json({ post });
});

const postInput = z.object({
  title: z.string().trim().min(1, 'Title is required').max(160),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens')
    .optional(),
  excerpt: z.string().trim().max(300).optional().nullable(),
  content: z.string().trim().min(1, 'Content is required'),
  isPublished: z.boolean().default(false),
});

/** POST /api/admin/blog */
export const createPost = asyncHandler(async (req, res) => {
  const body = postInput.parse(req.body);
  const slug = await uniqueSlug(body.slug ? slugify(body.slug) : slugify(body.title));

  const post = await prisma.blogPost.create({
    data: {
      title: body.title,
      slug,
      excerpt: body.excerpt || null,
      content: body.content,
      isPublished: body.isPublished,
      publishedAt: body.isPublished ? new Date() : null,
    },
  });

  res.status(201).json({ post });
});

/** PUT /api/admin/blog/:id — publishedAt is set the first time a post
 *  transitions to published, and never overwritten by later edits — a
 *  publish-then-edit-then-republish flow shouldn't reset "when this went
 *  live" for readers/JSON-LD/sitemap lastmod. */
export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Post not found');

  const body = postInput.parse(req.body);
  const slug = body.slug ? await uniqueSlug(slugify(body.slug), id) : existing.slug;

  const nowPublishing = body.isPublished && !existing.isPublished;

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      title: body.title,
      slug,
      excerpt: body.excerpt || null,
      content: body.content,
      isPublished: body.isPublished,
      publishedAt: nowPublishing ? new Date() : existing.publishedAt,
    },
  });

  res.json({ post });
});

/** DELETE /api/admin/blog/:id */
export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) throw new ApiError(404, 'Post not found');

  await prisma.blogPost.delete({ where: { id } });
  if (post.coverImagePublicId) {
    deleteCloudinaryImage(post.coverImagePublicId).catch(() => {});
  }

  res.status(204).end();
});

/** POST /api/admin/blog/:id/cover (multipart, field name "image") */
export const uploadPostCover = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) throw new ApiError(404, 'Post not found');
  if (!req.file) throw new ApiError(400, 'No image file was uploaded');

  if (post.coverImagePublicId) {
    deleteCloudinaryImage(post.coverImagePublicId).catch(() => {});
  }

  let result;
  try {
    result = await uploadBlogCoverToCloudinary(req.file.buffer, req.file.mimetype, { slug: post.slug });
  } catch (err) {
    console.error('Cloudinary upload failed:', err);
    throw new ApiError(502, 'Could not upload the image. Please try again.');
  }

  const updated = await prisma.blogPost.update({
    where: { id },
    data: { coverImage: result.secure_url, coverImagePublicId: result.public_id },
  });

  res.status(201).json({ post: updated });
});
