import { NextRequest, NextResponse } from 'next/server';
import { db, emailVerifications } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { sendOTPEmail } from '@/lib/mortech/email-service';

/**
 * Generate a 6-digit numeric OTP code
 */
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Generate 6-digit OTP code
    const code = generateOTPCode();

    // Set expiration to 5 minutes from now
    const codeExpiresAt = new Date();
    codeExpiresAt.setMinutes(codeExpiresAt.getMinutes() + 5);

    // Check if email verification record already exists
    const existingVerification = await db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.email, normalizedEmail))
      .limit(1);

    if (existingVerification.length > 0) {
      // Update existing record with new code
      await db
        .update(emailVerifications)
        .set({
          verificationCode: code,
          codeExpiresAt: codeExpiresAt,
          isVerified: false, // Reset verification status when new code is sent
          verifiedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(emailVerifications.email, normalizedEmail));
    } else {
      // Create new verification record
      await db.insert(emailVerifications).values({
        email: normalizedEmail,
        verificationCode: code,
        codeExpiresAt: codeExpiresAt,
        isVerified: false,
        verifiedAt: null,
      });
    }

    // Send OTP email
    const emailResult = await sendOTPEmail(normalizedEmail, code);

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: emailResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully. Please check your email.',
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

