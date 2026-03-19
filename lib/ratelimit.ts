import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting via Upstash Redis (sliding window).
 * If UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set,
 * all limiters degrade gracefully — always allow, log a warning once.
 */

type LimitResult = { success: boolean };
interface Limiter { limit: (key: string) => Promise<LimitResult>; }

const noopLimiter: Limiter = {
  limit: async () => {
    console.warn("[ratelimit] Upstash not configured — rate limiting disabled.");
    return { success: true };
  },
};

function buildLimiter(prefix: string, maxReq: number, window: Duration): Limiter {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return noopLimiter;

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxReq, window),
    prefix,
  });
}

// Admin login — 5 attempts per 15 minutes per IP
export const getLoginLimiter  = () => buildLimiter("rl:login",  5,  "15 m");
// Survey token verify — 10 attempts per 5 minutes per IP
export const getTokenLimiter  = () => buildLimiter("rl:token",  10, "5 m");
// Survey submission — 30 per hour per IP
export const getSubmitLimiter = () => buildLimiter("rl:submit", 30, "1 h");
// Delete PIN — 3 attempts per hour per IP
export const getPinLimiter    = () => buildLimiter("rl:pin",    3,  "1 h");
// Public API routes — 60 requests per minute per IP
export const getApiLimiter    = () => buildLimiter("rl:api",    60, "1 m");
