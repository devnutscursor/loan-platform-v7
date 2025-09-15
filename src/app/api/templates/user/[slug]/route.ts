import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/templates/user/[slug] - Get specific user template with customizations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('🔍 User Template API: Request received:', {
      slug,
      userId,
      timestamp: new Date().toISOString()
    });

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ User Template API: Auth error:', authError);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Use provided userId or authenticated user's ID
    const targetUserId = userId || user.id;

    console.log('🔍 User Template API: Target user:', {
      targetUserId,
      authenticatedUserId: user.id,
      slug
    });

    // Get user's company information using Supabase client instead of Drizzle
    const { data: userCompanyData, error: userCompanyError } = await supabase
      .from('user_companies')
      .select(`
        user_id,
        company_id,
        companies!inner(name),
        role
      `)
      .eq('user_id', targetUserId)
      .eq('is_active', true)
      .eq('companies.is_active', true)
      .limit(1);

    if (userCompanyError) {
      console.error('❌ User Template API: User company query error:', userCompanyError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user company information' },
        { status: 500 }
      );
    }

    if (!userCompanyData || userCompanyData.length === 0) {
      console.log('⚠️ User Template API: User not associated with any company');
      return NextResponse.json(
        { success: false, error: 'User not associated with any company' },
        { status: 403 }
      );
    }

    const userCompany = userCompanyData[0];
    const companyId = userCompany.company_id;
    const companyName = (userCompany.companies as any).name;
    const userRole = userCompany.role;

    // Get the base template using Supabase client
    const { data: baseTemplateData, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .limit(1);

    if (templateError) {
      console.error('❌ User Template API: Template query error:', templateError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch template' },
        { status: 500 }
      );
    }

    if (!baseTemplateData || baseTemplateData.length === 0) {
      console.log('⚠️ User Template API: Template not found:', slug);
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Get user's custom settings for this specific template using Supabase client
    const { data: userPageSettingsData, error: settingsError } = await supabase
      .from('page_settings')
      .select('*')
      .eq('officer_id', targetUserId)
      .eq('template', slug)
      .limit(1);

    if (settingsError) {
      console.error('❌ User Template API: Settings query error:', settingsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user settings' },
        { status: 500 }
      );
    }

    console.log('🔍 User Template API: User settings for template:', {
      templateSlug: slug,
      hasCustomSettings: userPageSettingsData && userPageSettingsData.length > 0,
      isPublished: userPageSettingsData && userPageSettingsData.length > 0 ? userPageSettingsData[0].is_published : false
    });

    // Merge base template with user's custom settings
    let finalTemplate = baseTemplateData[0];
    
    if (userPageSettingsData && userPageSettingsData.length > 0) {
      const userSettings = userPageSettingsData[0];
      
      // Merge template with user's custom settings
      finalTemplate = {
        ...baseTemplateData[0],
        // Override template properties with user's custom settings
        colors: {
          ...(baseTemplateData[0].colors as any || {}),
          ...((userSettings.settings as any)?.colors || {})
        },
        typography: {
          ...(baseTemplateData[0].typography as any || {}),
          ...((userSettings.settings as any)?.typography || {})
        },
        content: {
          ...(baseTemplateData[0].content as any || {}),
          ...((userSettings.settings as any)?.content || {})
        },
        layout: {
          ...(baseTemplateData[0].layout as any || {}),
          ...((userSettings.settings as any)?.layout || {})
        },
        advanced: {
          ...(baseTemplateData[0].advanced as any || {}),
          ...((userSettings.settings as any)?.advanced || {})
        },
        classes: {
          ...(baseTemplateData[0].classes as any || {}),
          ...((userSettings.settings as any)?.classes || {})
        }
      };
    } else {
      // No custom settings, return base template
      finalTemplate = {
        ...baseTemplateData[0]
      };
    }

    // Prepare response
    const response = {
      success: true,
      data: {
        template: finalTemplate,
        userInfo: {
          userId: targetUserId,
          companyId,
          companyName,
          userRole,
          hasCustomSettings: userPageSettingsData && userPageSettingsData.length > 0
        },
        metadata: {
          templateSlug: slug,
          isCustomized: userPageSettingsData && userPageSettingsData.length > 0,
          isPublished: userPageSettingsData && userPageSettingsData.length > 0 ? userPageSettingsData[0].is_published : false
        }
      }
    };

    console.log('✅ User Template API: Response prepared:', {
      templateSlug: slug,
      hasCustomSettings: userPageSettingsData && userPageSettingsData.length > 0,
      isPublished: userPageSettingsData && userPageSettingsData.length > 0 ? userPageSettingsData[0].is_published : false
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ User Template API: Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}