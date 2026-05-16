/**
 * TheBharatAI – Report Scheme API
 * File: api/report-scheme.js
 *
 * Vercel Serverless Function (Node.js 18+)
 * Handles POST /api/report-scheme from the "Report Wrong Info" modal.
 *
 * Features:
 *   ✅ Input validation
 *   ✅ Rate limiting (5 reports per IP per hour via in-memory KV)
 *   ✅ Structured logging (Vercel logs + optional Resend email)
 *   ✅ CORS headers
 *   ✅ DPDP Act compliant (no personal data stored beyond log)
 *
 * Environment Variables (set in Vercel dashboard):
 *   RESEND_API_KEY  — optional, for email alerts on new reports
 *   REPORT_EMAIL    — email to receive reports (default: workmailkartikeya@gmail.com)
 *   ALLOWED_ORIGIN  — CORS origin (default: https://thebharatai.me)
 *
 * Deploy: This file auto-deploys as /api/report-scheme when pushed to Vercel.
 */

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://thebharatai.me';
const REPORT_EMAIL   = process.env.REPORT_EMAIL   || 'workmailkartikeya@gmail.com';
const RESEND_KEY     = process.env.RESEND_API_KEY  || '';

// Simple in-memory rate limit (per Lambda instance)
// For production at scale: replace with Upstash Redis
const rateMap = new Map();

const VALID_TYPES = ['closed','amount','eligibility','deadline','link','other'];

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Rate limiting: max 5 reports per IP per hour
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const rl  = rateMap.get(ip) || { count: 0, windowStart: now };
  if (now - rl.windowStart > 3600000) { rl.count = 0; rl.windowStart = now; }
  rl.count++;
  rateMap.set(ip, rl);
  if (rl.count > 5) {
    return res.status(429).json({ error: 'Too many reports. Please try again later.' });
  }

  // Parse body
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { scheme, type, details, ts } = body || {};

  // Validate
  if (!scheme || typeof scheme !== 'string' || scheme.length > 200) {
    return res.status(400).json({ error: 'Invalid scheme name' });
  }
  if (!type || !VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Invalid issue type' });
  }
  const sanitizedDetails = typeof details === 'string'
    ? details.substring(0, 1000).replace(/<[^>]*>/g, '').trim()
    : '';

  // Structured log (visible in Vercel Function logs)
  const report = {
    event:     'scheme_report',
    scheme:    scheme.substring(0, 200),
    type,
    details:   sanitizedDetails,
    timestamp: new Date(ts || now).toISOString(),
    // NO IP logged — DPDP Act compliance
  };
  console.log('[BharatAI Report]', JSON.stringify(report));

  // Optional: Send email via Resend
  if (RESEND_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_KEY}`,
        },
        body: JSON.stringify({
          from:    'noreply@thebharatai.me',
          to:      REPORT_EMAIL,
          subject: `[TheBharatAI] Scheme Report: ${scheme}`,
          html: `
            <h2>Scheme Report — TheBharatAI</h2>
            <table border="0" cellpadding="8" style="font-family:sans-serif;font-size:14px;">
              <tr><td><strong>Scheme:</strong></td><td>${report.scheme}</td></tr>
              <tr><td><strong>Issue Type:</strong></td><td>${report.type}</td></tr>
              <tr><td><strong>Details:</strong></td><td>${report.details || '(none)'}</td></tr>
              <tr><td><strong>Time:</strong></td><td>${report.timestamp}</td></tr>
            </table>
            <p style="margin-top:16px;font-size:12px;color:#666;">Fix within 72 hours as committed on the site.</p>
          `,
        }),
      });
    } catch (emailErr) {
      console.error('[BharatAI Report] Email failed:', emailErr.message);
      // Don't fail the response if email fails
    }
  }

  return res.status(200).json({
    success:  true,
    message:  'Report received. We will verify and update within 72 hours.',
    reportId: `RPT-${now.toString(36).toUpperCase()}`,
  });
}