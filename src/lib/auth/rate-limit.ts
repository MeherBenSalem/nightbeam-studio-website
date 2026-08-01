import "server-only";
import { createCache } from "@/lib/curseforge/cache";

// Redis-backed rate limiting with an in-memory fallback.
const limiterCache = createCache({ prefix: "rl:", ttl: 600 });

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowKey = Math.floor(now / windowMs);
  const cacheKey = `${key}:${windowKey}`;
  const raw = await limiterCache.get<{ count: number }>(cacheKey);
  const count = raw?.count ?? 0;
  const resetAt = (windowKey + 1) * windowMs;

  if (count >= limit) {
    return { ok: false, remaining: 0, resetAt };
  }

  await limiterCache.set(cacheKey, { count: count + 1 }, Math.ceil(windowMs / 1000));
  return { ok: true, remaining: limit - count - 1, resetAt };
}

export async function resetRateLimit(key: string): Promise<void> {
  const now = Date.now();
  const windowKey = Math.floor(now / 60_000);
  await limiterCache.del(`${key}:${windowKey}`);
}
