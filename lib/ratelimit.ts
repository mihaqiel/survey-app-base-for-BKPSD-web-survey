/**
 * Rate limiting via Upstash Redis.
 * If UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set,
 * all limiters degrade gracefully (always allow) with a console warning.
 * To enable: sign up at https://console.upstash.com and add both env vars.
 */

type LimitResult = { success: boolean };

interface Limiter {
  limit: (key: string) => Promise<LimitResult>;
}

/** No-op limiter used when Upstash is not configured */
const noopLimiter: Limiter = {
  limit: async () => {
    console.warn("[ratelimit] Upstash not configured — rate limiting is disabled.");
    return { success: true };
  },
};

function buildLimiter(prefix: string, maxRequests: number, window: string): Limiter {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return noopLimiter;

  // Dynamic import so build doesn't fail when env vars are absent
  try {
    const { Ratelimit } = require("@upstash/ratelimit");
    const { Redis }     = require("@upstash/redis");
    const redis = new Redis({ url, token });
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, window),
      prefix,
    });
  } catch {
    return noopLimiter;
  }
}

// Admin login — 5 attempts per 15 minutes per IP
export function getLoginLimiter():  Limiter { return buildLimiter("rl:login",  5,  "15 m"); }

// Survey token verification — 10 attempts per 5 minutes per IP
export function getTokenLimiter():  Limiter { return buildLimiter("rl:token",  10, "5 m");  }

// Survey form submission — 30 per hour per IP
export function getSubmitLimiter(): Limiter { return buildLimiter("rl:submit", 30, "1 h");  }

// Delete PIN — 3 attempts per hour per IP
export function getPinLimiter():    Limiter { return buildLimiter("rl:pin",    3,  "1 h");  }

// Public API routes — 60 requests per minute per IP
export function getApiLimiter():    Limiter { return buildLimiter("rl:api",    60, "1 m");  }
