import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { getAppBaseUrl } from '@/lib/app-url';
import { normalizeInviteEmail } from '@/lib/auth-admin-users';
import { assertEmailCanReceiveInvite, sendSupabaseInviteOrResend } from '@/lib/invite-auth';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface InviteResult {
  success: boolean;
  message: string;
  companyId?: string;
  inviteToken?: string;
}

export interface CompanyInviteStatus {
  id: string;
  name: string;
  admin_email: string;
  invite_status: 'pending' | 'sent' | 'accepted' | 'expired';
  invite_sent_at: string | null;
  invite_expires_at: string | null;
  created_at: string;
}

/**
 * Send invite to company admin email
 * Creates company with pending status and sends Supabase invite
 */
export async function sendCompanyAdminInvite(
  companyName: string,
  adminEmail: string,
  website?: string,
  includeDefaultContent?: boolean,
  hasMortechSubscription?: boolean
): Promise<InviteResult> {
  try {
    // Validate email format
    const normalizedEmail = normalizeInviteEmail(adminEmail);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return {
        success: false,
        message: 'Please enter a valid email address.'
      };
    }

    // Check if company with this email already exists in our database
    const { data: existingCompany } = await getSupabase()
      .from('companies')
      .select('id, invite_status, deactivated')
      .eq('admin_email', normalizedEmail)
      .single();

    if (existingCompany) {
      // If company exists and is active, show error
      if (existingCompany.invite_status === 'accepted' && !existingCompany.deactivated) {
        return {
          success: false,
          message: 'A company with this email already exists and is active. Please use a different email.'
        };
      }
      // If company exists but is pending/expired/deactivated, allow resending invite
      // We'll update the existing record instead of creating a new one
    }

    let companyData;
    let companyError;

    if (existingCompany) {
      // Update existing company record
      const { data, error } = await getSupabase()
        .from('companies')
        .update({
          name: companyName,
          slug: companyName.toLowerCase().replace(/\s+/g, '-'),
          email: normalizedEmail,
          website: website || '',
          admin_email: normalizedEmail,
          admin_email_verified: false,
          invite_status: 'pending',
          invite_sent_at: new Date().toISOString(),
          invite_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          is_active: false,
          deactivated: false, // Reset deactivation status
          has_default_content_access: includeDefaultContent || false,
          has_mortech_subscription: hasMortechSubscription !== false,
        })
        .eq('id', existingCompany.id)
        .select()
        .single();
      
      companyData = data;
      companyError = error;
    } else {
      // Create new company with pending status
      const { data, error } = await getSupabase()
        .from('companies')
        .insert({
          name: companyName,
          slug: companyName.toLowerCase().replace(/\s+/g, '-'),
          email: normalizedEmail,
          website: website || '',
          admin_email: normalizedEmail,
          admin_email_verified: false,
          invite_status: 'pending',
          invite_sent_at: new Date().toISOString(),
          invite_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          is_active: false, // Company is inactive until invite is accepted
          has_default_content_access: includeDefaultContent || false,
          has_mortech_subscription: hasMortechSubscription !== false,
        })
        .select()
        .single();
      
      companyData = data;
      companyError = error;
    }

    if (companyError) {
      throw companyError;
    }

    const guard = await assertEmailCanReceiveInvite(getSupabase(), normalizedEmail, 'company_admin', {
      existingCompanyId: existingCompany?.id,
    });
    if (!guard.ok) {
      if (!existingCompany) {
        await getSupabase().from('companies').delete().eq('id', companyData.id);
      }
      return { success: false, message: guard.message };
    }

    let inviteUserId: string;
    try {
      const inviteResult = await sendSupabaseInviteOrResend(getSupabase(), normalizedEmail, {
        redirectTo: `${getAppBaseUrl()}/auth/invite?company=${companyData.id}`,
        data: {
          company_id: companyData.id,
          company_name: companyName,
          role: 'company_admin',
        },
      });
      inviteUserId = inviteResult.userId;
    } catch (inviteError) {
      if (!existingCompany) {
        await getSupabase().from('companies').delete().eq('id', companyData.id);
      }
      throw inviteError;
    }

    // Update company with invite token and status
    const inviteToken = crypto.randomBytes(32).toString('hex');
    await getSupabase()
      .from('companies')
      .update({
        invite_status: 'sent',
        invite_token: inviteToken,
        admin_user_id: inviteUserId,
      })
      .eq('id', companyData.id);

    return {
      success: true,
      message: `🎉 Company "${companyName}" created successfully!\n\n📧 Invite sent to: ${normalizedEmail}\n\n⏳ The admin has 24 hours to accept the invite. You can track the status in your dashboard.`,
      companyId: companyData.id,
      inviteToken
    };

  } catch (error) {
    console.error('Error sending company admin invite:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send invite'
    };
  }
}

/**
 * Get companies with their invite status
 */
export async function getCompaniesWithInviteStatus(): Promise<CompanyInviteStatus[]> {
  try {
    const { data: companies, error } = await getSupabase()
      .from('companies')
      .select('id, name, admin_email, invite_status, invite_sent_at, invite_expires_at, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return companies || [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

/**
 * Resend invite for a company
 */
export async function resendCompanyInvite(companyId: string): Promise<InviteResult> {
  try {
    // Get company details
    const { data: company, error: companyError } = await getSupabase()
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return {
        success: false,
        message: 'Company not found.'
      };
    }

    if (!company.admin_email) {
      return {
        success: false,
        message: 'No admin email found for this company.'
      };
    }

    if (company.invite_status === 'accepted') {
      return {
        success: false,
        message: 'This company has already accepted the invite.',
      };
    }

    const normalizedEmail = normalizeInviteEmail(company.admin_email);
    const guard = await assertEmailCanReceiveInvite(getSupabase(), normalizedEmail, 'company_admin', {
      existingCompanyId: companyId,
    });
    if (!guard.ok) {
      return { success: false, message: guard.message };
    }

    const { userId: inviteUserId } = await sendSupabaseInviteOrResend(getSupabase(), normalizedEmail, {
      redirectTo: `${getAppBaseUrl()}/auth/invite?company=${company.id}`,
      data: {
        company_id: company.id,
        company_name: company.name,
        role: 'company_admin',
      },
    });

    // Update company with new invite details
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await getSupabase()
      .from('companies')
      .update({
        invite_status: 'sent',
        invite_sent_at: new Date().toISOString(),
        invite_expires_at: newExpiresAt,
        admin_user_id: inviteUserId,
      })
      .eq('id', companyId);

    return {
      success: true,
      message: `📧 Invite resent to ${company.admin_email}. New expiry: 24 hours.`
    };

  } catch (error) {
    console.error('Error resending invite:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to resend invite'
    };
  }
}

/**
 * Delete company and cancel invite.
 * Only allowed for companies whose invite was NOT accepted (pending/sent/expired).
 * Accepted companies must be deactivated first, not deleted.
 */
export async function deleteCompanyAndCancelInvite(companyId: string): Promise<InviteResult> {
  try {
    // Get company details (need invite_status to enforce rule)
    const { data: company, error: companyError } = await getSupabase()
      .from('companies')
      .select('admin_user_id, invite_status')
      .eq('id', companyId)
      .single();

    if (companyError) {
      return {
        success: false,
        message: 'Company not found.'
      };
    }

    // Block delete for accepted companies - they must be deactivated only
    if (company.invite_status === 'accepted') {
      return {
        success: false,
        message: 'Cannot delete a company whose invite was accepted. Deactivate the company instead.'
      };
    }

    // Delete user from Supabase Auth if exists
    if (company.admin_user_id) {
      await getSupabase().auth.admin.deleteUser(company.admin_user_id);
    }

    // Delete company from database (single row by id)
    await getSupabase().from('companies').delete().eq('id', companyId);

    return {
      success: true,
      message: 'Company deleted successfully and invite cancelled.'
    };

  } catch (error) {
    console.error('Error deleting company:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete company'
    };
  }
}

/**
 * Check if invite is expired
 */
export function isInviteExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date() > new Date(expiresAt);
}

/**
 * Get time remaining for invite
 */
export function getInviteTimeRemaining(expiresAt: string | null): string {
  if (!expiresAt) return 'No expiry';
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}
