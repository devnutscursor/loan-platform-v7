import { db, mortechApiCalls } from '@/lib/db';
import { eq, and, gte } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

const DAILY_LIMIT = 10;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  used: number;
}

/**
 * Check if an officer has exceeded their daily rate limit for Mortech API calls
 * @param officerId - The ID of the loan officer
 * @returns Rate limit status with remaining calls and reset time
 */
export async function checkRateLimit(officerId: string): Promise<RateLimitResult> {
  try {
    // Calculate the timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Count API calls in the last 24 hours
    const callsInLast24Hours = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(mortechApiCalls)
      .where(
        and(
          eq(mortechApiCalls.officerId, officerId),
          gte(mortechApiCalls.calledAt, twentyFourHoursAgo)
        )
      );

    const used = callsInLast24Hours[0]?.count || 0;
    const remaining = Math.max(0, DAILY_LIMIT - used);
    const allowed = remaining > 0;

    // Calculate reset time (24 hours from the oldest call, or now if no calls)
    let resetAt: Date;
    if (used > 0) {
      // Get the oldest call in the last 24 hours
      const oldestCall = await db
        .select()
        .from(mortechApiCalls)
        .where(
          and(
            eq(mortechApiCalls.officerId, officerId),
            gte(mortechApiCalls.calledAt, twentyFourHoursAgo)
          )
        )
        .orderBy(mortechApiCalls.calledAt)
        .limit(1);

      if (oldestCall.length > 0) {
        resetAt = new Date(oldestCall[0].calledAt);
        resetAt.setHours(resetAt.getHours() + 24);
      } else {
        resetAt = new Date();
        resetAt.setHours(resetAt.getHours() + 24);
      }
    } else {
      // No calls made, reset is immediate (or in 24 hours from now)
      resetAt = new Date();
      resetAt.setHours(resetAt.getHours() + 24);
    }

    return {
      allowed,
      remaining,
      resetAt,
      used,
    };
  } catch (error) {
    console.error('❌ Error checking rate limit:', error);
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: DAILY_LIMIT,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      used: 0,
    };
  }
}

/**
 * Record an API call for rate limiting purposes
 * @param officerId - The ID of the loan officer
 * @param companyId - The ID of the company
 * @param searchParams - Optional search parameters for reference
 */
export async function recordApiCall(
  officerId: string,
  companyId: string,
  searchParams?: Record<string, any>
): Promise<void> {
  try {
    await db.insert(mortechApiCalls).values({
      officerId,
      companyId,
      calledAt: new Date(),
      searchParams: searchParams || {},
    });
  } catch (error) {
    console.error('❌ Error recording API call:', error);
    // Don't throw - rate limiting shouldn't break the API call
  }
}

