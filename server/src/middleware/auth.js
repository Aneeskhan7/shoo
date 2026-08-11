import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { ApiError } from './errorHandler.js';

const COOKIE = 'shoo_token';

export const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// In production the client and API live on different domains (e.g. Vercel +
// Render) — a cross-site fetch only carries the cookie if it's
// SameSite=None, which itself requires Secure. Locally, both run on
// localhost so Lax (no Secure requirement) keeps dev over plain HTTP working.
const isProd = process.env.NODE_ENV === 'production';

export const setAuthCookie = (res, token) =>
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

export const clearAuthCookie = (res) =>
  res.clearCookie(COOKIE, { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' });

const read = async (req) => {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    return await prisma.user.findUnique({
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
      where: { id: userId },
    });
  } catch {
    return null;
  }
};

/**
 * Attaches req.user when a valid cookie is present, never rejects.
 * Phase 1 mounts this so guest and signed-in requests share one code path;
 * Phase 2 turns on requireAuth for the account routes.
 */
export const optionalAuth = async (req, _res, next) => {
  req.user = await read(req);
  next();
};

export const requireAuth = async (req, _res, next) => {
  req.user = await read(req);
  if (!req.user) return next(new ApiError(401, 'Authentication required'));
  next();
};

/** Chain after requireAuth. Never trusts a role claim from the client — role
 *  is re-read from the DB on every request via requireAuth's `read()`. */
export const requireAdmin = (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, 'Authentication required'));
  if (req.user.role !== 'ADMIN') return next(new ApiError(403, 'Admin access required'));
  next();
};
