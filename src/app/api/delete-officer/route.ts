import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userCompanies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getSupabaseService } from '@/lib/supabase/service';
import {
  assertCanManageOfficer,
  requireCompanyAdminOrSuperAdmin,
} from '@/lib/api-auth';

const deleteOfficerSchema = z.object({
  officerId: z.string().uuid('Valid officer ID is required'),
});

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireCompanyAdminOrSuperAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const { ctx } = auth;

    const body = await request.json();
    const { officerId } = deleteOfficerSchema.parse(body);

    const denied = await assertCanManageOfficer(ctx, officerId);
    if (denied) return denied;

    const officer = await db
      .select()
      .from(users)
      .where(eq(users.id, officerId))
      .limit(1);

    if (!officer.length) {
      return NextResponse.json(
        { success: false, message: 'Officer not found' },
        { status: 404 },
      );
    }

    const inviteStatus = (officer[0].inviteStatus || '').toLowerCase();
    const isActiveUser = officer[0].isActive === true;
    if (inviteStatus === 'accepted' || isActiveUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            'This officer is already active. Deactivate them instead of deleting.',
        },
        { status: 400 },
      );
    }

    const supabase = getSupabaseService();
    try {
      await supabase.auth.admin.deleteUser(officerId);
    } catch {
      // User might not exist in auth for pending invites
    }

    await db.delete(userCompanies).where(eq(userCompanies.userId, officerId));
    await db.delete(users).where(eq(users.id, officerId));

    return NextResponse.json({
      success: true,
      message: 'Officer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting officer:', error);

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
