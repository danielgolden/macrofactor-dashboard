// Simple in-memory sliding-window rate limiter.
// NOTE: state is per-instance; on serverless platforms warm starts reuse it
// but cold starts reset. For a personal app this is fine as a first layer
// behind the provider-level weekly cap. For multi-instance production, swap
// for Redis or a DB-backed counter.

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

export function checkRateLimit(key: string): { ok: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket) {
    buckets.set(key, { timestamps: [now] });
    return { ok: true };
  }

  const fresh = bucket.timestamps.filter((t) => now - t < WINDOW_MS);
  if (fresh.length >= MAX_REQUESTS) {
    const oldest = fresh[0];
    const retryAfterMs = WINDOW_MS - (now - oldest);
    bucket.timestamps = fresh;
    return { ok: false, retryAfterMs };
  }

  fresh.push(now);
  bucket.timestamps = fresh;
  return { ok: true };
}