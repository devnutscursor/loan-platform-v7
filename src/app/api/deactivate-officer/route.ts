import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { officerId } = await request.json();

    if (!officerId) {
      return NextResponse.json({
        success: false,
        message: 'Officer ID is required.'
      }, { status: 400 });
    }

    // Update user to inactive
    const { error: userError } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', officerId);

    if (userError) {
      console.error('Error deactivating user:', userError);
      return NextResponse.json({
        success: false,
        message: 'Failed to deactivate user.'
      }, { status: 500 });
    }

    // Update user-company relationship to inactive
    const { error: companyError } = await supabase
      .from('user_companies')
      .update({ is_active: false })
      .eq('user_id', officerId);

    if (companyError) {
      console.error('Error deactivating user-company relationship:', companyError);
      return NextResponse.json({
        success: false,
        message: 'Failed to deactivate user-company relationship.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Officer deactivated successfully.'
    });

  } catch (error) {
    console.error('Error in deactivateOfficer:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred.'
    }, { status: 500 });
  }
}
