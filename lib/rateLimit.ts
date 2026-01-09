type RateBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateBucket>();

export function checkRateLimit(key: string, limit: number, windowSec: number) {
  const safeLimit = Math.max(1, limit);
  const safeWindowMs = Math.max(1, windowSec) * 1000;
  const now = Date.now();

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + safeWindowMs });
    return { ok: true };
  }

  if (bucket.count >= safeLimit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true };
}
