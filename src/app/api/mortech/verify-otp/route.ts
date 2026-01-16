import { NextRequest, NextResponse } from 'next/server';
import { db, emailVerifications } from '@/lib/db';
import { eq, and, gt } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, verified: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, verified: false, message: 'Verification code is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.trim();

    // Find verification record
    const verification = await db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.email, normalizedEmail))
      .limit(1);

    if (verification.length === 0) {
      return NextResponse.json(
        { success: false, verified: false, message: 'No verification code found for this email. Please request a new code.' },
        { status: 404 }
      );
    }

    const verificationRecord = verification[0];

    // Check if code has expired
    const now = new Date();
    if (verificationRecord.codeExpiresAt < now) {
      return NextResponse.json(
        { success: false, verified: false, message: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check if code matches
    if (verificationRecord.verificationCode !== normalizedCode) {
      return NextResponse.json(
        { success: false, verified: false, message: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    // Code is valid - mark as verified
    await db
      .update(emailVerifications)
      .set({
        isVerified: true,
        verifiedAt: now,
        updatedAt: now,
      })
      .where(eq(emailVerifications.email, normalizedEmail));

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, verified: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

