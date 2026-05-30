import { NextRequest, NextResponse } from 'next/server';
import { deleteCompanyAndCancelInvite } from '@/lib/invite-system';
import { z } from 'zod';
import { requireSuperAdmin } from '@/lib/api-auth';

const deleteCompanySchema = z.object({
  companyId: z.string().uuid('Valid company ID is required'),
});

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { companyId } = deleteCompanySchema.parse(body);

    const result = await deleteCompanyAndCancelInvite(companyId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API error deleting company:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}
