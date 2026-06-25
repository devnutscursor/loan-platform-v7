import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userCompanies } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getAppBaseUrl } from '@/lib/app-url';
import { assertEmailCanReceiveInvite, sendSupabaseInviteOrResend } from '@/lib/invite-auth';
import {
  assertCanManageOfficer,
  requireCompanyAdminOrSuperAdmin,
} from '@/lib/api-auth';

const resendInviteSchema = z.object({
  officerId: z.string().uuid('Valid officer ID is required'),
});

export async function POST(request: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  try {
    const auth = await requireCompanyAdminOrSuperAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const { ctx } = auth;

    const body = await request.json();
    const { officerId } = resendInviteSchema.parse(body);

    const denied = await assertCanManageOfficer(ctx, officerId);
    if (denied) return denied;

    const membershipFilter = ctx.companyId
      ? and(eq(users.id, officerId), eq(userCompanies.companyId, ctx.companyId))
      : eq(users.id, officerId);

    const officer = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        isActive: users.isActive,
        deactivated: users.deactivated,
        companyId: userCompanies.companyId,
        membershipActive: userCompanies.isActive,
      })
      .from(users)
      .innerJoin(userCompanies, eq(users.id, userCompanies.userId))
      .where(membershipFilter)
      .orderBy(desc(userCompanies.isActive), desc(userCompanies.joinedAt))
      .limit(1);

    if (!officer.length) {
      return NextResponse.json({ error: 'Officer not found' }, { status: 404 });
    }

    const officerData = officer[0];

    if (officerData.deactivated) {
      return NextResponse.json(
        { success: false, message: 'Cannot resend invite for deactivated officer' },
        { status: 400 },
      );
    }

    if (officerData.isActive && officerData.membershipActive) {
      return NextResponse.json(
        { success: false, message: 'Officer has already accepted the invite' },
        { status: 400 },
      );
    }

    if (!officerData.email) {
      return NextResponse.json(
        { success: false, message: 'Officer has no email on file' },
        { status: 400 },
      );
    }

    const guard = await assertEmailCanReceiveInvite(supabase, officerData.email, 'loan_officer', {
      existingAppUserId: officerData.id,
    });
    if (!guard.ok) {
      return NextResponse.json({ success: false, message: guard.message }, { status: 409 });
    }

    await sendSupabaseInviteOrResend(supabase, officerData.email, {
      redirectTo: `${getAppBaseUrl()}/auth/invite?officer=true&company=${officerData.companyId}`,
      data: {
        first_name: officerData.firstName,
        last_name: officerData.lastName,
        role: 'employee',
        company_id: officerData.companyId,
      },
    });

    const newExpirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db
      .update(users)
      .set({
        inviteExpiresAt: newExpirationTime,
        inviteStatus: 'sent',
        inviteSentAt: new Date(),
      })
      .where(eq(users.id, officerId));

    return NextResponse.json({
      success: true,
      message: `Invite resent successfully to ${officerData.email}. The loan officer will receive an email to set up their account.`,
    });
  } catch (error) {
    console.error('API error resending loan officer invite:', error);

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
