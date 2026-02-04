import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db, selectedRates, userCompanies } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SELECTED_RATES_CACHE_TTL_MS = 30000;
const selectedRatesCache = new Map<
  string,
  { data: { success: true; rates: any[] }; fetchedAt: number }
>();
const selectedRatesFetchPromises = new Map<string, Promise<{ success: true; rates: any[] }>>();

function mapRateRow(row: any) {
  return {
    id: row.id,
    rateData: row.rate_data,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * GET /api/officers/selected-rates
 * Fetch all selected rates for the authenticated officer or by officerId query param (for public access)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const officerIdParam = searchParams.get('officerId');

    let officerId: string;
    let companyId: string;

    if (officerIdParam) {
      officerId = officerIdParam;
      const { data: ucRows, error: ucError } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', officerId)
        .eq('is_active', true)
        .limit(1);

      if (ucError || !ucRows?.length) {
        return NextResponse.json({ error: 'Officer not found' }, { status: 404 });
      }
      companyId = (ucRows[0] as any).company_id;
    } else {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      officerId = user.id;
      const { data: ucRows, error: ucError } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (ucError || !ucRows?.length) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }
      companyId = (ucRows[0] as any).company_id;
    }

    const cacheKey = `selected-rates:${officerId}`;
    const cached = selectedRatesCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < SELECTED_RATES_CACHE_TTL_MS) {
      const res = NextResponse.json(cached.data);
      res.headers.set('X-Cache', 'HIT');
      res.headers.set('Cache-Control', 'private, max-age=30');
      return res;
    }

    let promise = selectedRatesFetchPromises.get(cacheKey);
    if (!promise) {
      promise = (async () => {
        const { data: rows, error } = await supabase
          .from('selected_rates')
          .select('id, rate_data, created_at, updated_at')
          .eq('officer_id', officerId)
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        const payload = { success: true as const, rates: (rows ?? []).map(mapRateRow) };
        selectedRatesCache.set(cacheKey, { data: payload, fetchedAt: Date.now() });
        selectedRatesFetchPromises.delete(cacheKey);
        return payload;
      })()
        .then((p) => p)
        .catch((err) => {
          selectedRatesFetchPromises.delete(cacheKey);
          throw err;
        });
      selectedRatesFetchPromises.set(cacheKey, promise);
    }

    const payload = await promise;
    const res = NextResponse.json(payload);
    res.headers.set('X-Cache', 'MISS');
    res.headers.set('Cache-Control', 'private, max-age=30');
    return res;
  } catch (error) {
    console.error('❌ Error fetching selected rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch selected rates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/officers/selected-rates
 * Add a new rate to selected rates
 */
export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's company ID
    const userCompanyResult = await db
      .select({ companyId: userCompanies.companyId })
      .from(userCompanies)
      .where(
        and(
          eq(userCompanies.userId, user.id),
          eq(userCompanies.isActive, true)
        )
      )
      .limit(1);

    if (userCompanyResult.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const companyId = userCompanyResult[0].companyId;

    // Parse request body
    const body = await request.json();
    const { rateData, searchParams } = body;

    if (!rateData) {
      return NextResponse.json(
        { error: 'rateData is required' },
        { status: 400 }
      );
    }

    // Validate rateData structure (should have at least id, rate, apr)
    if (!rateData.id || rateData.interestRate === undefined || rateData.apr === undefined) {
      return NextResponse.json(
        { error: 'Invalid rate data structure' },
        { status: 400 }
      );
    }

    // Merge search parameters into rateData if provided
    const rateDataWithSearchParams = searchParams
      ? {
          ...rateData,
          searchParams: {
            purchasePrice: searchParams.purchasePrice,
            downPayment: searchParams.downPayment,
            loanAmount: searchParams.loanAmount,
            creditScore: searchParams.creditScore,
            loanPurpose: searchParams.loanPurpose,
          },
        }
      : rateData;

    // Check if rate already exists - fetch ALL selected rates to check for duplicates
    const existingRates = await db
      .select()
      .from(selectedRates)
      .where(
        and(
          eq(selectedRates.officerId, user.id),
          eq(selectedRates.companyId, companyId)
        )
      );

    // Check if this specific rate is already selected
    // Compare multiple fields since multiple rates can have the same productId
    // Note: We ignore searchParams when checking for duplicates
    const rateId = rateDataWithSearchParams.id || rateDataWithSearchParams.productId;
    if (rateId) {
      const duplicateCheck = existingRates.find((r: any) => {
        const existing = r.rateData;
        if (!existing) return false;
        
        // Match by ID first
        const idMatch = existing.id === rateId || existing.productId === rateId;
        if (!idMatch) return false;
        
        // Verify it's the same rate by comparing unique characteristics (ignore searchParams)
        return (
          Math.abs((existing.interestRate || 0) - (rateDataWithSearchParams.interestRate || 0)) < 0.001 &&
          Math.abs((existing.apr || 0) - (rateDataWithSearchParams.apr || 0)) < 0.001 &&
          Math.abs((existing.monthlyPayment || 0) - (rateDataWithSearchParams.monthlyPayment || 0)) < 0.01
        );
      });
      
      if (duplicateCheck) {
        return NextResponse.json(
          { error: 'Rate already selected' },
          { status: 409 }
        );
      }
    }

    // Insert new selected rate
    const [newRate] = await db
      .insert(selectedRates)
      .values({
        officerId: user.id,
        companyId,
        rateData: rateDataWithSearchParams,
      })
      .returning();

    return NextResponse.json({
      success: true,
      rate: {
        id: newRate.id,
        rateData: newRate.rateData,
        createdAt: newRate.createdAt,
        updatedAt: newRate.updatedAt,
      },
    });

  } catch (error) {
    console.error('❌ Error adding selected rate:', error);
    return NextResponse.json(
      { error: 'Failed to add selected rate' },
      { status: 500 }
    );
  }
}

