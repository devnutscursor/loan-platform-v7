import { NextRequest, NextResponse } from 'next/server';
import { sendCompanyAdminInvite } from '@/lib/invite-system';
import { z } from 'zod';

const sendInviteSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  adminEmail: z.string().email('Valid email is required'),
  website: z.string().optional(),
  includeDefaultContent: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, adminEmail, website, includeDefaultContent } = sendInviteSchema.parse(body);

    const result = await sendCompanyAdminInvite(companyName, adminEmail, website, includeDefaultContent);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API error sending invite:', error);
    
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
