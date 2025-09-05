import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email-verification';
import { z } from 'zod';
import crypto from 'crypto';

const sendVerificationSchema = z.object({
  email: z.string().email(),
  companyName: z.string().min(1),
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, companyName, website } = sendVerificationSchema.parse(body);

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
