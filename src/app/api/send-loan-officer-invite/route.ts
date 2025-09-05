import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface LoanOfficerInviteData {
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
}

export interface LoanOfficerInviteResult {
  success: boolean;
  message: string;
  officerId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, companyId }: LoanOfficerInviteData = await request.json();

    // Validate required fields
    if (!email || !firstName || !lastName || !companyId) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required.'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Please enter a valid email address.'
      }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(user => user.email === email);

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'A user with this email already exists. Please use a different email address.'
      }, { status: 400 });
    }

    // Create the loan officer user via invite
    const { data: inviteResult, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/invite?officer=true&company=${companyId}`,
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'employee',
          company_id: companyId
        }
      }
    );

    if (inviteError) {
      console.error('Error sending loan officer invite:', inviteError);
      return NextResponse.json({
        success: false,
        message: `Failed to send invite: ${inviteError.message}`
      }, { status: 500 });
    }

    if (inviteResult?.user) {
      // Create user record in database
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: inviteResult.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          role: 'employee',
          is_active: false, // Will be activated when they accept the invite
        });

      if (userError) {
        console.error('Error creating user record:', userError);
        return NextResponse.json({
          success: false,
          message: 'Failed to create user record. Please try again.'
        }, { status: 500 });
      }

      // Create user-company relationship
      const { error: companyError } = await supabase
        .from('user_companies')
        .insert({
          user_id: inviteResult.user.id,
          company_id: companyId,
          role: 'employee',
          is_active: false, // Will be activated when they accept the invite
        });

      if (companyError) {
        console.error('Error creating user-company relationship:', companyError);
        return NextResponse.json({
          success: false,
          message: 'Failed to create company relationship. Please try again.'
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Invite sent successfully to ${email}. The loan officer will receive an email to set up their account.`,
        officerId: inviteResult.user.id
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to create invite. Please try again.'
    }, { status: 500 });

  } catch (error) {
    console.error('Error in sendLoanOfficerInvite:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    }, { status: 500 });
  }
}
