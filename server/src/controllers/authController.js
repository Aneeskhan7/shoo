import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../middleware/auth.js';

const PUBLIC_USER = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
};

/**
 * Guest → member conversion.
 *
 * Orders placed without an account carry guestEmail. When someone joins (or
 * signs in) with that same address, those orders are adopted into the account
 * so their history is complete. Guest checkout stays untouched — this only ever
 * runs after a successful authentication, never during shopping.
 */
async function claimGuestOrders(user) {
  const { count } = await prisma.order.updateMany({
    where: { userId: null, guestEmail: { equals: user.email, mode: 'insensitive' } },
    data: { userId: user.id },
  });
  return count;
}

const credentials = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const joinSchema = credentials.extend({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

/** POST /api/auth/register — "JOIN SHOO" */
export const register = asyncHandler(async (req, res) => {
  const body = joinSchema.parse(req.body);
  const email = body.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'An account already exists for that email. Sign in instead.');
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(body.password, 10),
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
    },
    select: PUBLIC_USER,
  });

  const claimed = await claimGuestOrders(user);
  setAuthCookie(res, signToken(user.id));

  res.status(201).json({ user, claimedOrders: claimed });
});

/** POST /api/auth/login — "SIGN IN" */
export const login = asyncHandler(async (req, res) => {
  const body = credentials.parse(req.body);
  const email = body.email.toLowerCase();

  const record = await prisma.user.findUnique({ where: { email } });
  // Same message either way so the endpoint can't be used to enumerate emails.
  if (!record || !(await bcrypt.compare(body.password, record.password))) {
    throw new ApiError(401, 'Email or password is incorrect');
  }

  const user = await prisma.user.findUnique({ where: { id: record.id }, select: PUBLIC_USER });
  const claimed = await claimGuestOrders(user);
  setAuthCookie(res, signToken(user.id));

  res.json({ user, claimedOrders: claimed });
});

/** POST /api/auth/logout */
export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

/** GET /api/auth/me — null (200) when signed out, so the client can hydrate. */
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user ?? null });
});
