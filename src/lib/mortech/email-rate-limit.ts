import { db, mortechEmailRateLimits, emailVerifications } from '@/lib/db';
import { eq, and, gte } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

const DAILY_LIMIT = 3; // 3 requests per day per email

export interface EmailRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  used: number;
  verified: boolean;
}

/**
 * Check if an email has exceeded their daily rate limit for Mortech API calls
 * Also checks if the email is verified
 * @param email - The email address
 * @returns Rate limit status with remaining calls and reset time
 */
export async function checkEmailRateLimit(email: string): Promise<EmailRateLimitResult> {
  try {
    // First, check if email is verified
    const verification = await db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.email, email.toLowerCase()))
      .limit(1);

    const isVerified = verification.length > 0 && verification[0].isVerified === true;

    if (!isVerified) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(),
        used: 0,
        verified: false,
      };
    }

    // Calculate the timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Count API calls in the last 24 hours
    const callsInLast24Hours = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(mortechEmailRateLimits)
      .where(
        and(
          eq(mortechEmailRateLimits.email, email.toLowerCase()),
          gte(mortechEmailRateLimits.calledAt, twentyFourHoursAgo)
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
        .from(mortechEmailRateLimits)
        .where(
          and(
            eq(mortechEmailRateLimits.email, email.toLowerCase()),
            gte(mortechEmailRateLimits.calledAt, twentyFourHoursAgo)
          )
        )
        .orderBy(mortechEmailRateLimits.calledAt)
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
      verified: true,
    };
  } catch (error) {
    console.error('❌ Error checking email rate limit:', error);
    // On error, don't allow the request
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      used: 0,
      verified: false,
    };
  }
}

/**
 * Record an API call for rate limiting purposes
 * @param email - The email address
 * @param searchParams - Optional search parameters for reference
 */
export async function recordEmailApiCall(
  email: string,
  searchParams?: Record<string, any>
): Promise<void> {
  try {
    await db.insert(mortechEmailRateLimits).values({
      email: email.toLowerCase(),
      calledAt: new Date(),
      searchParams: searchParams || {},
    });
  } catch (error) {
    console.error('❌ Error recording email API call:', error);
    // Don't throw - rate limiting shouldn't break the API call
  }
}

/**
 * Check if email is verified
 * @param email - The email address
 * @returns true if email is verified, false otherwise
 */
export async function isEmailVerified(email: string): Promise<boolean> {
  try {
    const verification = await db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.email, email.toLowerCase()))
      .limit(1);

    return verification.length > 0 && verification[0].isVerified === true;
  } catch (error) {
    console.error('❌ Error checking email verification:', error);
    return false;
  }
}

