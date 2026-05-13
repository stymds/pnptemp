import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface Limiter {
  limit(identifier: string): Promise<{ success: boolean; reset?: number }>;
}

const ALLOW: Limiter = {
  async limit() {
    return { success: true };
  },
};

let _redis: Redis | null = null;
function redis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

function build(prefix: string, max: number, window: `${number} ${'s' | 'm' | 'h'}`): Limiter {
  const r = redis();
  if (!r) return ALLOW;
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(max, window),
    prefix: `pnp:rl:${prefix}`,
    analytics: false,
  });
}

/** 5 checkout starts per user per minute. */
export const checkoutLimiter: Limiter = build('checkout', 5, '60 s');

/** 10 verify-payment calls per user per minute. */
export const verifyLimiter: Limiter = build('verify', 10, '60 s');

/** 200 webhook deliveries per IP per minute (generous; per-provider). */
export const webhookLimiter: Limiter = build('webhook', 200, '60 s');

/**
 * Helper for Route Handlers — derives a stable identifier from request headers.
 * Falls back to a string so we always hit the limiter.
 */
export function clientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}
