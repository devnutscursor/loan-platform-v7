import type { SupabaseClient } from '@supabase/supabase-js';
import { findAuthUserByEmail, normalizeInviteEmail } from '@/lib/auth-admin-users';
import { sendInviteLinkEmail } from '@/lib/mortech/email-service';

export type InviteContext = 'company_admin' | 'loan_officer';

export type InviteGuardResult =
  | { ok: true; authUserId?: string }
  | { ok: false; message: string };

/**
 * Ensures we do not invite over an active account or break an existing login.
 * Never deletes Auth users — pending invites may be resent to the same Auth id.
 */
export async function assertEmailCanReceiveInvite(
  supabase: SupabaseClient,
  email: string,
  context: InviteContext,
  options?: {
    existingCompanyId?: string;
    existingAppUserId?: string;
  },
): Promise<InviteGuardResult> {
  const normalized = normalizeInviteEmail(email);

  const { data: appUser } = await supabase
    .from('users')
    .select('id, is_active, deactivated, role')
    .eq('email', normalized)
    .maybeSingle();

  const { data: companiesForEmail } = await supabase
    .from('companies')
    .select('id, invite_status, deactivated, admin_user_id')
    .eq('admin_email', normalized);

  const authUser = await findAuthUserByEmail(supabase, normalized);

  const isActiveAppUser = appUser?.is_active === true && appUser.deactivated !== true;

  const activeAcceptedCompany = (companiesForEmail ?? []).find(
    (c) => c.invite_status === 'accepted' && c.deactivated !== true,
  );

  // Resend invite for same pending officer row
  if (
    options?.existingAppUserId &&
    appUser?.id === options.existingAppUserId &&
    !isActiveAppUser
  ) {
    return { ok: true, authUserId: authUser?.id ?? appUser.id };
  }

  // Resend invite for same pending company row
  if (options?.existingCompanyId) {
    const company = (companiesForEmail ?? []).find((c) => c.id === options.existingCompanyId);
    if (company && company.invite_status !== 'accepted') {
      return { ok: true, authUserId: authUser?.id ?? company.admin_user_id ?? undefined };
    }
  }

  if (isActiveAppUser) {
    return {
      ok: false,
      message:
        'This email is already registered to an active user. They should sign in or use password reset.',
    };
  }

  if (activeAcceptedCompany) {
    const isSamePendingCompanyResend =
      options?.existingCompanyId && activeAcceptedCompany.id === options.existingCompanyId;
    if (!isSamePendingCompanyResend) {
      return {
        ok: false,
        message:
          context === 'loan_officer'
            ? 'This email is already used as an active company admin. Use a different email.'
            : 'A company with this admin email is already active. Use a different email.',
      };
    }
  }

  if (authUser?.email_confirmed_at) {
    const isSamePendingOfficer =
      options?.existingAppUserId && authUser.id === options.existingAppUserId;
    const pendingCompany = (companiesForEmail ?? []).find(
      (c) => c.id === options?.existingCompanyId && c.invite_status !== 'accepted',
    );
    const isSamePendingCompanyAdmin =
      pendingCompany && pendingCompany.admin_user_id === authUser.id;

    if (!isSamePendingOfficer && !isSamePendingCompanyAdmin) {
      return {
        ok: false,
        message:
          'This email already has a login account. Use password reset or a different email.',
      };
    }
  }

  if (appUser?.deactivated) {
    return {
      ok: false,
      message:
        'This email belongs to a deactivated user. Reactivate the user instead of sending a new invite.',
    };
  }

  return { ok: true, authUserId: authUser?.id };
}

export type SendInviteResult = { userId: string; resent: boolean };

/**
 * Send a Supabase invite email without deleting existing Auth users.
 * New emails → inviteUserByEmail. Existing unconfirmed → generateLink + app SMTP.
 */
export async function sendSupabaseInviteOrResend(
  supabase: SupabaseClient,
  email: string,
  options: {
    redirectTo: string;
    data: Record<string, unknown>;
  },
): Promise<SendInviteResult> {
  const normalized = normalizeInviteEmail(email);
  const existing = await findAuthUserByEmail(supabase, normalized);

  if (!existing) {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(normalized, {
      redirectTo: options.redirectTo,
      data: options.data,
    });
    if (error) throw error;
    if (!data.user?.id) throw new Error('Invite failed: no user id returned');
    return { userId: data.user.id, resent: false };
  }

  const { error: inviteAgainError } = await supabase.auth.admin.inviteUserByEmail(normalized, {
    redirectTo: options.redirectTo,
    data: options.data,
  });
  if (!inviteAgainError) {
    return { userId: existing.id, resent: true };
  }

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'invite',
    email: normalized,
    options: {
      redirectTo: options.redirectTo,
      data: options.data,
    },
  });
  if (linkError) throw linkError;

  const actionLink = linkData.properties?.action_link;
  if (!actionLink) {
    throw new Error('Could not generate invite link for resend');
  }

  const mail = await sendInviteLinkEmail(normalized, actionLink);
  if (!mail.success) {
    throw new Error(mail.message);
  }

  return { userId: existing.id, resent: true };
}
