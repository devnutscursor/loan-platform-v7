import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email-verification';
import { z } from 'zod';
import crypto from 'crypto';
import { rateLimitByEmail, rateLimitByIp } from '@/lib/rate-limit';

const sendVerificationSchema = z.object({
  email: z.string().email(),
  companyName: z.string().min(1),
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ipLimit = await rateLimitByIp(request, 'send-verification', 5, 3600);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { email, companyName, website } = sendVerificationSchema.parse(body);

    const emailLimit = await rateLimitByEmail(email, 'send-verification', 3, 3600);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many requests for this email. Please try again later.' },
        { status: 429 },
      );
    }

    // Generate a temporary company ID for the verification process
    const tempCompanyId = crypto.randomUUID();

    const result = await sendVerificationEmail(email, tempCompanyId, companyName);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API error sending verification:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
