import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createMortechAPI, type MortechQuote } from '@/lib/mortech/api';
import { BUCKET_PRODUCT_IDS } from '@/lib/mortech/programBuckets';
import { checkRateLimit, recordApiCall } from '@/lib/mortech/rate-limit';
import { checkEmailRateLimit, recordEmailApiCall } from '@/lib/mortech/email-rate-limit';
import { db, userCompanies } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

const PROGRAM_TERM_PRODUCT_IDS: Record<string, Partial<Record<10 | 20 | 25 | 30, number>>> = {
  conv: { 10: 1, 20: 3, 25: 40, 30: 4 },
  fha: { 10: 635, 20: 209, 25: 1877, 30: 23 },
  va: { 10: 636, 20: 189, 25: 1878, 30: 26 },
  // Non Conf fixed mappings for Jumbo (10-year unavailable in current catalog selection).
  jumbo: { 20: 101, 25: 344, 30: 15 },
  // Second-home uses conforming products with occupancy=2.
  second_home: { 10: 1, 20: 3, 25: 40, 30: 4 },
  home_ready: { 10: 2416, 20: 2418, 30: 2420 },
  home_possible: { 10: 2440, 20: 970, 30: 971 },
};

function normalizeOccupancyCode(raw: unknown): 0 | 1 | 2 {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    if (raw === 2) return 2;
    if (raw === 1) return 1;
    return 0;
  }

  const value = String(raw ?? '').toLowerCase().trim();
  if (!value) return 0;

  if (
    value === '2' ||
    value === 'secondary' ||
    value === 'secondhome' ||
    value === 'second home'
  ) {
    return 2;
  }

  if (
    value === '1' ||
    value === 'investment' ||
    value === 'nonowner' ||
    value === 'non-owner' ||
    value === 'non owner'
  ) {
    return 1;
  }

  return 0;
}

function resolveOccupancyCode(raw: unknown, programKey?: string): 0 | 1 | 2 {
  if (programKey === 'second_home') {
    // RateCaddy mapping required by client:
    // 0 = Owner occupied, 1 = Non-owner occupied, 2 = Second home
    return 2;
  }
  return normalizeOccupancyCode(raw);
}

function parseLoanTermYears(rawTerm: unknown): 10 | 20 | 25 | 30 {
  const asString = String(rawTerm ?? '').toLowerCase().trim();
  if (asString.includes('10')) return 10;
  if (asString.includes('20')) return 20;
  if (asString.includes('25')) return 25;
  return 30;
}

function normalizeProgramKey(categoryRaw: string): string | undefined {
  const c = categoryRaw.toLowerCase().trim();
  if (!c) return undefined;

  // Existing bucket ids from current app flows
  if (c.startsWith('conv_') || c === 'conforming' || c === 'conf' || c === 'conventional') return 'conv';
  if (c.startsWith('fha_') || c === 'fha') return 'fha';
  if (c.startsWith('va_') || c === 'va') return 'va';
  if (c.startsWith('jumbo_') || c === 'jumbo') return 'jumbo';
  if (c.startsWith('second_home_') || c.includes('second home')) return 'second_home';
  if (c.startsWith('home_ready_') || c.includes('home ready')) return 'home_ready';
  if (c.startsWith('home_possible_') || c.includes('home possible') || c.includes('home poss')) return 'home_possible';

  return undefined;
}

/**
 * Custom Quote: 3 options aligned with Today’s Rates PAR logic and Mortech XML order.
 * Mortech XML:
 *   - <ratesheet_price> → quote.executionPrice (0–100 scale).
 *   - quote_detail.$.price → quote.points (borrower discount points; 0.000 = PAR).
 *
 * Rules:
 *   - PAR: same as Today’s Rates / cron — among rows with price delta ≈ 0.000, pick lowest APR
 *     (fallback: nearest to zero points, then lowest APR if no exact zero).
 *   - quotes[] order matches XML `<quote>` order (consecutive ladder).
 *   - Lowest Rate: first quote **before** PAR in that order that is not skipped.
 *   - Higher Rate: first quote **after** PAR that is not skipped.
 *   - Skip “neighbor” rows that repeat PAR: another price≈0.000 line, or same rate+APR as the chosen PAR row
 *     (so we land on the first distinct previous/next rung).
 *
 * Verify: curl -X POST http://localhost:3000/api/mortech/search -H "Content-Type: application/json" \
 *   -d '{"propertyZip":"95825","appraisedvalue":500000,"loan_amount":400000,"fico":740,"loanpurpose":"Purchase","proptype":"Single Family","occupancy":"Primary","loanProduct1":"30 year fixed","reduceToThree":true}'
 * Response rates[] may be 1–3 items with quoteType: "Lowest Rate" | "PAR" | "Higher Rate".
 */
function pickThreeQuotesByPrice(quotes: MortechQuote[]): { quote: MortechQuote; quoteType: 'Lowest Rate' | 'PAR' | 'Higher Rate' }[] {
  if (!quotes.length) return [];

  const EPS = 1e-6;
  const getPoints = (q: MortechQuote) =>
    typeof q.points === 'number' && Number.isFinite(q.points) ? q.points : Number.POSITIVE_INFINITY;
  const getApr = (q: MortechQuote) =>
    typeof q.apr === 'number' && Number.isFinite(q.apr) ? q.apr : Number.POSITIVE_INFINITY;

  const isParRow = (q: MortechQuote) => Math.abs(getPoints(q)) <= EPS;

  const sameRateApr = (a: MortechQuote, b: MortechQuote) =>
    Math.abs(a.rate - b.rate) <= EPS && Math.abs(a.apr - b.apr) <= EPS;

  /** PAR index in `quotes` (XML order): among price≈0, lowest APR; tie → first in file. */
  function pickParIndex(): number {
    let bestIdx = -1;
    let bestApr = Infinity;
    for (let i = 0; i < quotes.length; i++) {
      if (!isParRow(quotes[i])) continue;
      const a = getApr(quotes[i]);
      if (a < bestApr - 1e-9) {
        bestApr = a;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) return bestIdx;

    // No exact 0.000: nearest to zero points, then lowest APR (matches refreshSelectedRates pickParQuoteByPoints).
    let bestIdx2 = 0;
    let bestAbs = Infinity;
    for (let i = 0; i < quotes.length; i++) {
      const p = getPoints(quotes[i]);
      const abs = Number.isFinite(p) ? Math.abs(p) : 9999;
      if (abs < bestAbs - 1e-9) {
        bestAbs = abs;
        bestIdx2 = i;
      } else if (Math.abs(abs - bestAbs) <= EPS) {
        if (getApr(quotes[i]) < getApr(quotes[bestIdx2])) bestIdx2 = i;
      }
    }
    return bestIdx2;
  }

  const parIdx = pickParIndex();
  const par = quotes[parIdx];

  const shouldSkipNeighbor = (q: MortechQuote) => isParRow(q) || sameRateApr(q, par);

  const ordered: { quote: MortechQuote; quoteType: 'Lowest Rate' | 'PAR' | 'Higher Rate' }[] = [];

  let j = parIdx - 1;
  while (j >= 0 && shouldSkipNeighbor(quotes[j])) j--;
  if (j >= 0) {
    ordered.push({ quote: quotes[j], quoteType: 'Lowest Rate' });
  }

  ordered.push({ quote: par, quoteType: 'PAR' });

  let k = parIdx + 1;
  while (k < quotes.length && shouldSkipNeighbor(quotes[k])) k++;
  if (k < quotes.length) {
    ordered.push({ quote: quotes[k], quoteType: 'Higher Rate' });
  }

  return ordered;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return null;
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
    return null;
  }

  return {
    user,
    companyId: userCompanyResult[0].companyId,
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 GET /api/mortech/search - Starting Mortech rate search');

    // Check authentication and rate limit
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(auth.user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          rateLimit: {
            remaining: rateLimit.remaining,
            resetAt: rateLimit.resetAt,
            used: rateLimit.used,
          },
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Extract search parameters - EXACTLY as test script
    const loanAmount = parseFloat(searchParams.get('loanAmount') || '0');
    const propertyValue = parseFloat(searchParams.get('propertyValue') || '0');
    const creditScore = parseInt(searchParams.get('creditScore') || '740');
    const propertyZip = searchParams.get('propertyZip') || '';
    const loanPurpose = searchParams.get('loanPurpose') as 'Purchase' | 'Refinance' || 'Purchase';
    const propertyType = searchParams.get('propertyType') as 'Single Family' | 'Condo' | 'Townhouse' | 'Multi-Family' || 'Single Family';
    const occupancy = resolveOccupancyCode(searchParams.get('occupancy'));
    const loanTerm = searchParams.get('loanTerm') || '30 year fixed';
    const filterId = searchParams.get('filterId') || undefined;
    const includeMI = searchParams.get('includeMI') === 'true';
    // Additional custom rate parameters
    const waiveEscrow = searchParams.get('waiveEscrow') === 'true';
    const militaryVeteran = searchParams.get('militaryVeteran') === 'true';
    const lockDays = searchParams.get('lockDays') || '30';
    const secondMortgageAmountParam = searchParams.get('secondMortgageAmount') || '0';
    const safeSecondMortgageAmount = (() => {
      if (!secondMortgageAmountParam || secondMortgageAmountParam === '' || secondMortgageAmountParam === '0') return 0;
      const parsed = parseFloat(secondMortgageAmountParam);
      return isNaN(parsed) ? 0 : parsed;
    })();

    // Validate required parameters - EXACTLY as test script
    if (!loanAmount || !propertyValue || !propertyZip) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: loanAmount, propertyValue, propertyZip'
      }, { status: 400 });
    }

    console.log('📋 Search Parameters:', {
      loanAmount,
      propertyValue,
      creditScore,
      propertyZip,
      loanPurpose,
      propertyType,
      occupancy,
      loanTerm,
      filterId,
      includeMI
    });

    // Create Mortech API instance
    const mortechAPI = createMortechAPI();

    // Prepare request - matching test script format EXACTLY
    const mortechRequest = {
      propertyZip,
      appraisedvalue: propertyValue,
      loan_amount: loanAmount,
      fico: creditScore,
      loanpurpose: loanPurpose,
      proptype: propertyType,
      occupancy,
      loanProduct1: loanTerm,
      // filterId is optional
      ...(filterId && { filterId }),
      ...(includeMI && { 
        pmiCompany: -999, // Best MI company
        noMI: 0, // Borrower paid MI
      }),
      // Additional custom rate parameters - only include if they have meaningful values
      ...(waiveEscrow === true && { waiveEscrow: true }),
      ...(militaryVeteran === true && { militaryVeteran: true }),
      ...(lockDays && lockDays !== '30' && { lockDays }),
      ...(safeSecondMortgageAmount > 0 && { secondMortgageAmount: safeSecondMortgageAmount })
    };

    // Call Mortech API
    const response = await mortechAPI.getRates(mortechRequest);

    if (!response.success) {
      console.error('❌ Mortech API Error:', response.error);
      return NextResponse.json({
        success: false,
        error: response.error || 'Failed to fetch rates from Mortech'
      }, { status: 500 });
    }

    // Transform response to match your existing frontend format
    const transformedRates = response.quotes?.map(quote => ({
      id: quote.productId,
      lenderName: quote.vendorName,
      productName: quote.vendorProductCode || quote.vendorProductName,
      loanProgram: quote.productDesc,
      loanType: quote.termType,
      loanTerm: quote.productTerm,
      interestRate: quote.rate,
      apr: quote.apr,
      monthlyPayment: quote.monthlyPayment,
      points: quote.points,
      originationFee: quote.originationFee,
      upfrontFee: quote.upfrontFee,
      monthlyPremium: quote.monthlyPremium,
      downPayment: quote.downPayment,
      loanAmount: quote.loanAmount,
      lockTerm: quote.lockTerm,
      pricingStatus: quote.pricingStatus,
      lastUpdate: quote.lastUpdate,
      fees: quote.fees.map(fee => ({
        description: fee.description,
        amount: fee.feeamount,
        section: fee.section,
        paymentType: fee.paymenttype,
        prepaid: fee.prepaid
      })),
      eligibility: quote.eligibility,
      // Additional fields for compatibility
      credits: 0, // Not provided by Mortech, set to 0
      lockPeriod: quote.lockTerm,
    })) || [];

    console.log(`✅ Found ${transformedRates.length} rates from Mortech`);
    console.log('📊 Transformed rates sample:', transformedRates);
    console.log('🔍 Response structure:', {
      success: true,
      ratesCount: transformedRates.length,
      source: 'mortech_api',
      isMockData: false
    });

    return NextResponse.json({
      success: true,
      rates: transformedRates,
      ratesCount: transformedRates.length,
      source: 'mortech_api',
      isMockData: false,
      rateLimit: {
        remaining: rateLimit.remaining - 1,
        resetAt: rateLimit.resetAt,
        used: rateLimit.used + 1,
      },
      searchParams: {
        loanAmount,
        propertyValue,
        creditScore,
        propertyZip,
        loanPurpose,
        propertyType,
        occupancy,
        loanTerm,
        filterId,
        includeMI,
        waiveEscrow,
        militaryVeteran,
        lockDays,
        secondMortgageAmount: safeSecondMortgageAmount
      }
    });

  } catch (error) {
    console.error('❌ Mortech search error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/mortech/search - Starting Mortech rate search');

    const body = await request.json();
    console.log('📥 Raw request body:', body);

    // Check authentication - support both authenticated and unauthenticated (email-based) users
    const auth = await getAuthenticatedUser(request);
    let rateLimit: { allowed: boolean; remaining: number; resetAt: Date; used: number; verified?: boolean };
    let userId: string | null = null;
    let companyId: string | null = null;
    let userEmail: string | null = null;

    if (auth) {
      // Authenticated user flow (existing)
      userId = auth.user.id;
      companyId = auth.companyId;
      rateLimit = await checkRateLimit(auth.user.id);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            rateLimit: {
              remaining: rateLimit.remaining,
              resetAt: rateLimit.resetAt,
              used: rateLimit.used,
            },
          },
          { status: 429 }
        );
      }
      
      // For authenticated users on public profiles, also check email verification if email is provided
      // This allows testing email verification flow even when logged in
      const { email } = body;
      if (email && typeof email === 'string') {
        userEmail = email.toLowerCase().trim();
        const emailRateLimit = await checkEmailRateLimit(userEmail);
        
        if (!emailRateLimit.verified) {
          // Email provided but not verified - return error
          return NextResponse.json(
            {
              success: false,
              error: 'Email not verified. Please verify your email before searching for rates.',
            },
            { status: 403 }
          );
        }
        
        // Enforce email rate limit for public profiles (3/day)
        // This applies even to authenticated users when using public profile flow
        if (!emailRateLimit.allowed) {
          return NextResponse.json(
            {
              success: false,
              error: 'Rate limit exceeded. You have reached the maximum of 3 searches per day.',
              rateLimit: {
                remaining: emailRateLimit.remaining,
                resetAt: emailRateLimit.resetAt,
                used: emailRateLimit.used,
              },
            },
            { status: 429 }
          );
        }
      }
    } else {
      // Unauthenticated user flow - check for email verification
      const { email } = body;
      if (!email || typeof email !== 'string') {
        return NextResponse.json(
          { error: 'Email is required for unauthenticated users' },
          { status: 401 }
        );
      }

      userEmail = email.toLowerCase().trim();
      const emailRateLimit = await checkEmailRateLimit(userEmail);

      if (!emailRateLimit.verified) {
        return NextResponse.json(
          {
            success: false,
            error: 'Email not verified. Please verify your email before searching for rates.',
          },
          { status: 403 }
        );
      }

      if (!emailRateLimit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded. You have reached the maximum of 3 searches per day.',
            rateLimit: {
              remaining: emailRateLimit.remaining,
              resetAt: emailRateLimit.resetAt,
              used: emailRateLimit.used,
            },
          },
          { status: 429 }
        );
      }

      rateLimit = emailRateLimit;
    }
    
    // Accept BOTH formats for flexibility
    const {
      // Test script format (preferred - exact match)
      loan_amount,
      appraisedvalue,
      fico,
      propertyZip,
      loanpurpose,
      proptype,
      occupancy,
      loanProduct1,
      // Old format (for backward compatibility)
      loanAmount,
      propertyValue,
      creditScore,
      loanPurpose,
      propertyType,
      loanTerm,
      // Optional params
      filterId,
      includeMI = false,
      waiveEscrow = false,
      militaryVeteran = false,
      lockDays = '30',
      secondMortgageAmount = 0 as number | string,
      productCategory,
      /** When true (e.g. Custom Rates tab), return only 3 quotes: Lowest Rate (~99), PAR (~100), Higher Rate (≥100) by Mortech price. */
      reduceToThree = false,
      // Additional context (non-test-script fields)
      propertyState,
      vaFirstTimeUse,
    } = body;
    
    // Use test script format if provided, otherwise fall back to old format.
    // IMPORTANT: use nullish coalescing so numeric 0 values (e.g. proptype=0) are preserved.
    const finalLoanAmount = loan_amount ?? loanAmount;
    const finalPropertyValue = appraisedvalue ?? propertyValue;
    const finalCreditScore = fico ?? creditScore ?? 740;
    const finalLoanPurpose = (loanpurpose ?? loanPurpose ?? 'Purchase') as 'Purchase' | 'Refinance';
    const finalPropertyType = proptype ?? propertyType ?? 'Single Family';
    const finalLoanTerm = loanProduct1 || loanTerm || '30 year fixed';
    // TEMP: Default propertyState to 'CA' when not provided, so Mortech productList requests work
    const finalPropertyState = propertyState || 'CA';
    // Always send a lock period; default to 30 days
    const finalLockDays = lockDays || '30';

    // Handle empty string values for numeric fields
    const safeSecondMortgageAmount = (() => {
      // Handle both string and number types, and empty strings
      if (secondMortgageAmount === undefined || secondMortgageAmount === null) return 0;
      if (typeof secondMortgageAmount === 'string') {
        if (secondMortgageAmount === '' || secondMortgageAmount === '0') return 0;
        const parsed = parseInt(secondMortgageAmount, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
      // It's already a number
      return secondMortgageAmount;
    })();

    // Validate required parameters - EXACTLY as test script
    if (!finalLoanAmount || !finalPropertyValue || !propertyZip) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: finalLoanAmount, finalPropertyValue, propertyZip'
      }, { status: 400 });
    }

    console.log('📋 Search Parameters:', {
      finalLoanAmount,
      finalPropertyValue,
      finalCreditScore,
      propertyZip,
      finalPropertyState,
      finalLoanPurpose,
      finalPropertyType,
      occupancy,
      finalLoanTerm,
      filterId,
      includeMI
    });

    // Create Mortech API instance
    const mortechAPI = createMortechAPI();

    // Prepare request - matching test script format EXACTLY
    // Derive productList from dropdown program + loan term (preferred).
    // Keep legacy bucket/raw-id behavior as fallback to avoid disturbing existing flows.
    let productList: string | undefined;
    let selectedProgramKey: string | undefined;
    if (typeof productCategory === 'string' && productCategory.trim() !== '') {
      const trimmed = productCategory.trim();
      const loanTermYears = parseLoanTermYears(finalLoanTerm);
      const programKey = normalizeProgramKey(trimmed);
      selectedProgramKey = programKey;

      // Jumbo 10-year fixed is intentionally unavailable for current Product Category mapping.
      if (programKey === 'jumbo' && loanTermYears === 10) {
        return NextResponse.json(
          {
            success: false,
            error: 'Jumbo 10-year fixed is not available for the selected Product Category.',
          },
          { status: 400 },
        );
      }

      if (programKey) {
        const byTerm = PROGRAM_TERM_PRODUCT_IDS[programKey]?.[loanTermYears];
        if (typeof byTerm === 'number') {
          productList = String(byTerm);
        } else if (loanTermYears !== 30) {
          console.log('⚠️ No exact product mapping for selected program+term:', {
            productCategory: trimmed,
            programKey,
            loanTermYears,
          });
        }
      }

      // Legacy bucket mapping fallback (existing behavior)
      if (!productList) {
        const bucketIds = Object.keys(BUCKET_PRODUCT_IDS) as (keyof typeof BUCKET_PRODUCT_IDS)[];
        if (bucketIds.includes(trimmed as keyof typeof BUCKET_PRODUCT_IDS)) {
          const ids = BUCKET_PRODUCT_IDS[trimmed as keyof typeof BUCKET_PRODUCT_IDS];
          if (Array.isArray(ids) && ids.length > 0) {
            productList = ids.join(',');
          }
        }
      }

      // Fallback: treat as a single product id (legacy format).
      if (!productList) {
        productList = trimmed;
      }
    }

    const normalizedOccupancy = resolveOccupancyCode(occupancy, selectedProgramKey);

    console.log('🔎 Mortech product selection:', {
      productCategoryRaw: productCategory,
      derivedProductList: productList,
      occupancyRaw: occupancy,
      occupancyResolved: normalizedOccupancy,
    });

    // Derive category-specific Mortech flags from selected program.
    // This keeps behavior consistent across Custom Rates + Officer dashboard:
    // - FHA: financeMI=1
    // - VA:  financeMI=1, vaType=0, subsequentUse derived from first-time-use flag.
    const shouldSetFinanceMI = selectedProgramKey === 'fha' || selectedProgramKey === 'va';
    const shouldSetVaCodes = selectedProgramKey === 'va';

    // Derive VA type / subsequent use codes when applicable
    let vaTypeCode: string | undefined;
    let subsequentUseCode: number | undefined;
    if (shouldSetVaCodes || militaryVeteran === true) {
      // Default to Regular military = 0
      vaTypeCode = '0';
      // 0 = First time use, 1 = Subsequent use
      subsequentUseCode = vaFirstTimeUse === false ? 1 : 0;
    }

    const mortechRequest = {
      ...(finalPropertyState && { propertyState: finalPropertyState }),
      propertyZip,
      appraisedvalue: finalPropertyValue,
      loan_amount: finalLoanAmount,
      fico: finalCreditScore,
      loanpurpose: finalLoanPurpose,
      proptype: finalPropertyType,
      occupancy: normalizedOccupancy,
      // Only send loanProduct1 when not forcing a specific product via productList
      ...(!productList && { loanProduct1: finalLoanTerm }),
      ...(productList && { productList }),
      // filterId is optional
      ...(filterId && { filterId }),
      // Always indicate borrower-paid MI by default; pmiCompany is optional
      ...(includeMI && {
        pmiCompany: -999, // Best MI company
      }),
      ...(shouldSetFinanceMI && { financeMI: 1 }),
      noMI: 0,
      // Additional custom rate parameters - only include if they have meaningful values
      ...(waiveEscrow === true && { waiveEscrow: true }),
      ...(militaryVeteran === true && { militaryVeteran: true }),
      lockDays: finalLockDays,
      ...(safeSecondMortgageAmount > 0 && { secondMortgageAmount: safeSecondMortgageAmount }),
      ...(vaTypeCode && { vaType: vaTypeCode }),
      ...(subsequentUseCode !== undefined && { subsequentUse: subsequentUseCode }),
    };

    console.log('🔎 Final Mortech request payload:', mortechRequest);

    // Call Mortech API
    const response = await mortechAPI.getRates(mortechRequest);

    if (!response.success) {
      console.error('❌ Mortech API Error:', response.error);
      return NextResponse.json({
        success: false,
        error: response.error || 'Failed to fetch rates from Mortech'
      }, { status: 500 });
    }

    // Record API call for rate limiting (only on success)
    if (auth) {
      // Authenticated user - record in mortechApiCalls
      await recordApiCall(auth.user.id, auth.companyId, {
        finalLoanAmount,
        finalPropertyValue,
        finalCreditScore,
        propertyZip,
        finalLoanPurpose,
        finalPropertyType,
        occupancy: normalizedOccupancy,
        finalLoanTerm,
      });
      
      // Also record email-based call if email is provided (for testing/tracking)
      if (userEmail) {
        await recordEmailApiCall(userEmail, {
          finalLoanAmount,
          finalPropertyValue,
          finalCreditScore,
          propertyZip,
          finalLoanPurpose,
          finalPropertyType,
          occupancy: normalizedOccupancy,
          finalLoanTerm,
        });
      }
    } else if (userEmail) {
      // Unauthenticated user - record in mortechEmailRateLimits
      await recordEmailApiCall(userEmail, {
        finalLoanAmount,
        finalPropertyValue,
        finalCreditScore,
        propertyZip,
        finalLoanPurpose,
        finalPropertyType,
          occupancy: normalizedOccupancy,
        finalLoanTerm,
      });
    }

    // Optionally reduce to exactly 3 quotes for Custom Rates tab (by Mortech price: ~99, ~100, ≥100)
    const quotesToTransform: { quote: MortechQuote; quoteType?: 'Lowest Rate' | 'PAR' | 'Higher Rate' }[] =
      reduceToThree && response.quotes?.length
        ? pickThreeQuotesByPrice(response.quotes).map(({ quote, quoteType }) => ({ quote, quoteType }))
        : (response.quotes ?? []).map(quote => ({ quote }));

    const transformOne = (quote: MortechQuote, quoteType?: 'Lowest Rate' | 'PAR' | 'Higher Rate') => {
      const hasExecutionPrice =
        typeof quote.executionPrice === 'number' &&
        Number.isFinite(quote.executionPrice) &&
        quote.executionPrice > 0;

      // quote.points comes from <quote_detail price="..."/> and is already the
      // borrower points / credit delta used by the Marksman UI.
      // Support guidance: display price uses quote_detail.price as 100.000 + price.
      const computedPoints = Number.isFinite(quote.points) ? Number(quote.points.toFixed(3)) : 0;

      return {
        id: quote.productId,
        lenderName: quote.vendorName,
        productName: quote.vendorProductCode || quote.vendorProductName,
        loanProgram: quote.productDesc,
        loanType: quote.termType,
        loanTerm: quote.productTerm,
        interestRate: quote.rate,
        apr: quote.apr,
        monthlyPayment: quote.monthlyPayment,
        // Execution price (Marksman-style 0–100 scale) for debugging / analytics.
        ...(hasExecutionPrice
          ? { executionPrice: quote.executionPrice }
          : {}),
        points: computedPoints,
        originationFee: quote.originationFee,
        upfrontFee: quote.upfrontFee,
        monthlyPremium: quote.monthlyPremium,
        downPayment: quote.downPayment,
        loanAmount: quote.loanAmount,
        lockTerm: quote.lockTerm,
        pricingStatus: quote.pricingStatus,
        lastUpdate: quote.lastUpdate,
        fees: quote.fees.map(fee => ({
          description: fee.description,
          amount: fee.feeamount,
          section: fee.section,
          paymentType: fee.paymenttype,
          prepaid: fee.prepaid
        })),
        eligibility: quote.eligibility,
        credits: 0,
        lockPeriod: quote.lockTerm,
        ...(quoteType && { quoteType }),
      };
    };

    const transformedRates = quotesToTransform.map(({ quote, quoteType }) => transformOne(quote, quoteType));

    console.log(`✅ Found ${transformedRates.length} rates from Mortech${reduceToThree ? ' (reduced to 3 for Custom Quote)' : ''}`);
    console.log('📊 Transformed rates sample:', transformedRates[0]);
    console.log('🔍 Response structure:', {
      success: true,
      ratesCount: transformedRates.length,
      source: 'mortech_api',
      isMockData: false
    });

    return NextResponse.json({
      success: true,
      rates: transformedRates,
      ratesCount: transformedRates.length,
      source: 'mortech_api',
      isMockData: false,
      rateLimit: {
        remaining: rateLimit.remaining - 1,
        resetAt: rateLimit.resetAt,
        used: rateLimit.used + 1,
      },
      searchParams: {
        finalLoanAmount,
        finalPropertyValue,
        finalCreditScore,
        propertyZip,
        finalLoanPurpose,
        finalPropertyType,
        occupancy: normalizedOccupancy,
        finalLoanTerm,
        filterId,
        includeMI,
        waiveEscrow,
        militaryVeteran,
        lockDays,
        secondMortgageAmount: safeSecondMortgageAmount
      }
    });

  } catch (error) {
    console.error('❌ Mortech search error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
