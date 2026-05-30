import { NextRequest, NextResponse } from 'next/server';
import { db, leads } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
import { and, eq } from 'drizzle-orm';
import { companies, users } from '@/lib/db/schema';
import { validatePublicLeadTarget } from '@/lib/api-auth';
import { rateLimitByIp } from '@/lib/rate-limit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const LEADS_CACHE_TTL_MS = 30000;
const leadsCache = new Map<
  string,
  { data: { success: true; leads: any[] }; fetchedAt: number }
>();
const leadsFetchPromises = new Map<string, Promise<{ success: true; leads: any[] }>>();

type GhlOauthPayload = {
  access_token?: string;
  locationId?: string;
  companyId?: string;
  scope?: string;
};

function getGhlHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Version: '2021-07-28',
    Accept: 'application/json',
  };
}

function parsePipelineResponse(raw: any): { pipelineId?: string; stageId?: string } {
  const list =
    raw?.pipelines ??
    raw?.data?.pipelines ??
    raw?.data ??
    (Array.isArray(raw) ? raw : []);
  if (!Array.isArray(list) || list.length === 0) return {};

  const firstPipeline = list[0];
  const pipelineId =
    firstPipeline?.id ??
    firstPipeline?._id ??
    firstPipeline?.pipelineId;

  const stages =
    firstPipeline?.stages ??
    firstPipeline?.pipelineStages ??
    firstPipeline?.pipeline_stages ??
    [];

  const firstStage = Array.isArray(stages) && stages.length > 0 ? stages[0] : null;
  const stageId =
    firstStage?.id ??
    firstStage?._id ??
    firstStage?.pipelineStageId;

  return { pipelineId, stageId };
}

async function syncLeadToGhl(params: {
  companyId: string;
  officerId: string;
  leadId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loanAmount?: string | number;
}) {
  const [companyRow] = await db
    .select({
      id: companies.id,
      name: companies.name,
      ghlOauthPayload: companies.ghlOauthPayload,
      companyMetadata: companies.companyMetadata,
    })
    .from(companies)
    .where(eq(companies.id, params.companyId))
    .limit(1);

  if (!companyRow) throw new Error('Company not found for GHL sync');

  const oauth = (companyRow.ghlOauthPayload ?? {}) as GhlOauthPayload;
  const accessToken = oauth.access_token;
  const locationId = oauth.locationId;
  if (!accessToken || !locationId) {
    throw new Error('Company is not connected to GHL (missing access_token/locationId)');
  }

  const headers = getGhlHeaders(accessToken);
  const query = encodeURIComponent(params.email.trim().toLowerCase());

  // 1) Try find existing contact by email
  let contactId: string | undefined;
  const contactLookupRes = await fetch(
    `https://services.leadconnectorhq.com/contacts/?locationId=${encodeURIComponent(locationId)}&limit=50&query=${query}`,
    { method: 'GET', headers }
  );
  const contactLookupJson = await contactLookupRes.json().catch(() => null);
  const existingContacts =
    contactLookupJson?.contacts ??
    contactLookupJson?.data?.contacts ??
    contactLookupJson?.data ??
    [];
  if (Array.isArray(existingContacts) && existingContacts.length > 0) {
    const first = existingContacts[0];
    contactId = first?.id ?? first?._id ?? first?.contactId;
  }

  // 2) Create contact if not found
  if (!contactId) {
    const createContactRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        phone: params.phone,
      }),
    });
    const createContactJson = await createContactRes.json().catch(() => null);
    if (!createContactRes.ok) {
      throw new Error(
        `GHL contact create failed (${createContactRes.status}): ${JSON.stringify(createContactJson)}`
      );
    }
    contactId =
      createContactJson?.contact?.id ??
      createContactJson?.id ??
      createContactJson?._id ??
      createContactJson?.data?.id;
  }

  if (!contactId) throw new Error('Unable to resolve GHL contactId');

  // 3) Resolve assignee (officer user first, then company admin user fallback)
  const [officerRow] = await db
    .select({
      ghlUserId: users.ghlUserId,
    })
    .from(users)
    .where(eq(users.id, params.officerId))
    .limit(1);
  const companyMeta =
    companyRow.companyMetadata && typeof companyRow.companyMetadata === 'object'
      ? (companyRow.companyMetadata as Record<string, any>)
      : {};
  const fallbackAssignedTo =
    companyMeta?.ghlAdminUser?.response?.id ??
    companyMeta?.ghlAdminUser?.response?.user?.id ??
    null;
  const assignedTo = officerRow?.ghlUserId ?? fallbackAssignedTo ?? undefined;

  // 4) Fetch pipelines and use the first pipeline/stage for quick test flow
  const pipelineRes = await fetch(
    `https://services.leadconnectorhq.com/opportunities/pipelines?locationId=${encodeURIComponent(locationId)}`,
    { method: 'GET', headers }
  );
  const pipelineJson = await pipelineRes.json().catch(() => null);
  if (!pipelineRes.ok) {
    throw new Error(
      `GHL pipelines fetch failed (${pipelineRes.status}): ${JSON.stringify(pipelineJson)}`
    );
  }
  const { pipelineId, stageId } = parsePipelineResponse(pipelineJson);
  if (!pipelineId || !stageId) {
    throw new Error('No pipeline or stage found in GHL for this location');
  }

  // 5) Create opportunity
  const opportunityBody: Record<string, unknown> = {
    locationId,
    name: `${params.firstName} ${params.lastName} - Mortgage Lead`,
    pipelineId,
    pipelineStageId: stageId,
    contactId,
    status: 'open',
  };
  if (assignedTo) opportunityBody.assignedTo = assignedTo;
  const numericLoanAmount = Number(params.loanAmount ?? 0);
  if (!Number.isNaN(numericLoanAmount) && numericLoanAmount > 0) {
    opportunityBody.monetaryValue = numericLoanAmount;
  }

  const oppRes = await fetch('https://services.leadconnectorhq.com/opportunities/', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(opportunityBody),
  });
  const oppJson = await oppRes.json().catch(() => null);
  if (!oppRes.ok) {
    throw new Error(
      `GHL opportunity create failed (${oppRes.status}): ${JSON.stringify(oppJson)}`
    );
  }

  return {
    contactId,
    opportunityId:
      oppJson?.id ?? oppJson?._id ?? oppJson?.data?.id ?? oppJson?.opportunity?.id ?? null,
    pipelineId,
    stageId,
    assignedTo: assignedTo ?? null,
  };
}

function mapLeadRow(row: any) {
  return {
    id: row.id,
    companyId: row.company_id,
    officerId: row.officer_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    source: row.source,
    status: row.status,
    priority: row.priority,
    loanDetails: row.loan_details,
    propertyDetails: row.property_details,
    creditScore: row.credit_score,
    loanAmount: row.loan_amount,
    downPayment: row.down_payment,
    notes: row.notes,
    tags: row.tags,
    customFields: row.custom_fields,
    conversionStage: row.conversion_stage,
    conversionDate: row.conversion_date,
    applicationDate: row.application_date,
    approvalDate: row.approval_date,
    closingDate: row.closing_date,
    loanAmountClosed: row.loan_amount_closed,
    commissionEarned: row.commission_earned,
    responseTimeHours: row.response_time_hours,
    lastContactDate: row.last_contact_date,
    contactCount: row.contact_count ?? 0,
    leadQualityScore: row.lead_quality_score,
    geographicLocation: row.geographic_location,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const cacheKey = `leads:${user.id}`;
    const cached = leadsCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < LEADS_CACHE_TTL_MS) {
      const res = NextResponse.json(cached.data);
      res.headers.set('X-Cache', 'HIT');
      res.headers.set('Cache-Control', 'private, max-age=30');
      return res;
    }

    let promise = leadsFetchPromises.get(cacheKey);
    if (!promise) {
      promise = (async () => {
        const { data: rows, error } = await supabase
          .from('leads')
          .select('*')
          .eq('officer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        const payload = { success: true as const, leads: (rows ?? []).map(mapLeadRow) };
        leadsCache.set(cacheKey, { data: payload, fetchedAt: Date.now() });
        leadsFetchPromises.delete(cacheKey);
        return payload;
      })();
      leadsFetchPromises.set(cacheKey, promise);
    }

    const payload = await promise;
    const res = NextResponse.json(payload);
    res.headers.set('X-Cache', cached ? 'HIT' : 'MISS');
    res.headers.set('Cache-Control', 'private, max-age=30');
    return res;
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const limit = await rateLimitByIp(request, 'leads-create', 20, 3600);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    console.log('🚀 POST /api/leads - Starting request');
    
    const body = await request.json();
    const { firstName, lastName, email, phone, creditScore, loanDetails, userId, companyId, source, loanAmount, downPayment } = body;

    console.log('📝 Request body:', { firstName, lastName, email, phone: phone ? '***' : 'missing', creditScore, loanDetails: loanDetails ? 'present' : 'missing', userId, companyId });

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !loanDetails) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate that we have the required user and company IDs
    if (!userId || !companyId) {
      console.log('❌ Missing userId or companyId');
      return NextResponse.json(
        { error: 'Missing user or company information' },
        { status: 400 }
      );
    }

    const targetCheck = await validatePublicLeadTarget(userId, companyId);
    if (!targetCheck.ok) {
      return NextResponse.json(
        { error: targetCheck.message },
        { status: targetCheck.status },
      );
    }

    console.log('✅ Using provided company:', companyId, 'and officer:', userId);
    
    // Prepare lead data for insertion
    const leadData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      companyId,
      officerId: userId,
      source: source || 'rate_table', // Use provided source or default to 'rate_table'
      loanDetails: {
        productId: loanDetails.productId,
        lenderName: loanDetails.lenderName,
        loanProgram: loanDetails.loanProgram,
        loanType: loanDetails.loanType,
        loanTerm: loanDetails.loanTerm,
        interestRate: loanDetails.interestRate,
        apr: loanDetails.apr,
        monthlyPayment: loanDetails.monthlyPayment,
        fees: loanDetails.fees,
        points: loanDetails.points,
        credits: loanDetails.credits,
        lockPeriod: loanDetails.lockPeriod,
      },
      // Use provided loan amount and down payment, or use defaults
      loanAmount: loanAmount !== undefined && loanAmount !== null 
        ? loanAmount.toString() 
        : '0', // Default to 0 if not provided
      downPayment: downPayment !== undefined && downPayment !== null 
        ? downPayment.toString() 
        : '0', // Default to 0 if not provided
      creditScore: creditScore ? parseInt(creditScore.replace(/[^0-9]/g, '')) || 0 : 0, // Parse credit score or default to 0
      notes: `Lead generated from rate table. Product: ${loanDetails.loanProgram} from ${loanDetails.lenderName}`,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('💾 Inserting lead into database...');
    
    // Insert lead into database using Drizzle
    const [newLead] = await db.insert(leads).values(leadData).returning();

    console.log('✅ Lead created successfully:', {
      leadId: newLead.id,
      borrowerName: `${firstName} ${lastName}`,
      email,
      source: 'rate_table'
    });

    // Try GHL sync, but don't block lead creation if external sync fails.
    let ghlSync: any = null;
    let ghlSyncError: string | null = null;
    try {
      ghlSync = await syncLeadToGhl({
        companyId,
        officerId: userId,
        leadId: newLead.id,
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        loanAmount: leadData.loanAmount,
      });
      console.log('✅ Lead synced to GHL successfully:', ghlSync);
    } catch (syncError) {
      ghlSyncError =
        syncError instanceof Error ? syncError.message : String(syncError);
      console.error('⚠️ Lead GHL sync failed (lead still saved):', ghlSyncError);
    }

    return NextResponse.json({
      success: true,
      lead: {
        id: newLead.id,
        firstName: newLead.firstName,
        lastName: newLead.lastName,
        email: newLead.email,
        phone: newLead.phone,
        status: newLead.status,
        createdAt: newLead.createdAt
      },
      ghlSync,
      ghlSyncError,
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
