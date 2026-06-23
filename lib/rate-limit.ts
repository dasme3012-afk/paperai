/**
 * In-memory sliding window rate limiter.
 * Suitable for Vercel serverless (resets on cold start).
 * For production scale, upgrade to Upstash Redis.
 */

const windowMap = new Map<string, number[]>();

// Clean up old entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, timestamps] of windowMap) {
    const valid = timestamps.filter((t) => now - t < windowMs);
    if (valid.length === 0) {
      windowMap.delete(key);
    } else {
      windowMap.set(key, valid);
    }
  }
}

export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number = 60_000
): { success: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  cleanup(windowMs);

  const timestamps = windowMap.get(identifier) ?? [];
  const windowStart = now - windowMs;
  const recentTimestamps = timestamps.filter((t) => t > windowStart);

  if (recentTimestamps.length >= limit) {
    const oldestInWindow = recentTimestamps[0]!;
    const retryAfterMs = oldestInWindow + windowMs - now;
    return { success: false, remaining: 0, retryAfterMs };
  }

  recentTimestamps.push(now);
  windowMap.set(identifier, recentTimestamps);

  return {
    success: true,
    remaining: limit - recentTimestamps.length,
    retryAfterMs: 0,
  };
}
