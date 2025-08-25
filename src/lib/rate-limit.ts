const hits = new Map<string, { count: number; ts: number }>();
export function rateLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const rec = hits.get(key);
  if (!rec || now - rec.ts > windowMs) {
    hits.set(key, { count: 1, ts: now });
    return true;
  }
  if (rec.count >= limit) return false;
  rec.count += 1;
  return true;
}