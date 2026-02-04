import { NextRequest, NextResponse } from 'next/server';
import { db, leads } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const LEADS_CACHE_TTL_MS = 30000;
const leadsCache = new Map<
  string,
  { data: { success: true; leads: any[] }; fetchedAt: number }
>();
const leadsFetchPromises = new Map<string, Promise<{ success: true; leads: any[] }>>();

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
      }
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
