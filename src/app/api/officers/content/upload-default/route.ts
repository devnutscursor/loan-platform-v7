import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { uploadDefaultContentForOfficer } from '@/lib/default-content-uploader';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Server-side: only upload default content if at least one
    // active company linked to this officer has default content access enabled.
    // Do this in two simple queries to avoid relying on Supabase relationship metadata.
    const { data: userCompanies, error: userCompaniesError } = await supabase
      .from('user_companies')
      .select('company_id, is_active, role')
      .eq('user_id', user.id)
      .eq('role', 'employee')
      .eq('is_active', true);

    if (userCompaniesError) {
      console.error(
        '❌ Error fetching user_companies for default content check:',
        userCompaniesError
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to verify company default content access',
        },
        { status: 500 }
      );
    }

    const companyIds = Array.from(
      new Set((userCompanies || []).map((uc: any) => uc.company_id).filter(Boolean))
    );

    let hasDefaultAccess = false;

    if (companyIds.length > 0) {
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, has_default_content_access')
        .in('id', companyIds);

      if (companiesError) {
        console.error(
          '❌ Error fetching companies for default content check:',
          companiesError
        );
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to verify company default content access',
          },
          { status: 500 }
        );
      }

      hasDefaultAccess = (companies || []).some(
        (c: any) => c.has_default_content_access === true
      );
    }

    if (!hasDefaultAccess) {
      return NextResponse.json({
        success: true,
        data: {
          faqsCount: 0,
          guidesCount: 0,
          videosCount: 0,
        },
        error:
          'Company does not have default content access enabled. Skipping upload.',
      });
    }

    const result = await uploadDefaultContentForOfficer(user.id);

    return NextResponse.json({
      success: result.success,
      data: {
        faqsCount: result.faqsCount,
        guidesCount: result.guidesCount,
        videosCount: result.videosCount,
      },
      error: result.error,
    });
  } catch (error) {
    console.error('❌ Error in upload-default endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload default content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

