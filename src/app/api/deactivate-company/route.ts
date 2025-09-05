import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json({
        success: false,
        message: 'Company ID is required.'
      }, { status: 400 });
    }

    // Update company to inactive
    const { error: companyError } = await supabase
      .from('companies')
      .update({ is_active: false })
      .eq('id', companyId);

    if (companyError) {
      console.error('Error deactivating company:', companyError);
      return NextResponse.json({
        success: false,
        message: 'Failed to deactivate company.'
      }, { status: 500 });
    }

    // Update company admin user to inactive
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('admin_user_id')
      .eq('id', companyId)
      .single();

    if (fetchError || !company?.admin_user_id) {
      console.error('Error fetching company admin user:', fetchError);
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch company admin user.'
      }, { status: 500 });
    }

    // Update admin user to inactive
    const { error: userError } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', company.admin_user_id);

    if (userError) {
      console.error('Error deactivating admin user:', userError);
      return NextResponse.json({
        success: false,
        message: 'Failed to deactivate admin user.'
      }, { status: 500 });
    }

    // Update user-company relationship to inactive
    const { error: userCompanyError } = await supabase
      .from('user_companies')
      .update({ is_active: false })
      .eq('company_id', companyId)
      .eq('user_id', company.admin_user_id);

    if (userCompanyError) {
      console.error('Error deactivating user-company relationship:', userCompanyError);
      return NextResponse.json({
        success: false,
        message: 'Failed to deactivate user-company relationship.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Company deactivated successfully.'
    });

  } catch (error) {
    console.error('Error in deactivateCompany:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred.'
    }, { status: 500 });
  }
}
