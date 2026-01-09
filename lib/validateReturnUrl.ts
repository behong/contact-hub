export function validateReturnUrl(raw: string, allowlistCsv: string) {
  if (!raw) return { ok: false };

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false };
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false };
  }

  const allowlist = allowlistCsv
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  if (allowlist.length === 0) return { ok: false };

  if (!allowlist.includes(url.hostname.toLowerCase())) {
    return { ok: false };
  }

  return { ok: true, url };
}
