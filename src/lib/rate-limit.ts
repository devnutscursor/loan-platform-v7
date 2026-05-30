import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

type WindowState = { count: number; resetAt: number };

const memoryWindows = new Map<string, WindowState>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
};

/**
 * Sliding-window rate limit keyed by IP + logical key (e.g. "contact-send").
 */
export async function rateLimitByIp(
  request: NextRequest,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const redisKey = `rl:${key}:${ip}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const redis = getRedis();
  if (redis) {
    try {
      const count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.expire(redisKey, windowSeconds);
      }
      const ttl = await redis.ttl(redisKey);
      const resetAt = new Date(now + (ttl > 0 ? ttl : windowSeconds) * 1000);
      const remaining = Math.max(0, limit - count);
      return { allowed: count <= limit, remaining, resetAt };
    } catch {
      // fall through to memory
    }
  }

  const existing = memoryWindows.get(redisKey);
  if (!existing || existing.resetAt <= now) {
    memoryWindows.set(redisKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: new Date(now + windowMs) };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  return {
    allowed: existing.count <= limit,
    remaining,
    resetAt: new Date(existing.resetAt),
  };
}

export async function rateLimitByEmail(
  email: string,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const normalized = email.trim().toLowerCase();
  const redisKey = `rl:${key}:email:${normalized}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  const redis = getRedis();
  if (redis) {
    try {
      const count = await redis.incr(redisKey);
      if (count === 1) await redis.expire(redisKey, windowSeconds);
      const ttl = await redis.ttl(redisKey);
      const resetAt = new Date(now + (ttl > 0 ? ttl : windowSeconds) * 1000);
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        resetAt,
      };
    } catch {
      // fall through
    }
  }

  const existing = memoryWindows.get(redisKey);
  if (!existing || existing.resetAt <= now) {
    memoryWindows.set(redisKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: new Date(now + windowMs) };
  }

  existing.count += 1;
  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: new Date(existing.resetAt),
  };
}
