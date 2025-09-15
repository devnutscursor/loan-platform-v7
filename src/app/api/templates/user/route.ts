import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/templates/user - Get templates with user-specific settings
export async function GET(request: NextRequest) {
  try {
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
      console.error('❌ Templates User API: Auth error:', authError);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('🔍 Templates User API: Authenticated user:', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
    });

    // Get user's company information using Supabase client
    const { data: userCompanyData, error: userCompanyError } = await supabase
      .from('user_companies')
      .select(`
        user_id,
        company_id,
        companies!inner(name),
        role
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('companies.is_active', true)
      .limit(1);

    if (userCompanyError) {
      console.error('❌ Templates User API: User company query error:', userCompanyError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user company information' },
        { status: 500 }
      );
    }

    if (!userCompanyData || userCompanyData.length === 0) {
      console.log('⚠️ Templates User API: User not associated with any company');
      return NextResponse.json(
        { success: false, error: 'User not associated with any company' },
        { status: 403 }
      );
    }

    const userCompany = userCompanyData[0];
    const companyId = userCompany.company_id;
    const companyName = (userCompany.companies as any).name;
    const userRole = userCompany.role;

    console.log('🔍 Templates User API: User company info:', {
      companyId,
      companyName,
      userRole
    });

    // Get user's page settings using Supabase client
    const { data: userPageSettingsData, error: settingsError } = await supabase
      .from('page_settings')
      .select('*')
      .eq('officer_id', user.id)
      .limit(1);

    if (settingsError) {
      console.error('❌ Templates User API: Settings query error:', settingsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user settings' },
        { status: 500 }
      );
    }

    console.log('🔍 Templates User API: User page settings:', {
      hasSettings: userPageSettingsData && userPageSettingsData.length > 0,
      template: userPageSettingsData && userPageSettingsData.length > 0 ? userPageSettingsData[0].template : null,
      isPublished: userPageSettingsData && userPageSettingsData.length > 0 ? userPageSettingsData[0].is_published : false
    });

    // Get all available templates using Supabase client
    const { data: allTemplatesData, error: templatesError } = await supabase
      .from('templates')
      .select('*')
      .eq('is_active', true);

    if (templatesError) {
      console.error('❌ Templates User API: Templates query error:', templatesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    console.log('🔍 Templates User API: Available templates:', {
      count: allTemplatesData?.length || 0,
      templates: allTemplatesData?.map(t => ({ slug: t.slug, name: t.name })) || []
    });

    // Get the base template and merge with user settings
    const { data: baseTemplateData, error: baseTemplateError } = await supabase
      .from('templates')
      .select('*')
      .eq('slug', 'template1')
      .limit(1);

    if (baseTemplateError) {
      console.error('❌ Templates User API: Base template query error:', baseTemplateError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch base template' },
        { status: 500 }
      );
    }

    let userTemplate = null;
    if (baseTemplateData && baseTemplateData.length > 0 && userPageSettingsData && userPageSettingsData.length > 0) {
      // Merge base template with user settings
      const userSettings = userPageSettingsData[0];
      
      if (baseTemplateData[0]) {
        userTemplate = {
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
          },
          // Add metadata about user customization
          isUserCustomized: true,
          userSettingsId: userSettings.id,
          lastUpdated: userSettings.updated_at,
          isPublished: userSettings.is_published
        };
      }
    }

    // Prepare response with both user template and all available templates
    const response = {
      success: true,
      data: {
        userTemplate, // User's customized template (null if no custom settings)
        availableTemplates: allTemplatesData || [], // All available templates for selection
        userInfo: {
          userId: user.id,
          email: user.email,
          companyId,
          companyName,
          userRole,
          hasCustomSettings: userPageSettingsData && userPageSettingsData.length > 0
        }
      },
      count: allTemplatesData?.length || 0
    };

    console.log('✅ Templates User API: Response prepared:', {
      hasUserTemplate: !!userTemplate,
      availableTemplatesCount: allTemplatesData?.length || 0,
      userHasCustomSettings: userPageSettingsData && userPageSettingsData.length > 0
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Templates User API: Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/templates/user - Save user's template selection and settings
export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { templateSlug, customSettings, isPublished } = body;
    
    if (!templateSlug) {
      return NextResponse.json(
        { success: false, error: 'Template slug is required' },
        { status: 400 }
      );
    }

    // Get user's company information using Supabase client
    const { data: userCompanyData, error: userCompanyError } = await supabase
      .from('user_companies')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1);

    if (userCompanyError) {
      console.error('❌ Templates User API: User company query error:', userCompanyError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user company information' },
        { status: 500 }
      );
    }

    if (!userCompanyData || userCompanyData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not associated with any company' },
        { status: 403 }
      );
    }

    const companyId = userCompanyData[0].company_id;

    // Get the template using Supabase client
    const { data: templateData, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('slug', templateSlug)
      .eq('is_active', true)
      .limit(1);

    if (templateError) {
      console.error('❌ Templates User API: Template query error:', templateError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch template' },
        { status: 500 }
      );
    }

    if (!templateData || templateData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    const template = templateData[0];

    // Check if user already has page settings using Supabase client
    const { data: existingSettingsData, error: existingSettingsError } = await supabase
      .from('page_settings')
      .select('*')
      .eq('officer_id', user.id)
      .limit(1);

    if (existingSettingsError) {
      console.error('❌ Templates User API: Existing settings query error:', existingSettingsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch existing settings' },
        { status: 500 }
      );
    }

    let pageSettingsResult;

    // Step 1: Save/Update pageSettings table using Supabase client
    if (existingSettingsData && existingSettingsData.length > 0) {
      // Update existing settings
      const { data: updateResult, error: updateError } = await supabase
        .from('page_settings')
        .update({
          template_id: template.id,
          template: templateSlug,
          settings: customSettings || {},
          is_published: isPublished ?? false,
          published_at: isPublished ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('officer_id', user.id)
        .select();

      if (updateError) {
        console.error('❌ Templates User API: Update error:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update settings' },
          { status: 500 }
        );
      }

      pageSettingsResult = updateResult;
    } else {
      // Create new settings
      const { data: insertResult, error: insertError } = await supabase
        .from('page_settings')
        .insert({
          company_id: companyId,
          officer_id: user.id,
          template_id: template.id,
          template: templateSlug,
          settings: customSettings || {},
          is_published: isPublished ?? false,
          published_at: isPublished ? new Date().toISOString() : null
        })
        .select();

      if (insertError) {
        console.error('❌ Templates User API: Insert error:', insertError);
        return NextResponse.json(
          { success: false, error: 'Failed to create settings' },
          { status: 500 }
        );
      }

      pageSettingsResult = insertResult;
    }

    // Step 2: User customizations are stored in pageSettings only
    // Base templates remain unchanged - customizations are merged at fetch time

    // Step 3: Create version history in pageSettingsVersions table using Supabase client
    const versionNumber = `v${Date.now()}`;
    const { data: versionResult, error: versionError } = await supabase
      .from('page_settings_versions')
      .insert({
        page_settings_id: pageSettingsResult[0].id,
        company_id: companyId,
        officer_id: user.id,
        template: templateSlug,
        settings: customSettings || {},
        version: versionNumber,
        is_auto_generated: false
      })
      .select();

    if (versionError) {
      console.error('❌ Templates User API: Version creation error:', versionError);
      return NextResponse.json(
        { success: false, error: 'Failed to create version history' },
        { status: 500 }
      );
    }

    console.log('✅ Templates User API: Complete save successful:', {
      pageSettingsId: pageSettingsResult[0].id,
      templateSlug,
      versionNumber,
      isPublished: isPublished ?? false
    });

    return NextResponse.json({
      success: true,
      data: {
        pageSettings: pageSettingsResult[0],
        version: versionResult[0]
      },
      message: 'Template settings saved successfully with version history'
    });

  } catch (error) {
    console.error('Error saving template settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save template settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}