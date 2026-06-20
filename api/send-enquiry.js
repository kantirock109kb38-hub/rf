/**
 * Vercel serverless — sends enquiry notification to sales + confirmation to customer.
 * Env (Vercel): RESEND_API_KEY, SALES_EMAIL, EMAIL_FROM (optional)
 */
const SALES_EMAIL = process.env.SALES_EMAIL || 'sales@rfflanges.com';
const EMAIL_FROM = process.env.EMAIL_FROM || 'RF Flanges <onboarding@resend.dev>';
const SITE_NAME = 'Ramdevra Forge & Fittings';

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendResend({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { ok: false, skipped: true, reason: 'RESEND_API_KEY not configured' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: EMAIL_FROM, to: Array.isArray(to) ? to : [to], subject, html }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: data.message || res.statusText };
  }
  return { ok: true, id: data.id };
}

function salesEmailHtml(lead) {
  return `
    <h2>New website enquiry</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
      <tr><td><strong>Name</strong></td><td>${esc(lead.name)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${esc(lead.email)}</td></tr>
      <tr><td><strong>Phone</strong></td><td>${esc(lead.phone || '—')}</td></tr>
      <tr><td><strong>Company</strong></td><td>${esc(lead.company || '—')}</td></tr>
      <tr><td><strong>Product</strong></td><td>${esc(lead.product_interest || '—')}</td></tr>
      <tr><td><strong>Message</strong></td><td>${esc(lead.message || '—')}</td></tr>
      <tr><td><strong>Source page</strong></td><td>${esc(lead.source_page || '—')}</td></tr>
      <tr><td><strong>Source URL</strong></td><td>${esc(lead.source_url || '—')}</td></tr>
    </table>
    <p style="font-family:sans-serif;font-size:13px;color:#666;">Submitted via rfflanges.com contact form</p>
  `;
}

function customerEmailHtml(lead) {
  return `
    <div style="font-family:sans-serif;max-width:560px;color:#333;">
      <p>Dear ${esc(lead.name)},</p>
      <p>Thank you for contacting <strong>${SITE_NAME}</strong>. We have received your enquiry and our team will respond within 24 business hours.</p>
      <h3 style="font-size:16px;margin-top:24px;">Your enquiry summary</h3>
      <ul style="line-height:1.7;">
        ${lead.product_interest ? `<li><strong>Product interest:</strong> ${esc(lead.product_interest)}</li>` : ''}
        ${lead.message ? `<li><strong>Message:</strong> ${esc(lead.message)}</li>` : ''}
        ${lead.phone ? `<li><strong>Phone:</strong> ${esc(lead.phone)}</li>` : ''}
      </ul>
      <p>For urgent assistance, call <strong>+91-9920142161</strong> or email <a href="mailto:sales@rfflanges.com">sales@rfflanges.com</a>.</p>
      <p style="color:#666;font-size:13px;">— ${SITE_NAME}<br>Mumbai, India</p>
    </div>
  `;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed =
    origin === 'https://www.rfflanges.com' ||
    origin === 'https://rfflanges.com' ||
    origin.endsWith('.vercel.app') ||
    origin.startsWith('http://localhost');

  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = body.phone ? String(body.phone).trim() : '';
  const company = body.company ? String(body.company).trim() : '';
  const product_interest = body.product_interest ? String(body.product_interest).trim() : '';
  const message = body.message ? String(body.message).trim() : '';
  const source_page = body.source_page ? String(body.source_page).trim() : '';
  const source_url = body.source_url ? String(body.source_url).trim() : '';

  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const lead = { name, email, phone, company, product_interest, message, source_page, source_url };

  const [salesResult, customerResult] = await Promise.all([
    sendResend({
      to: SALES_EMAIL,
      subject: `New enquiry: ${name}${product_interest ? ` — ${product_interest}` : ''}`,
      html: salesEmailHtml(lead),
    }),
    sendResend({
      to: email,
      subject: `Thank you for your enquiry — ${SITE_NAME}`,
      html: customerEmailHtml(lead),
    }),
  ]);

  if (!process.env.RESEND_API_KEY) {
    return res.status(200).json({
      ok: true,
      emails: 'skipped',
      message: 'Lead saved; configure RESEND_API_KEY on Vercel to enable email.',
    });
  }

  const errors = [];
  if (!salesResult.ok && !salesResult.skipped) errors.push(`sales: ${salesResult.error}`);
  if (!customerResult.ok && !customerResult.skipped) errors.push(`customer: ${customerResult.error}`);

  if (errors.length) {
    return res.status(502).json({ ok: false, errors });
  }

  return res.status(200).json({ ok: true, emails: 'sent' });
}
