import { Resend } from 'resend';

/**
 * Lazy singleton — created on first use, not at import time, so the server
 * can still boot (and every other route still work) if RESEND_API_KEY is
 * unset in an environment that doesn't need email. The contact endpoint is
 * the only thing that will actually fail, with a clear error.
 */
let client;

export function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set in the server environment');
  }
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}
