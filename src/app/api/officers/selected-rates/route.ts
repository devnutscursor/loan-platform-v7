import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db, selectedRates, userCompanies, companies, manualRates } from '@/lib/db';
import { getMortechMergedSelectedRatesForDisplay, type MortechMergedApiRateRow } from '@/lib/mortech/todaysRatesSnapshot';
import { eq, and } from 'drizzle-orm';
import { validatePublicLeadTarget } from '@/lib/api-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SELECTED_RATES_CACHE_TTL_MS = 30000;
const selectedRatesCache = new Map<
  string,
  { data: { success: true; rates: any[] }; fetchedAt: number }
>();
const selectedRatesFetchPromises = new Map<string, Promise<{ success: true; rates: any[] }>>();

function serializeMortechMergedRow(r: MortechMergedApiRateRow) {
  return {
    id: r.id,
    rateData: r.rateData,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
    ...(r.isGlobalSnapshot ? { isGlobalSnapshot: true as const } : {}),
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

      const publicCheck = await validatePublicLeadTarget(officerId, companyId);
      if (!publicCheck.ok) {
        return NextResponse.json({ error: publicCheck.message }, { status: publicCheck.status });
      }

      const companyRows = await db
        .select({ hasMortechSubscription: companies.hasMortechSubscription })
        .from(companies)
        .where(eq(companies.id, companyId))
        .limit(1);

      const isMortechCompany = companyRows[0]?.hasMortechSubscription !== false;
      if (!isMortechCompany) {
        const manualRows = await db
          .select()
          .from(manualRates)
          .where(and(eq(manualRates.officerId, officerId), eq(manualRates.companyId, companyId)))
          .orderBy(manualRates.createdAt);

        const res = NextResponse.json({
          success: true as const,
          rates: manualRows.map((row) => ({
            id: row.id,
            rateData: row.rateData,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          })),
        });
        res.headers.set('Cache-Control', 'public, max-age=60');
        return res;
      }

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

    if (!officerIdParam) {
      const [companyRow] = await db
        .select({ hasMortechSubscription: companies.hasMortechSubscription })
        .from(companies)
        .where(eq(companies.id, companyId))
        .limit(1);

      const isAuthMortech = companyRow?.hasMortechSubscription !== false;
      if (!isAuthMortech) {
        const manualRows = await db
          .select()
          .from(manualRates)
          .where(and(eq(manualRates.officerId, officerId), eq(manualRates.companyId, companyId)))
          .orderBy(manualRates.createdAt);

        const res = NextResponse.json({
          success: true as const,
          rates: manualRows.map((row) => ({
            id: row.id,
            rateData: row.rateData,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          })),
        });
        res.headers.set('Cache-Control', 'private, max-age=60');
        return res;
      }
    }

    const cacheKey = `selected-rates:${officerId}`;
    const cached = selectedRatesCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < SELECTED_RATES_CACHE_TTL_MS) {
      const res = NextResponse.json(cached.data);
      res.headers.set('X-Cache', 'HIT');
      res.headers.set(
        'Cache-Control',
        officerIdParam ? 'public, s-maxage=60, stale-while-revalidate=120' : 'private, max-age=30'
      );
      return res;
    }

    let promise = selectedRatesFetchPromises.get(cacheKey);
    if (!promise) {
      promise = (async () => {
        const merged = await getMortechMergedSelectedRatesForDisplay(officerId, companyId);
        const payload = {
          success: true as const,
          rates: merged.map(serializeMortechMergedRow),
        };
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
    res.headers.set(
      'Cache-Control',
      officerIdParam ? 'public, s-maxage=60, stale-while-revalidate=120' : 'private, max-age=30'
    );
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

    selectedRatesCache.delete(`selected-rates:${user.id}`);
    selectedRatesFetchPromises.delete(`selected-rates:${user.id}`);

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

