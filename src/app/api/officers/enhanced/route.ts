import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { apiCacheHeaders, getApiCache, setApiCache } from '@/lib/api-cache';

const CACHE_TTL = 30;

export async function GET(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Missing companyId' },
        { status: 400 },
      );
    }

    const cacheKey = `officers:enhanced:${companyId}`;
    const cached = getApiCache<unknown>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: apiCacheHeaders(CACHE_TTL) });
    }

    const { data: officersData, error: officersError } = await supabase
      .from('user_companies')
      .select(`
        user_id,
        role,
        is_active,
        joined_at,
        users!inner(
          id,
          email,
          first_name,
          last_name,
          nmls_number,
          is_active,
          deactivated,
          invite_status,
          invite_sent_at,
          invite_expires_at,
          ghl_user_id,
          ghl_user_created_at,
          created_at
        )
      `)
      .eq('company_id', companyId)
      .eq('role', 'employee');

    if (officersError) {
      return NextResponse.json(
        { success: false, error: officersError.message },
        { status: 500 },
      );
    }

    const officerIds = officersData.map((o) => o.user_id);

    const [leadsRes, publicLinksRes, templatesRes] = await Promise.all([
      supabase.from('leads').select('officer_id').eq('company_id', companyId),
      officerIds.length
        ? supabase
            .from('loan_officer_public_links')
            .select('user_id, is_active')
            .in('user_id', officerIds)
        : Promise.resolve({ data: [], error: null }),
      officerIds.length
        ? supabase
            .from('templates')
            .select('user_id, slug, is_selected')
            .in('user_id', officerIds)
            .eq('is_selected', true)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (leadsRes.error) {
      return NextResponse.json(
        { success: false, error: leadsRes.error.message },
        { status: 500 },
      );
    }
    if (publicLinksRes.error) {
      return NextResponse.json(
        { success: false, error: publicLinksRes.error.message },
        { status: 500 },
      );
    }
    if (templatesRes.error) {
      return NextResponse.json(
        { success: false, error: templatesRes.error.message },
        { status: 500 },
      );
    }

    const leadsCount: Record<string, number> = {};
    for (const lead of leadsRes.data ?? []) {
      leadsCount[lead.officer_id] = (leadsCount[lead.officer_id] || 0) + 1;
    }

    const hasPublicLink: Record<string, boolean> = {};
    for (const link of publicLinksRes.data ?? []) {
      if (link.is_active) hasPublicLink[link.user_id] = true;
    }

    const selectedTemplates: Record<string, string> = {};
    for (const template of templatesRes.data ?? []) {
      selectedTemplates[template.user_id] = template.slug;
    }

    const enhancedOfficers = officersData.map((officerCompany) => {
      const rawUser = officerCompany.users;
      const user = (Array.isArray(rawUser) ? rawUser[0] : rawUser) as {
        id: string;
        email: string;
        first_name: string | null;
        last_name: string | null;
        nmls_number: string | null;
        is_active: boolean;
        deactivated: boolean;
        invite_status: string | null;
        invite_sent_at: string | null;
        invite_expires_at: string | null;
        ghl_user_id: string | null;
        ghl_user_created_at: string | null;
        created_at: string;
      };
      const officerId = user.id;
      const joinedAt = officerCompany.joined_at ?? null;
      const membershipActive = officerCompany.is_active === true;
      const userActive = user.is_active === true;
      const isActive = userActive && membershipActive;

      return {
        id: officerId,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        nmlsNumber: user.nmls_number || null,
        isActive,
        deactivated: user.deactivated === true,
        inviteStatus: user.invite_status || null,
        inviteSentAt: user.invite_sent_at || null,
        inviteExpiresAt: user.invite_expires_at || null,
        joinedAt,
        ghlUserId: user.ghl_user_id || null,
        ghlUserCreatedAt: user.ghl_user_created_at || null,
        createdAt: joinedAt || user.created_at,
        totalLeads: leadsCount[officerId] || 0,
        hasPublicLink: hasPublicLink[officerId] || false,
        selectedTemplate: selectedTemplates[officerId] || null,
      };
    });

    const uniqueOfficers = enhancedOfficers.reduce<typeof enhancedOfficers>(
      (acc, officer) => {
        const existingIdx = acc.findIndex((item) => item.id === officer.id);
        if (existingIdx === -1) {
          acc.push(officer);
        } else if (officer.isActive && !acc[existingIdx].isActive) {
          acc[existingIdx] = officer;
        }
        return acc;
      },
      [],
    );

    const payload = { success: true, data: uniqueOfficers };
    setApiCache(cacheKey, payload, CACHE_TTL);
    return NextResponse.json(payload, { headers: apiCacheHeaders(CACHE_TTL) });
  } catch (error: unknown) {
    console.error('Unexpected error fetching enhanced officers:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
