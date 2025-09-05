import { NextRequest, NextResponse } from 'next/server';
import { resendCompanyInvite } from '@/lib/invite-system';
import { z } from 'zod';

const resendInviteSchema = z.object({
  companyId: z.string().uuid('Valid company ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId } = resendInviteSchema.parse(body);

    const result = await resendCompanyInvite(companyId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API error resending invite:', error);
    
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
