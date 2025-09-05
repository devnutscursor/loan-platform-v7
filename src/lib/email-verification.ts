import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface EmailVerificationResult {
  success: boolean;
  message: string;
  verificationToken?: string;
  userId?: string;
}

/**
 * Send verification email to company admin
 * This will create a user in Supabase Auth with email confirmation required
 */
export async function sendVerificationEmail(
  email: string,
  companyId: string,
  companyName: string
): Promise<EmailVerificationResult> {
  try {
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Create new user with email confirmation required
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      email_confirm: false, // Require email confirmation
      user_metadata: {
        company_id: companyId,
        company_name: companyName,
        role: 'company_admin',
        verification_token: verificationToken
      }
    });

    if (createError) {
      // Check if user already exists
      if (createError.message.includes('already registered') || 
          createError.message.includes('User already registered') ||
          createError.message.includes('already exists') ||
          createError.code === 'email_exists') {
        return {
          success: false,
          message: 'A user with this email already exists. Please use a different email or contact support.'
        };
      }
      throw createError;
    }

    if (!newUser.user) {
      throw new Error('Failed to create user');
    }

    // For now, just return success - email confirmation will be handled by Supabase automatically
    // The user will receive a confirmation email from Supabase Auth
    return {
      success: true,
      message: 'Company admin account created! They will receive a verification email shortly.',
      verificationToken,
      userId: newUser.user.id
    };

  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create company admin account'
    };
  }
}

/**
 * Verify email token and complete company admin setup
 */
export async function verifyCompanyAdmin(
  companyId: string,
  verificationToken: string,
  password: string
): Promise<EmailVerificationResult> {
  try {
    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('verification_token', verificationToken)
      .single();

    if (companyError || !company) {
      return {
        success: false,
        message: 'Invalid verification token or company not found.'
      };
    }

    if (company.admin_email_verified) {
      return {
        success: false,
        message: 'This company admin has already been verified.'
      };
    }

    // Update user password and confirm email
    if (company.admin_user_id) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        company.admin_user_id,
        {
          password: password,
          email_confirm: true
        }
      );

      if (updateError) {
        throw updateError;
      }

      // Update company verification status
      await supabase
        .from('companies')
        .update({
          admin_email_verified: true,
          verification_token: null, // Clear token after verification
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId);

      // Add user to users table with company_admin role
      await supabase
        .from('users')
        .upsert({
          id: company.admin_user_id,
          email: company.admin_email,
          first_name: '',
          last_name: '',
          role: 'company_admin',
          is_active: true
        });

      // Link user to company
      await supabase
        .from('user_companies')
        .upsert({
          user_id: company.admin_user_id,
          company_id: companyId,
          role: 'admin'
        });

      return {
        success: true,
        message: 'Company admin verified successfully. You can now login.',
        userId: company.admin_user_id
      };
    }

    return {
      success: false,
      message: 'Admin user not found for this company.'
    };

  } catch (error) {
    console.error('Error verifying company admin:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify company admin'
    };
  }
}

/**
 * Check verification status of a company
 */
export async function checkVerificationStatus(companyId: string) {
  try {
    const { data: company, error } = await supabase
      .from('companies')
      .select('admin_email, admin_email_verified, admin_user_id')
      .eq('id', companyId)
      .single();

    if (error || !company) {
      return { verified: false, email: null };
    }

    return {
      verified: company.admin_email_verified,
      email: company.admin_email,
      hasUser: !!company.admin_user_id
    };
  } catch (error) {
    console.error('Error checking verification status:', error);
    return { verified: false, email: null };
  }
}
