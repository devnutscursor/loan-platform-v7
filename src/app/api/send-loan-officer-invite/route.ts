import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPersonalTemplatesForUser } from '@/lib/template-manager';
import { getAppBaseUrl } from '@/lib/app-url';
import { normalizeInviteEmail } from '@/lib/auth-admin-users';
import { assertEmailCanReceiveInvite, sendSupabaseInviteOrResend } from '@/lib/invite-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export interface LoanOfficerInviteData {
  email: string;
  firstName: string;
  lastName: string;
  nmlsNumber: string;
  companyId: string;
}

export interface LoanOfficerInviteResult {
  success: boolean;
  message: string;
  officerId?: string;
}

const INVITE_EXPIRES_MS = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, nmlsNumber, companyId }: LoanOfficerInviteData =
      await request.json();

    if (!email || !firstName || !lastName || !nmlsNumber || !companyId) {
      return NextResponse.json(
        { success: false, message: 'All fields are required.' },
        { status: 400 },
      );
    }

    const normalizedEmail = normalizeInviteEmail(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 },
      );
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id, is_active, deactivated')
      .eq('email', normalizedEmail)
      .maybeSingle();

    const guard = await assertEmailCanReceiveInvite(supabase, normalizedEmail, 'loan_officer', {
      existingAppUserId: existingUser?.id,
    });
    if (!guard.ok) {
      return NextResponse.json({ success: false, message: guard.message }, { status: 409 });
    }

    const redirectTo = `${getAppBaseUrl()}/auth/invite?officer=true&company=${companyId}`;
    const inviteMeta = {
      first_name: firstName,
      last_name: lastName,
      role: 'employee',
      company_id: companyId,
    };

    const { userId: authUserId } = await sendSupabaseInviteOrResend(supabase, normalizedEmail, {
      redirectTo,
      data: inviteMeta,
    });

    if (existingUser && existingUser.id !== authUserId) {
      console.error(
        '[send-loan-officer-invite] users.id does not match Auth id',
        { usersId: existingUser.id, authUserId },
      );
      return NextResponse.json(
        {
          success: false,
          message:
            'This email has inconsistent account records. Please contact support before re-inviting.',
        },
        { status: 409 },
      );
    }

    const inviteSentAt = new Date().toISOString();
    const inviteExpiresAt = new Date(Date.now() + INVITE_EXPIRES_MS).toISOString();
    const userPayload = {
      email: normalizedEmail,
      first_name: firstName,
      last_name: lastName,
      nmls_number: nmlsNumber,
      role: 'employee',
      is_active: false,
      deactivated: false,
      invite_status: 'sent',
      invite_sent_at: inviteSentAt,
      invite_expires_at: inviteExpiresAt,
    };

    if (existingUser) {
      const { error: userError } = await supabase
        .from('users')
        .update(userPayload)
        .eq('id', existingUser.id);

      if (userError) {
        console.error('Error updating user record:', userError);
        return NextResponse.json(
          { success: false, message: 'Failed to update user record. Please try again.' },
          { status: 500 },
        );
      }
    } else {
      const { error: userError } = await supabase.from('users').insert({
        id: authUserId,
        ...userPayload,
      });

      if (userError) {
        console.error('Error creating user record:', userError);
        return NextResponse.json(
          { success: false, message: 'Failed to create user record. Please try again.' },
          { status: 500 },
        );
      }
    }

    const officerUserId = existingUser?.id ?? authUserId;

    await supabase.from('user_companies').delete().eq('user_id', officerUserId);

    const { error: companyError } = await supabase.from('user_companies').insert({
      user_id: officerUserId,
      company_id: companyId,
      role: 'employee',
      is_active: false,
    });

    if (companyError) {
      console.error('Error creating user-company relationship:', companyError);
      return NextResponse.json(
        { success: false, message: 'Failed to create company relationship. Please try again.' },
        { status: 500 },
      );
    }

    try {
      await createPersonalTemplatesForUser(officerUserId, firstName, lastName);
    } catch (templateError) {
      console.error('Error creating personal templates:', templateError);
    }

    return NextResponse.json({
      success: true,
      message: `Invite sent successfully to ${normalizedEmail}. The loan officer will receive an email to set up their account.`,
      officerId: officerUserId,
    });
  } catch (error) {
    console.error('Error in sendLoanOfficerInvite:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    );
  }
}
