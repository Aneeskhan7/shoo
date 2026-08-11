import { getResend } from './resend.js';

// Same sender convention as the Contact form — Resend's shared sandbox
// address until CONTACT_FROM_EMAIL points at a verified sending domain.
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'SHOO Website <onboarding@resend.dev>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const money = (n) => `PKR ${Number(n).toLocaleString('en-US')}`;

function wrapper({ eyebrow, heading, body }) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#F5F4F0;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0A0A0A;">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e4e0;">
      <tr>
        <td style="background:#0A0A0A;padding:24px 32px;">
          <span style="font-size:20px;font-weight:900;letter-spacing:-0.02em;color:#F5F4F0;">SHOO</span>
          <div style="margin-top:4px;font-size:11px;font-weight:600;letter-spacing:0.12em;color:#C6FF00;text-transform:uppercase;">
            ${esc(eyebrow)}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h1 style="margin:0 0 20px;font-size:20px;font-weight:800;letter-spacing:-0.01em;">${esc(heading)}</h1>
          ${body}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function itemsTable(items) {
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;font-size:13px;border-top:1px solid #F2F2F2;">
          ${esc(i.productName)}<br/>
          <span style="color:#808080;">${esc(i.colorName)} · ${esc(i.size)} · Qty ${i.quantity}</span>
        </td>
        <td style="padding:10px 0;font-size:13px;text-align:right;border-top:1px solid #F2F2F2;white-space:nowrap;">${money(i.total)}</td>
      </tr>`,
    )
    .join('');
  return `<table role="presentation" width="100%" style="margin-top:8px;">${rows}</table>`;
}

function trackLink(orderNumber, email) {
  return `${CLIENT_URL}/order/${encodeURIComponent(orderNumber)}?email=${encodeURIComponent(email)}`;
}

function ctaButton(href, label) {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;background:#C6FF00;color:#0A0A0A;font-weight:700;font-size:13px;text-decoration:none;padding:12px 24px;border-radius:999px;">${esc(label)} →</a>`;
}

function orderConfirmationHtml(order, email) {
  const body = `
    <p style="margin:0 0 4px;font-size:14px;color:#808080;">Order <strong style="color:#0A0A0A;">${esc(order.orderNumber)}</strong></p>
    <p style="margin:0;font-size:14px;">Thanks for shopping with SHOO. Cash on Delivery — pay when it arrives.</p>
    ${itemsTable(order.items)}
    <table role="presentation" width="100%" style="margin-top:16px;font-size:13px;">
      <tr><td style="padding:2px 0;color:#808080;">Subtotal</td><td style="padding:2px 0;text-align:right;">${money(order.subtotal)}</td></tr>
      ${Number(order.discount) > 0 ? `<tr><td style="padding:2px 0;color:#808080;">Discount</td><td style="padding:2px 0;text-align:right;">-${money(order.discount)}</td></tr>` : ''}
      <tr><td style="padding:2px 0;color:#808080;">Shipping</td><td style="padding:2px 0;text-align:right;">${Number(order.shippingCost) > 0 ? money(order.shippingCost) : 'Free'}</td></tr>
      <tr><td style="padding:8px 0 0;font-weight:700;border-top:1px solid #F2F2F2;">Total</td><td style="padding:8px 0 0;text-align:right;font-weight:700;border-top:1px solid #F2F2F2;">${money(order.total)}</td></tr>
    </table>
    <p style="margin:20px 0 0;font-size:13px;color:#808080;">
      Shipping to ${esc(order.address.street)}, ${esc(order.address.city)}, ${esc(order.address.country)}
    </p>
    ${ctaButton(trackLink(order.orderNumber, email), 'Track your order')}
  `;
  return wrapper({ eyebrow: 'Order confirmed', heading: `Order ${order.orderNumber} is confirmed`, body });
}

const STATUS_COPY = {
  SHIPPED: {
    eyebrow: 'Order shipped',
    heading: 'Your order is on its way',
    line: 'Your order has shipped and is heading to you now.',
  },
  DELIVERED: {
    eyebrow: 'Order delivered',
    heading: 'Your order has been delivered',
    line: 'Your order was marked as delivered. We hope you love it.',
  },
};

function orderStatusHtml(order, status, email) {
  const copy = STATUS_COPY[status];
  const body = `
    <p style="margin:0 0 4px;font-size:14px;color:#808080;">Order <strong style="color:#0A0A0A;">${esc(order.orderNumber)}</strong></p>
    <p style="margin:0;font-size:14px;">${copy.line}</p>
    ${ctaButton(trackLink(order.orderNumber, email), 'View order status')}
  `;
  return wrapper({ eyebrow: copy.eyebrow, heading: copy.heading, body });
}

function recipientEmail(order) {
  return order.user?.email ?? order.guestEmail ?? null;
}

/**
 * Best-effort — never throws. A failed/unsent email must not break order
 * placement or an admin's status update; callers just await and move on.
 *
 * `email` is passed explicitly rather than read off `order.user` — the
 * caller already knows it (member's account email or the guest checkout
 * email) without needing an extra `user` include.
 */
export async function sendOrderConfirmationEmail(order, email) {
  if (!email) return { sent: false, reason: 'no recipient email' };
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your SHOO order ${order.orderNumber} is confirmed`,
      html: orderConfirmationHtml(order, email),
    });
    if (error) return { sent: false, reason: error.message };
    return { sent: true, id: data?.id };
  } catch (err) {
    return { sent: false, reason: err.message };
  }
}

export async function sendOrderStatusEmail(order, status) {
  if (!STATUS_COPY[status]) return { sent: false, reason: `no template for ${status}` };
  const email = recipientEmail(order);
  if (!email) return { sent: false, reason: 'no recipient email' };
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${STATUS_COPY[status].heading} — ${order.orderNumber}`,
      html: orderStatusHtml(order, status, email),
    });
    if (error) return { sent: false, reason: error.message };
    return { sent: true, id: data?.id };
  } catch (err) {
    return { sent: false, reason: err.message };
  }
}
