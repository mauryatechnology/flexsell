import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Allow local fallback if Redis URL is not set
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
    analytics: true,
  });
}

// In-memory fallback for local dev
const fallbackMap = new Map<string, { count: number; resetTime: number }>();
let cleanupCounter = 0;
function cleanupExpired() {
  if (++cleanupCounter % 100 !== 0) return;
  const now = Date.now();
  for (const [key, entry] of fallbackMap) {
    if (now > entry.resetTime) fallbackMap.delete(key);
  }
}

export async function rateLimit(identifier: string) {
  if (ratelimit) {
    const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
    if (!success) throw new Error("Rate limit exceeded");
    return;
  }

  // Fallback behavior
  cleanupExpired();
  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 5;

  let record = fallbackMap.get(identifier);
  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + windowMs };
  }

  if (record.count >= maxRequests) {
    throw new Error("Rate limit exceeded");
  }

  record.count++;
  fallbackMap.set(identifier, record);
}
