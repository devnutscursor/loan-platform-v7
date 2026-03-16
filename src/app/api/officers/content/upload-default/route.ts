import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { uploadDefaultContentForOfficer } from '@/lib/default-content-uploader';

// NOTE: keep client creation outside handler for performance,
// but avoid throwing if env vars are missing – we'll validate inside POST.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export async function POST(request: NextRequest) {
  try {
    // Basic env validation – prevents cryptic runtime errors
    if (!supabase || !supabaseUrl || !supabaseServiceKey) {
      console.error('❌ upload-default: Supabase env vars are missing or invalid');
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase configuration is invalid on the server.',
        },
        { status: 500 }
      );
    }

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
      console.error('❌ upload-default: auth error', authError);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // 1) Find this officer's active employee companies
    let userCompanies: any[] = [];
    try {
      const { data, error } = await supabase
        .from('user_companies')
        .select('company_id, is_active, role')
        .eq('user_id', user.id)
        .eq('role', 'employee')
        .eq('is_active', true);

      if (error) {
        console.error(
          '❌ upload-default: error fetching user_companies',
          error
        );
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to verify company default content access (user companies).',
          },
          { status: 500 }
        );
      }

      userCompanies = data || [];
    } catch (ucError) {
      console.error(
        '❌ upload-default: unexpected exception querying user_companies',
        ucError
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to verify company default content access (user companies).',
        },
        { status: 500 }
      );
    }

    const companyIds = Array.from(
      new Set(userCompanies.map((uc: any) => uc.company_id).filter(Boolean))
    );

    let hasDefaultAccess = false;

    // 2) Check companies.has_default_content_access for those ids
    if (companyIds.length > 0) {
      try {
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id, has_default_content_access')
          .in('id', companyIds);

        if (companiesError) {
          console.error(
            '❌ upload-default: error fetching companies',
            companiesError
          );
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to verify company default content access (companies).',
            },
            { status: 500 }
          );
        }

        hasDefaultAccess = (companies || []).some(
          (c: any) => c.has_default_content_access === true
        );
      } catch (companiesException) {
        console.error(
          '❌ upload-default: unexpected exception querying companies',
          companiesException
        );
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to verify company default content access (companies).',
          },
          { status: 500 }
        );
      }
    }

    // If no company has default content access, just no-op with success
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

    // 3) Perform the actual upload (this function already has its own try/catch)
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
    console.error('❌ Error in upload-default endpoint (outer catch):', error);
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

