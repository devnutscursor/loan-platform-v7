import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Enhanced in-memory cache for template data
const templateCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes - longer cache for better performance
const MAX_CACHE_SIZE = 1000; // Prevent memory leaks

// Helper function to get cache key
function getCacheKey(slug: string, userId: string): string {
  return `${slug}:${userId}`;
}

// Helper function to get cached data
function getCachedTemplate(cacheKey: string) {
  const cached = templateCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('✅ User Template API: Using cached data for:', cacheKey);
    return cached.data;
  }
  if (cached) {
    templateCache.delete(cacheKey);
  }
  return null;
}

// Helper function to set cached data with size management
function setCachedTemplate(cacheKey: string, data: any) {
  // Clean up expired entries first
  const now = Date.now();
  for (const [key, value] of templateCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      templateCache.delete(key);
    }
  }
  
  // Prevent cache from growing too large
  if (templateCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entries (simple LRU approximation)
    const entries = Array.from(templateCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2)); // Remove 20%
    toRemove.forEach(([key]) => templateCache.delete(key));
  }
  
  templateCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  console.log('💾 User Template API: Cached data for:', cacheKey, `(cache size: ${templateCache.size})`);
}

// GET /api/templates/user/[slug] - Get specific user template (customized or default)
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

    // Check cache first
    const cacheKey = getCacheKey(slug, targetUserId);
    const cachedData = getCachedTemplate(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Get user's company information
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

    // First, try to get user's customized template
    const { data: userTemplateData, error: userTemplateError } = await supabase
      .from('templates')
      .select('*')
      .eq('slug', slug)
      .eq('user_id', targetUserId)
      .eq('is_default', false)
      .eq('is_active', true)
      .limit(1);

    if (userTemplateError) {
      console.error('❌ User Template API: User template query error:', userTemplateError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user template' },
        { status: 500 }
      );
    }

    let finalTemplate;
    let isCustomized = false;

    if (userTemplateData && userTemplateData.length > 0) {
      // User has a customized version
      finalTemplate = userTemplateData[0];
      isCustomized = true;
      console.log('🔍 User Template API: Found user customized template');
    } else {
      // Fall back to default template
      const { data: defaultTemplateData, error: defaultTemplateError } = await supabase
        .from('templates')
        .select('*')
        .eq('slug', slug)
        .eq('is_default', true)
        .is('user_id', null)
        .eq('is_active', true)
        .limit(1);

      if (defaultTemplateError) {
        console.error('❌ User Template API: Default template query error:', defaultTemplateError);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch default template' },
          { status: 500 }
        );
      }

      if (!defaultTemplateData || defaultTemplateData.length === 0) {
        console.log('⚠️ User Template API: Template not found:', slug);
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 }
        );
      }

      finalTemplate = defaultTemplateData[0];
      isCustomized = false;
      console.log('🔍 User Template API: Using default template');
    }

    // Transform database field names to camelCase for frontend
    const transformedTemplate = {
      ...finalTemplate,
      headerModifications: finalTemplate.header_modifications || {},
      bodyModifications: finalTemplate.body_modifications || {},
      rightSidebarModifications: finalTemplate.right_sidebar_modifications || {}
    };

    console.log('🔍 User Template API: Final template modification fields:', {
      header_modifications: finalTemplate.header_modifications,
      body_modifications: finalTemplate.body_modifications,
      right_sidebar_modifications: finalTemplate.right_sidebar_modifications
    });

    console.log('🔍 User Template API: Transformed template modification fields:', {
      headerModifications: transformedTemplate.headerModifications,
      bodyModifications: transformedTemplate.bodyModifications,
      rightSidebarModifications: transformedTemplate.rightSidebarModifications
    });

    // Prepare response
    const response = {
      success: true,
      data: {
        template: transformedTemplate,
        userInfo: {
          userId: targetUserId,
          companyId,
          companyName,
          userRole,
          hasCustomSettings: isCustomized
        },
        metadata: {
          templateSlug: slug,
          isCustomized,
          isPublished: false // We'll add this later if needed
        }
      }
    };

    console.log('✅ User Template API: Response prepared:', {
      templateSlug: slug,
      isCustomized,
      templateId: finalTemplate.id
    });

    // Cache the response
    setCachedTemplate(cacheKey, response);

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