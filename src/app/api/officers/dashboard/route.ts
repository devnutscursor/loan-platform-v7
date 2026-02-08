import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const serviceSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

const DASHBOARD_CACHE_TTL_MS = 30000;
const dashboardCache = new Map<
  string,
  {
    data: { leads: any[]; publicLink: any | null; publicProfileTemplate: string; companyId?: string };
    fetchedAt: number;
  }
>();
const dashboardFetchPromises = new Map<
  string,
  Promise<{ leads: any[]; publicLink: any | null; publicProfileTemplate: string; companyId?: string }>
>();

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
    let companyId = searchParams.get('companyId');

    if (!companyId) {
      const { data: userCompany } = await serviceSupabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      const resolved = (userCompany as { company_id?: string } | null)?.company_id ?? null;
      if (!resolved) {
        return NextResponse.json(
          { success: false, error: 'companyId is required' },
          { status: 400 }
        );
      }
      companyId = resolved;
    }

    const cacheKey = `${user.id}:${companyId}`;
    const cached = dashboardCache.get(cacheKey);
    if (cached && (Date.now() - cached.fetchedAt) < DASHBOARD_CACHE_TTL_MS) {
      return NextResponse.json(
        { success: true, ...cached.data },
        { headers: { 'X-Cache': 'HIT', 'Cache-Control': 'private, max-age=30' } }
      );
    }

    const inFlight = dashboardFetchPromises.get(cacheKey);
    if (inFlight) {
      const data = await inFlight;
      return NextResponse.json(
        { success: true, ...data },
        { headers: { 'X-Cache': 'HIT', 'Cache-Control': 'private, max-age=30' } }
      );
    }

    const fetchPromise = (async () => {
      const supabase = await createRouteClient();
      const [leadsResult, publicLinkResult, selectedTemplate] = await Promise.all([
        supabase
          .from('leads')
          .select('id, first_name, last_name, status, priority, created_at')
          .eq('officer_id', user.id)
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('loan_officer_public_links')
          .select('public_slug, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single(),
        serviceSupabase
          .from('templates')
          .select('slug')
          .eq('user_id', user.id)
          .eq('is_selected', true)
          .eq('is_active', true)
          .limit(1)
      ]);

      if (leadsResult.error) {
        throw new Error(leadsResult.error.message);
      }
      if (publicLinkResult.error && publicLinkResult.status !== 406) {
        throw new Error(publicLinkResult.error.message);
      }
      if (selectedTemplate.error) {
        throw new Error(selectedTemplate.error.message);
      }

      const templateSlug = selectedTemplate.data?.[0]?.slug || 'template1';
      return {
        leads: leadsResult.data || [],
        publicLink: publicLinkResult.data || null,
        publicProfileTemplate: templateSlug,
        companyId
      };
    })();

    dashboardFetchPromises.set(cacheKey, fetchPromise);
    try {
      const data = await fetchPromise;
      dashboardCache.set(cacheKey, { data, fetchedAt: Date.now() });
      return NextResponse.json(
        { success: true, ...data },
        { headers: { 'X-Cache': 'MISS', 'Cache-Control': 'private, max-age=30' } }
      );
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
        { status: 500 }
      );
    } finally {
      dashboardFetchPromises.delete(cacheKey);
    }
  } catch (error) {
    console.error('❌ Officers dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
