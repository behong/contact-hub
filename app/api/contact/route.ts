import { NextResponse } from 'next/server';

import { validateReturnUrl } from '../../../lib/validateReturnUrl';
import { checkRateLimit } from '../../../lib/rateLimit';
import { sendContactMail } from '../../../lib/mail';

const MIN_MEMO_LEN = 10;
const MAX_MEMO_LEN = 500;

type ContactBody = {
  site?: string;
  return_url?: string;
  memo?: string;
  contact?: string;
  [key: string]: unknown;
};

function getClientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  return req.headers.get('x-real-ip') ?? '0.0.0.0';
}

function getKstTimestamp() {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().replace('T', ' ').replace('Z', '');
}

export async function POST(req: Request) {
  let body: ContactBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'VALIDATION_ERROR' }, { status: 400 });
  }

  const site = typeof body.site === 'string' ? body.site.trim() : '';
  const returnUrl = typeof body.return_url === 'string' ? body.return_url.trim() : '';
  const memo = typeof body.memo === 'string' ? body.memo.trim() : '';
  const contact = typeof body.contact === 'string' ? body.contact.trim() : '';

  if (!site || !returnUrl || !memo) {
    return NextResponse.json({ ok: false, error: 'VALIDATION_ERROR' }, { status: 400 });
  }

  if (memo.length < MIN_MEMO_LEN || memo.length > MAX_MEMO_LEN) {
    return NextResponse.json({ ok: false, error: 'VALIDATION_ERROR' }, { status: 400 });
  }

  const allowlist = process.env.ALLOWED_RETURN_HOSTS ?? '';
  const { ok: returnOk, url } = validateReturnUrl(returnUrl, allowlist);
  const redirect = returnOk && url
    ? `/done?status=ok&return_url=${encodeURIComponent(url.toString())}`
    : '/done?status=blocked';

  const honeypotField = process.env.HONEYPOT_FIELD ?? 'company';
  const honeypotValue = typeof body[honeypotField] === 'string'
    ? (body[honeypotField] as string).trim()
    : '';

  if (honeypotValue) {
    return NextResponse.json({ ok: true, redirect });
  }

  const ip = getClientIp(req);
  const limit = Number.parseInt(process.env.RATE_LIMIT_PER_MIN ?? '3', 10);
  const windowSec = Number.parseInt(process.env.RATE_LIMIT_WINDOW_SEC ?? '60', 10);
  const rate = checkRateLimit(
    ip,
    Number.isFinite(limit) ? limit : 3,
    Number.isFinite(windowSec) ? windowSec : 60
  );

  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: 'RATE_LIMIT' },
      {
        status: 429,
        headers: rate.retryAfterSec ? { 'Retry-After': rate.retryAfterSec.toString() } : undefined,
      }
    );
  }

  try {
    await sendContactMail({
      site,
      returnUrl,
      memo,
      contact,
      timestamp: getKstTimestamp(),
      ip,
      userAgent: req.headers.get('user-agent') ?? '',
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, redirect });
}
