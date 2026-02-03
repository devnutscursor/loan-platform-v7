import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/client';
import { db } from '@/lib/db';
import { templates } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

    let user = null;
    let authError = null;

    if (token) {
      const supabaseClient = createClient();
      const result = await supabaseClient.auth.getUser(token);
      user = result.data.user;
      authError = result.error;
    } else {
      const supabase = await createRouteClient();
      const result = await supabase.auth.getUser();
      user = result.data.user;
      authError = result.error;
    }
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'companyId is required' },
        { status: 400 }
      );
    }

    const supabase = await createRouteClient();
    const [leadsResult, publicLinkResult, selectedTemplate] = await Promise.all([
      supabase
        .from('leads')
        .select('id, first_name, last_name, status, priority, created_at')
        .eq('officer_id', user.id)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('loan_officer_public_links')
        .select('public_slug, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single(),
      db
        .select({ slug: templates.slug })
        .from(templates)
        .where(
          and(
            eq(templates.userId, user.id),
            eq(templates.isSelected, true),
            eq(templates.isActive, true)
          )
        )
        .limit(1)
    ]);

    if (leadsResult.error) {
      return NextResponse.json(
        { success: false, error: leadsResult.error.message },
        { status: 500 }
      );
    }

    const templateSlug = selectedTemplate?.[0]?.slug || 'template1';

    return NextResponse.json({
      success: true,
      leads: leadsResult.data || [],
      publicLink: publicLinkResult.data || null,
      publicProfileTemplate: templateSlug
    });
  } catch (error) {
    console.error('❌ Officers dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
