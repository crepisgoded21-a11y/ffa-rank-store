import { redis } from "./redis";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
};

/**
 * Fixed-window rate limiter keyed by an arbitrary identifier (e.g. client IP).
 * Call recordFailedAttempt() only on failed logins so successful logins
 * don't count against the limit.
 */
export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const redisKey = `login-attempts:${key}`;
  const count = await redis().get<number>(redisKey);

  if (count !== null && count >= MAX_ATTEMPTS) {
    const ttl = await redis().ttl(redisKey);
    return { allowed: false, remaining: 0, retryAfterSeconds: ttl > 0 ? ttl : WINDOW_SECONDS };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - (count ?? 0) };
}

export async function recordFailedAttempt(key: string): Promise<void> {
  const redisKey = `login-attempts:${key}`;
  const newCount = await redis().incr(redisKey);
  if (newCount === 1) {
    await redis().expire(redisKey, WINDOW_SECONDS);
  }
}

export async function clearRateLimit(key: string): Promise<void> {
  await redis().del(`login-attempts:${key}`);
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
