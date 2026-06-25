import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { and, count, eq, sql } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/api-auth';
import { apiCacheHeaders, getApiCache, setApiCache } from '@/lib/api-cache';
import { db } from '@/lib/db';
import { companies, leads, userCompanies } from '@/lib/db/schema';

const CACHE_TTL = 30;

export async function GET(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  try {
    const auth = await requireSuperAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const cacheKey = 'companies:enhanced';
    const cached = getApiCache<unknown>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: apiCacheHeaders(CACHE_TTL) });
    }

    const [companiesRes, officerStats, leadStats] = await Promise.all([
      supabase
        .from('companies')
        .select(`
          id,
          name,
          slug,
          email,
          admin_email,
          invite_status,
          invite_sent_at,
          invite_expires_at,
          invite_token,
          admin_user_id,
          is_active,
          deactivated,
          company_metadata,
          ghl_oauth_payload,
          ghl_connected_at,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false }),
      db
        .select({
          companyId: userCompanies.companyId,
          totalOfficers: count(userCompanies.userId),
        })
        .from(userCompanies)
        .where(
          and(eq(userCompanies.role, 'employee'), eq(userCompanies.isActive, true)),
        )
        .groupBy(userCompanies.companyId),
      db
        .select({
          companyId: leads.companyId,
          totalLeads: count(leads.id),
          highPriorityLeads: sql<number>`count(*) filter (where ${leads.priority} = 'high')`,
          urgentPriorityLeads: sql<number>`count(*) filter (where ${leads.priority} = 'urgent')`,
          convertedLeads: sql<number>`count(*) filter (where ${leads.status} = 'converted')`,
        })
        .from(leads)
        .groupBy(leads.companyId),
    ]);

    if (companiesRes.error) {
      return NextResponse.json(
        { success: false, error: companiesRes.error.message },
        { status: 500 },
      );
    }

    const officersByCompany = new Map(
      officerStats.map((row) => [row.companyId, Number(row.totalOfficers)]),
    );
    const leadsByCompany = new Map(
      leadStats.map((row) => [
        row.companyId,
        {
          totalLeads: Number(row.totalLeads),
          highPriorityLeads: Number(row.highPriorityLeads),
          urgentPriorityLeads: Number(row.urgentPriorityLeads),
          convertedLeads: Number(row.convertedLeads),
        },
      ]),
    );

    const enhancedCompanies = (companiesRes.data ?? []).map((company) => {
      const leadRow = leadsByCompany.get(company.id);
      return {
        ...company,
        totalOfficers: officersByCompany.get(company.id) ?? 0,
        activeOfficers: officersByCompany.get(company.id) ?? 0,
        totalLeads: leadRow?.totalLeads ?? 0,
        highPriorityLeads: leadRow?.highPriorityLeads ?? 0,
        urgentPriorityLeads: leadRow?.urgentPriorityLeads ?? 0,
        convertedLeads: leadRow?.convertedLeads ?? 0,
      };
    });

    const payload = { success: true, data: enhancedCompanies };
    setApiCache(cacheKey, payload, CACHE_TTL);
    return NextResponse.json(payload, { headers: apiCacheHeaders(CACHE_TTL) });
  } catch (error: unknown) {
    console.error('Unexpected error fetching enhanced companies:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
