import { NextRequest, NextResponse } from 'next/server';
import { checkEmailRateLimit } from '@/lib/mortech/email-rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const rateLimit = await checkEmailRateLimit(email);

    return NextResponse.json({
      success: true,
      allowed: rateLimit.allowed,
      remaining: rateLimit.remaining,
      resetAt: rateLimit.resetAt.toISOString(),
      used: rateLimit.used,
      verified: rateLimit.verified,
    });
  } catch (error) {
    console.error('Error checking email limit:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

