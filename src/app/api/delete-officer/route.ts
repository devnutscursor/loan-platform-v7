import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(request: NextRequest) {
  try {
    const { officerId } = await request.json();

    if (!officerId) {
      return NextResponse.json({
        success: false,
        message: 'Officer ID is required.'
      }, { status: 400 });
    }

    // Delete user from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(officerId);
    
    if (authError) {
      console.error('Error deleting user from auth:', authError);
      return NextResponse.json({
        success: false,
        message: 'Failed to delete user from authentication system.'
      }, { status: 500 });
    }

    // Delete user from database
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', officerId);

    if (userError) {
      console.error('Error deleting user from database:', userError);
      return NextResponse.json({
        success: false,
        message: 'Failed to delete user from database.'
      }, { status: 500 });
    }

    // Delete user-company relationship
    const { error: companyError } = await supabase
      .from('user_companies')
      .delete()
      .eq('user_id', officerId);

    if (companyError) {
      console.error('Error deleting user-company relationship:', companyError);
      return NextResponse.json({
        success: false,
        message: 'Failed to delete user-company relationship.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Officer deleted successfully.'
    });

  } catch (error) {
    console.error('Error in deleteOfficer:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred.'
    }, { status: 500 });
  }
}
