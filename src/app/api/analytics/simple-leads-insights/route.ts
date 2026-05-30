import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { apiCacheHeaders, getApiCache, setApiCache } from '@/lib/api-cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CACHE_TTL = 30;

type OfficerRow = {
  user_id: string;
  users: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
};

type LeadRow = {
  id: string;
  status: string | null;
  created_at: string;
  updated_at: string | null;
  officer_id: string;
  company_id: string;
};

function buildOfficerStats(
  officer: OfficerRow,
  leads: LeadRow[],
) {
  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
  const lastActivity =
    leads.length > 0
      ? new Date(
          Math.max(...leads.map((l) => new Date(l.updated_at || l.created_at).getTime())),
        ).toLocaleDateString()
      : 'Never';

  const name =
    `${officer.users?.first_name || ''} ${officer.users?.last_name || ''}`.trim() ||
    'Unknown';

  return {
    id: officer.user_id,
    name,
    email: officer.users?.email || '',
    totalLeads,
    convertedLeads,
    conversionRate,
    lastActivity,
  };
}

async function buildInsightsForCompanies(companyIds: string[]) {
  if (!companyIds.length) return [];

  const [companiesRes, ucRes, leadsRes] = await Promise.all([
    supabase.from('companies').select('id, name').in('id', companyIds),
    supabase
      .from('user_companies')
      .select('company_id, user_id')
      .in('company_id', companyIds)
      .in('role', ['employee', 'loan_officer', 'officer']),
    supabase
      .from('leads')
      .select('id, status, created_at, updated_at, officer_id, company_id')
      .in('company_id', companyIds),
  ]);

  if (companiesRes.error) throw companiesRes.error;
  if (ucRes.error) throw ucRes.error;
  if (leadsRes.error) throw leadsRes.error;

  const userIds = [...new Set((ucRes.data ?? []).map((uc) => uc.user_id))];
  const { data: users, error: usersError } = userIds.length
    ? await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', userIds)
    : { data: [], error: null };

  if (usersError) throw usersError;

  const usersById = new Map((users ?? []).map((u) => [u.id, u]));
  const leadsByOfficer = new Map<string, LeadRow[]>();
  for (const lead of leadsRes.data ?? []) {
    const bucket = leadsByOfficer.get(lead.officer_id) ?? [];
    bucket.push(lead);
    leadsByOfficer.set(lead.officer_id, bucket);
  }

  const officersByCompany = new Map<string, OfficerRow[]>();
  for (const uc of ucRes.data ?? []) {
    const row: OfficerRow = {
      user_id: uc.user_id,
      users: usersById.get(uc.user_id) ?? null,
    };
    const list = officersByCompany.get(uc.company_id) ?? [];
    if (!list.some((o) => o.user_id === uc.user_id)) {
      list.push(row);
    }
    officersByCompany.set(uc.company_id, list);
  }

  return (companiesRes.data ?? []).map((company) => {
    const officers = officersByCompany.get(company.id) ?? [];
    const officersWithData = officers.map((officer) =>
      buildOfficerStats(officer, leadsByOfficer.get(officer.user_id) ?? []),
    );

    const totalLeads = officersWithData.reduce((sum, o) => sum + o.totalLeads, 0);
    const totalConverted = officersWithData.reduce((sum, o) => sum + o.convertedLeads, 0);
    const conversionRate = totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;

    return {
      ...company,
      loanOfficers: officersWithData,
      totalLeads,
      totalConverted,
      conversionRate,
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { role } = userData;
    const isSuperAdmin = role === 'super_admin';
    const isCompanyAdmin = role === 'company_admin';

    if (!isSuperAdmin && !isCompanyAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const cacheKey = `simple-leads:${user.id}:${companyId ?? 'all'}`;
    const cached = getApiCache<unknown>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: apiCacheHeaders(CACHE_TTL) });
    }

    let companyIds: string[] = [];

    if (isSuperAdmin) {
      if (companyId) {
        companyIds = [companyId];
      } else {
        const { data: allCompanies, error: companiesError } = await supabase
          .from('companies')
          .select('id');

        if (companiesError || !allCompanies) {
          return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
        }
        companyIds = allCompanies.map((c) => c.id);
      }
    } else {
      const { data: userCompany, error: companyError } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (companyError || !userCompany) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }
      companyIds = [userCompany.company_id];
    }

    const validCompanies = await buildInsightsForCompanies(companyIds);

    let payload: unknown;

    if (companyId) {
      const company = validCompanies[0];
      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }

      const officersData = company.loanOfficers.map((officer) => ({
        id: officer.id,
        firstName: officer.name.split(' ')[0] || '',
        lastName: officer.name.split(' ').slice(1).join(' ') || '',
        email: officer.email,
        companyId: company.id,
        companyName: company.name,
        totalLeads: officer.totalLeads,
        convertedLeads: officer.convertedLeads,
        conversionRate: officer.conversionRate,
        slug: officer.name.toLowerCase().replace(/\s+/g, '-'),
      }));

      payload = { success: true, officers: officersData };
    } else {
      const totalCompanies = validCompanies.length;
      const totalLoanOfficers = validCompanies.reduce(
        (sum, c) => sum + c.loanOfficers.length,
        0,
      );
      const totalLeads = validCompanies.reduce((sum, c) => sum + c.totalLeads, 0);
      const totalConverted = validCompanies.reduce((sum, c) => sum + c.totalConverted, 0);
      const overallConversionRate =
        totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;

      const allOfficers = validCompanies.flatMap((company) =>
        company.loanOfficers.map((officer) => ({
          ...officer,
          companyName: company.name,
          companyId: company.id,
        })),
      );

      payload = {
        success: true,
        companies: validCompanies.map((company) => ({
          id: company.id,
          name: company.name,
          totalOfficers: company.loanOfficers.length,
          totalLeads: company.totalLeads,
          convertedLeads: company.totalConverted,
          conversionRate: company.conversionRate,
        })),
        officers: allOfficers,
        totalCompanies,
        totalLoanOfficers,
        totalLeads,
        totalConverted,
        overallConversionRate,
      };
    }

    setApiCache(cacheKey, payload, CACHE_TTL);
    return NextResponse.json(payload, { headers: apiCacheHeaders(CACHE_TTL) });
  } catch (error) {
    console.error('Simple Leads API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
