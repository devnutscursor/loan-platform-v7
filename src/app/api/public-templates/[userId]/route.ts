import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { templates } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';

// Cache configuration - revalidate every 60 seconds
export const revalidate = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const requestedTemplateSlug = searchParams.get('template');
    
    console.log('🔍 Fetching public template for userId:', userId, 'requested template:', requestedTemplateSlug);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    let selectedTemplate = [];

    // If a specific template is requested (preview mode), fetch both user and default in parallel
    if (requestedTemplateSlug) {
      console.log('🎨 Preview mode: Fetching specific template', requestedTemplateSlug);
      
      // Fetch user template and default template in parallel
      const [userTemplate, defaultTemplate] = await Promise.all([
        db
          .select()
          .from(templates)
          .where(
            and(
              eq(templates.userId, userId),
              eq(templates.slug, requestedTemplateSlug),
              eq(templates.isActive, true)
            )
          )
          .limit(1),
        db
          .select()
          .from(templates)
          .where(
            and(
              eq(templates.slug, requestedTemplateSlug),
              eq(templates.isDefault, true),
              eq(templates.isActive, true)
            )
          )
          .limit(1),
      ]);
      
      // Prefer user template over default
      selectedTemplate = userTemplate.length > 0 ? userTemplate : defaultTemplate;
    } else {
      // Normal mode: Fetch all candidate templates in parallel (reduces from 4 sequential to 1-2 queries)
      const [selectedUserTemplate, template1User, defaultTemplate1, anyDefaultTemplate] = await Promise.all([
        // Priority 1: User's selected template
        db
          .select()
          .from(templates)
          .where(
            and(
              eq(templates.userId, userId),
              eq(templates.isSelected, true),
              eq(templates.isActive, true)
            )
          )
          .limit(1),
        // Priority 2: User's template1
        db
          .select()
          .from(templates)
          .where(
            and(
              eq(templates.slug, 'template1'),
              eq(templates.userId, userId),
              eq(templates.isDefault, false),
              eq(templates.isActive, true)
            )
          )
          .limit(1),
        // Priority 3: Default template1
        db
          .select()
          .from(templates)
          .where(
            and(
              eq(templates.slug, 'template1'),
              eq(templates.isDefault, true),
              eq(templates.isActive, true)
            )
          )
          .limit(1),
        // Priority 4: Any default template
        db
          .select()
          .from(templates)
          .where(
            and(
              eq(templates.isDefault, true),
              eq(templates.isActive, true)
            )
          )
          .limit(1),
      ]);

      // Select template based on priority (first non-empty result)
      selectedTemplate = selectedUserTemplate.length > 0 
        ? selectedUserTemplate 
        : template1User.length > 0 
        ? template1User 
        : defaultTemplate1.length > 0 
        ? defaultTemplate1 
        : anyDefaultTemplate;
    }

    if (selectedTemplate.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No template found' },
        { status: 404 }
      );
    }

    const template = selectedTemplate[0];
    
    // Override template slug if a specific template was requested (for preview mode)
    const finalTemplate = requestedTemplateSlug 
      ? { ...template, slug: requestedTemplateSlug }
      : template;

    const response = NextResponse.json({
      success: true,
      data: {
        template: finalTemplate,
        pageSettings: null,
        metadata: {
          templateSlug: finalTemplate.slug,
          isCustomized: !finalTemplate.isDefault,
          isPublished: true,
        }
      },
    });

    // Add cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    return response;
  } catch (error) {
    console.error('Error fetching public template:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
