import { z } from 'zod';
import prisma from '../config/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
});

/**
 * POST /api/newsletter — "Stay in the loop" footer signup.
 * Duplicate emails are a normal, expected case here (not an error): the
 * P2002 unique-constraint hit is caught locally so it still returns
 * `success: true` rather than falling through to the generic error handler.
 */
export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = newsletterSchema.parse(req.body);

  try {
    await prisma.subscriber.create({ data: { email } });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(200).json({ success: true, message: 'You are already subscribed' });
    }
    throw err;
  }

  res.status(201).json({ success: true, message: 'Successfully subscribed' });
});
