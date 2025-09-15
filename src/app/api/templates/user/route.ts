import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/templates/user - Get user's templates (both default and customized)
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

    // Get user's company information
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

    // Get user's customized templates (userId = user.id, isDefault = false)
    const { data: userTemplatesData, error: userTemplatesError } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', false)
      .eq('is_active', true);

    if (userTemplatesError) {
      console.error('❌ Templates User API: User templates query error:', userTemplatesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user templates' },
        { status: 500 }
      );
    }

    // Get default templates (isDefault = true, userId = null)
    const { data: defaultTemplatesData, error: defaultTemplatesError } = await supabase
      .from('templates')
      .select('*')
      .eq('is_default', true)
      .is('user_id', null)
      .eq('is_active', true);

    if (defaultTemplatesError) {
      console.error('❌ Templates User API: Default templates query error:', defaultTemplatesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch default templates' },
        { status: 500 }
      );
    }

    console.log('🔍 Templates User API: Templates found:', {
      userTemplatesCount: userTemplatesData?.length || 0,
      defaultTemplatesCount: defaultTemplatesData?.length || 0,
      userTemplates: userTemplatesData?.map(t => ({ slug: t.slug, name: t.name })) || [],
      defaultTemplates: defaultTemplatesData?.map(t => ({ slug: t.slug, name: t.name })) || []
    });

    // Prepare response
    const response = {
      success: true,
      data: {
        userTemplates: userTemplatesData || [], // User's customized templates
        defaultTemplates: defaultTemplatesData || [], // Default templates available to all users
        userInfo: {
          userId: user.id,
          email: user.email,
          companyId,
          companyName,
          userRole,
          hasCustomTemplates: (userTemplatesData?.length || 0) > 0
        }
      },
      count: {
        userTemplates: userTemplatesData?.length || 0,
        defaultTemplates: defaultTemplatesData?.length || 0,
        total: (userTemplatesData?.length || 0) + (defaultTemplatesData?.length || 0)
      }
    };

    console.log('✅ Templates User API: Response prepared:', {
      userTemplatesCount: userTemplatesData?.length || 0,
      defaultTemplatesCount: defaultTemplatesData?.length || 0,
      userHasCustomTemplates: (userTemplatesData?.length || 0) > 0
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

// POST /api/templates/user - Save user's template customization directly to templates table
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🔄 Templates User API: POST request started at:', new Date().toISOString());
  
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Templates User API: No authorization header');
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

    console.log('🔍 Templates User API: Save request:', {
      templateSlug,
      userId: user.id,
      hasCustomSettings: !!customSettings,
      isPublished,
      timestamp: new Date().toISOString()
    });

    console.log('🔍 Templates User API: Custom settings details:', {
      colors: customSettings?.colors,
      typography: customSettings?.typography,
      content: customSettings?.content,
      layout: customSettings?.layout,
      advanced: customSettings?.advanced,
      classes: customSettings?.classes,
      headerModifications: customSettings?.headerModifications,
      bodyModifications: customSettings?.bodyModifications,
      rightSidebarModifications: customSettings?.rightSidebarModifications
    });

    // Get user's company information
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

    // Get the default template to use as base
    const { data: defaultTemplateData, error: defaultTemplateError } = await supabase
      .from('templates')
      .select('*')
      .eq('slug', templateSlug)
      .eq('is_default', true)
      .is('user_id', null)
      .eq('is_active', true)
      .limit(1);

    if (defaultTemplateError) {
      console.error('❌ Templates User API: Default template query error:', defaultTemplateError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch default template' },
        { status: 500 }
      );
    }

    if (!defaultTemplateData || defaultTemplateData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Default template not found' },
        { status: 404 }
      );
    }

    const defaultTemplate = defaultTemplateData[0];

    // Check if user already has a customized version of this template
    const { data: existingUserTemplateData, error: existingTemplateError } = await supabase
      .from('templates')
      .select('*')
      .eq('slug', templateSlug)
      .eq('user_id', user.id)
      .eq('is_default', false)
      .eq('is_active', true)
      .limit(1);

    if (existingTemplateError) {
      console.error('❌ Templates User API: Existing template query error:', existingTemplateError);
      return NextResponse.json(
        { success: false, error: 'Failed to check existing template' },
        { status: 500 }
      );
    }

    let result;
    const now = new Date().toISOString();

    if (existingUserTemplateData && existingUserTemplateData.length > 0) {
      // Update existing user template
      const { data: updateResult, error: updateError } = await supabase
        .from('templates')
        .update({
          // Merge default template with custom settings
          colors: {
            ...(defaultTemplate.colors as any || {}),
            ...(customSettings?.colors || {})
          },
          typography: {
            ...(defaultTemplate.typography as any || {}),
            ...(customSettings?.typography || {})
          },
          content: {
            ...(defaultTemplate.content as any || {}),
            ...(customSettings?.content || {})
          },
          layout: {
            ...(defaultTemplate.layout as any || {}),
            ...(customSettings?.layout || {})
          },
          advanced: {
            ...(defaultTemplate.advanced as any || {}),
            ...(customSettings?.advanced || {})
          },
          classes: {
            ...(defaultTemplate.classes as any || {}),
            ...(customSettings?.classes || {})
          },
          // Add the new modification fields (using correct database column names)
          header_modifications: customSettings?.headerModifications || {},
          body_modifications: customSettings?.bodyModifications || {},
          right_sidebar_modifications: customSettings?.rightSidebarModifications || {},
          updated_at: now
        })
        .eq('id', existingUserTemplateData[0].id)
        .select();

      if (updateError) {
        console.error('❌ Templates User API: Update error:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update template' },
          { status: 500 }
        );
      }

      result = updateResult;
    } else {
      // Create new user template
      const { data: insertResult, error: insertError } = await supabase
        .from('templates')
        .insert({
          name: `${defaultTemplate.name} (Customized)`,
          slug: templateSlug,
          description: defaultTemplate.description,
          preview_image: defaultTemplate.preview_image,
          is_active: true,
          is_premium: defaultTemplate.is_premium,
          is_default: false,
          user_id: user.id,
          // Merge default template with custom settings
          colors: {
            ...(defaultTemplate.colors as any || {}),
            ...(customSettings?.colors || {})
          },
          typography: {
            ...(defaultTemplate.typography as any || {}),
            ...(customSettings?.typography || {})
          },
          content: {
            ...(defaultTemplate.content as any || {}),
            ...(customSettings?.content || {})
          },
          layout: {
            ...(defaultTemplate.layout as any || {}),
            ...(customSettings?.layout || {})
          },
          advanced: {
            ...(defaultTemplate.advanced as any || {}),
            ...(customSettings?.advanced || {})
          },
          classes: {
            ...(defaultTemplate.classes as any || {}),
            ...(customSettings?.classes || {})
          },
          // Add the new modification fields (using correct database column names)
          header_modifications: customSettings?.headerModifications || {},
          body_modifications: customSettings?.bodyModifications || {},
          right_sidebar_modifications: customSettings?.rightSidebarModifications || {}
        })
        .select();

      if (insertError) {
        console.error('❌ Templates User API: Insert error:', insertError);
        return NextResponse.json(
          { success: false, error: 'Failed to create template' },
          { status: 500 }
        );
      }

      result = insertResult;
    }

    const endTime = Date.now();
    console.log('✅ Templates User API: Template saved successfully in', endTime - startTime, 'ms:', {
      templateSlug,
      userId: user.id,
      templateId: result[0].id,
      isUpdate: existingUserTemplateData && existingUserTemplateData.length > 0
    });

    // Invalidate server-side cache for this user's template
    // Note: This is a simple approach - in production you might want to use Redis or similar
    const cacheKey = `${templateSlug}:${user.id}`;
    if (typeof global !== 'undefined' && (global as any).templateCache) {
      (global as any).templateCache.delete(cacheKey);
      console.log('🗑️ Templates User API: Invalidated server cache for:', cacheKey);
    }

    console.log('🔄 Templates User API: Sending response...');
    return NextResponse.json({
      success: true,
      data: {
        template: result[0],
        isUpdate: existingUserTemplateData && existingUserTemplateData.length > 0
      },
      message: 'Template saved successfully'
    });

  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}