import { z } from 'zod';
import { getResend } from '../lib/resend.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'shoo.bussiness@gmail.com';
// Resend's shared test sender — works with no domain setup. Once a sending
// domain is verified in the Resend dashboard, set CONTACT_FROM_EMAIL to an
// address on it (e.g. "SHOO Website <contact@shoo.com>") and this switches
// automatically, no code change needed.
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'SHOO Website <onboarding@resend.dev>';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Enter a valid email'),
  subject: z.string().trim().min(1, 'Subject is required').max(200),
  message: z.string().trim().min(1, 'Message is required').max(5000),
});

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function contactEmailHtml({ name, email, subject, message }) {
  const replySubject = encodeURIComponent(`Re: ${subject}`);
  return `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#F5F4F0;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0A0A0A;">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e4e0;">
      <tr>
        <td style="background:#0A0A0A;padding:24px 32px;">
          <span style="font-size:20px;font-weight:900;letter-spacing:-0.02em;color:#F5F4F0;">SHOO</span>
          <div style="margin-top:4px;font-size:11px;font-weight:600;letter-spacing:0.12em;color:#C6FF00;text-transform:uppercase;">
            New website inquiry
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <table role="presentation" width="100%" style="font-size:14px;line-height:1.6;">
            <tr>
              <td style="padding:0 0 16px;color:#808080;width:110px;vertical-align:top;">Name</td>
              <td style="padding:0 0 16px;font-weight:600;">${esc(name)}</td>
            </tr>
            <tr>
              <td style="padding:0 0 16px;color:#808080;vertical-align:top;">Email</td>
              <td style="padding:0 0 16px;">
                <a href="mailto:${esc(email)}" style="color:#0A0A0A;font-weight:600;">${esc(email)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 0 16px;color:#808080;vertical-align:top;">Subject</td>
              <td style="padding:0 0 16px;font-weight:600;">${esc(subject)}</td>
            </tr>
            <tr>
              <td style="padding:16px 0 0;color:#808080;vertical-align:top;" colspan="2">Message</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px 0 0;white-space:pre-wrap;background:#F2F2F2;border-radius:8px;padding:16px;">${esc(message)}</td>
            </tr>
          </table>

          <a
            href="mailto:${esc(email)}?subject=${replySubject}"
            style="display:inline-block;margin-top:28px;background:#C6FF00;color:#0A0A0A;font-weight:700;font-size:13px;text-decoration:none;padding:12px 24px;border-radius:999px;"
          >
            Reply to ${esc(name)} →
          </a>
          <p style="margin-top:16px;font-size:12px;color:#808080;">
            This message was sent from the Contact form at shoo. Replying to this email goes
            straight to the customer's inbox (${esc(email)}).
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** POST /api/contact */
export const sendContactMessage = asyncHandler(async (req, res) => {
  const body = contactSchema.parse(req.body);

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    replyTo: body.email,
    subject: `[SHOO Contact] ${body.subject}`,
    html: contactEmailHtml(body),
  });

  if (error) {
    throw new ApiError(502, error.message || 'Could not send your message. Please try again.');
  }

  res.status(200).json({ ok: true, id: data?.id });
});
