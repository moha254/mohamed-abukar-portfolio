export interface RateLimiter {
  /** Records a hit for `key` and reports whether it is allowed. */
  hit(key: string): { allowed: boolean; retryAfterSeconds: number }
}

/**
 * Fixed-window, in-memory limiter. On Vercel each function instance has its
 * own memory, so this is a best-effort per-instance guard, not a global limit.
 * For a hard global limit, swap in a shared store (see README, "Rate limiting").
 */
export function createMemoryRateLimiter({
  limit,
  windowMs,
  now = Date.now,
  maxKeys = 5000,
}: {
  limit: number
  windowMs: number
  now?: () => number
  maxKeys?: number
}): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return {
    hit(key) {
      const t = now()
      let entry = hits.get(key)
      if (!entry || entry.resetAt <= t) {
        if (hits.size >= maxKeys) {
          // Drop expired entries; if still full, drop the oldest to bound memory.
          for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k)
          if (hits.size >= maxKeys) hits.delete(hits.keys().next().value as string)
        }
        entry = { count: 0, resetAt: t + windowMs }
        hits.set(key, entry)
      }
      entry.count += 1
      return {
        allowed: entry.count <= limit,
        retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - t) / 1000)),
      }
    },
  }
}
