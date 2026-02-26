import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createMortechAPI, type MortechQuote } from '@/lib/mortech/api';
import { checkRateLimit, recordApiCall } from '@/lib/mortech/rate-limit';
import { checkEmailRateLimit, recordEmailApiCall } from '@/lib/mortech/email-rate-limit';
import { db, userCompanies } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

/**
 * Custom Quote: 3 options by Mortech execution price.
 * Mortech XML:
 *   - <ratesheet_price> → we map to quote.executionPrice (0–100 scale; Marksman "Price" column).
 *   - quote_detail.$.price → we map to quote.points (borrower discount points).
 *
 * Business rule (from client):
 *   - First find PAR = row whose executionPrice is closest to 100.
 *   - Then show exactly 3 rows for the selected product:
 *       • One row just below PAR in the price ladder (lower executionPrice → more discount → usually lower rate)
 *       • PAR row itself (≈ 100)
 *       • One row just above PAR in the price ladder (higher executionPrice → more credit → usually higher rate)
 *   - If there is no exact 99.00, still use “one below and one above” relative to PAR.
 *   - If there are not enough neighbors on one side, fall back to the closest remaining rows.
 *
 * Verify: curl -X POST http://localhost:3000/api/mortech/search -H "Content-Type: application/json" \
 *   -d '{"propertyZip":"95825","appraisedvalue":500000,"loan_amount":400000,"fico":740,"loanpurpose":"Purchase","proptype":"Single Family","occupancy":"Primary","loanProduct1":"30 year fixed","reduceToThree":true}'
 * Response rates[] will have 3 items with quoteType: "Lowest Rate" | "PAR" | "Higher Rate"; each has executionPrice and points.
 */
const PRICE_LOWEST_TARGET = 99;  // discount / pay points → lowest rate
const PRICE_PAR_TARGET = 100;   // par; premium ≥100 → higher rate / credit

function pickThreeQuotesByPrice(quotes: MortechQuote[]): { quote: MortechQuote; quoteType: 'Lowest Rate' | 'PAR' | 'Higher Rate' }[] {
  if (!quotes.length) return [];

  // Prefer executionPrice (0–100 scale). Fallback to points when executionPrice is missing.
  const getPrice = (q: MortechQuote) => {
    const ep = q.executionPrice;
    if (typeof ep === 'number' && Number.isFinite(ep) && ep > 0) return ep;
    return q.points;
  };

  // 1) Sort full ladder by executionPrice (or fallback price) ascending.
  const sorted = [...quotes].sort((a, b) => getPrice(a) - getPrice(b));

  // 2) Find PAR index: executionPrice closest to 100 across the entire ladder.
  let parIndex = 0;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (let i = 0; i < sorted.length; i++) {
    const price = getPrice(sorted[i]);
    const diff = Math.abs(price - PRICE_PAR_TARGET);
    if (diff < bestDiff) {
      bestDiff = diff;
      parIndex = i;
    }
  }

  const chosenIndices = new Set<number>();
  chosenIndices.add(parIndex);

  // Prefer one neighbor below PAR (lower executionPrice) and one above PAR (higher executionPrice).
  const belowIndex = parIndex - 1;
  const aboveIndex = parIndex + 1;
  if (belowIndex >= 0) {
    chosenIndices.add(belowIndex);
  }
  if (aboveIndex < sorted.length) {
    chosenIndices.add(aboveIndex);
  }

  // If we still have fewer than 3, fill remaining slots with closest-by-price rows not yet chosen.
  if (chosenIndices.size < 3 && sorted.length > chosenIndices.size) {
    const remainingIndices = sorted
      .map((_, idx) => idx)
      .filter(idx => !chosenIndices.has(idx))
      .sort((a, b) => {
        const da = Math.abs(getPrice(sorted[a]) - PRICE_PAR_TARGET);
        const db = Math.abs(getPrice(sorted[b]) - PRICE_PAR_TARGET);
        return da - db;
      });

    for (const idx of remainingIndices) {
      chosenIndices.add(idx);
      if (chosenIndices.size >= 3) break;
    }
  }

  // Map chosen indices to quote + provisional labels based on their price relative to PAR.
  const parPrice = getPrice(sorted[parIndex]);
  let lowestAssigned = false;
  let higherAssigned = false;

  const labeled: { quote: MortechQuote; quoteType: 'Lowest Rate' | 'PAR' | 'Higher Rate' }[] = [];

  for (const idx of chosenIndices) {
    const quote = sorted[idx];
    if (idx === parIndex) {
      labeled.push({ quote, quoteType: 'PAR' });
    } else {
      const price = getPrice(quote);
      if (price < parPrice && !lowestAssigned) {
        labeled.push({ quote, quoteType: 'Lowest Rate' });
        lowestAssigned = true;
      } else if (price >= parPrice && !higherAssigned) {
        labeled.push({ quote, quoteType: 'Higher Rate' });
        higherAssigned = true;
      } else if (!lowestAssigned) {
        labeled.push({ quote, quoteType: 'Lowest Rate' });
        lowestAssigned = true;
      } else {
        labeled.push({ quote, quoteType: 'Higher Rate' });
        higherAssigned = true;
      }
    }
  }

  // Return in a stable order: Lowest Rate, PAR, Higher Rate (when present).
  const byOrder: ('Lowest Rate' | 'PAR' | 'Higher Rate')[] = ['Lowest Rate', 'PAR', 'Higher Rate'];
  const ordered: { quote: MortechQuote; quoteType: 'Lowest Rate' | 'PAR' | 'Higher Rate' }[] = [];

  for (const qt of byOrder) {
    const entry = labeled.find(item => item.quoteType === qt);
    if (entry) ordered.push(entry);
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
    const occupancy = searchParams.get('occupancy') as 'Primary' | 'Secondary' | 'Investment' || 'Primary';
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
    } = body;
    
    // Use test script format if provided, otherwise fall back to old format
    const finalLoanAmount = loan_amount || loanAmount;
    const finalPropertyValue = appraisedvalue || propertyValue;
    const finalCreditScore = fico || creditScore || 740;
    const finalLoanPurpose = loanpurpose || loanPurpose || 'Purchase';
    const finalPropertyType = proptype || propertyType || 'Single Family';
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
    // Derive productList from productCategory, if provided (value is `${parent_id}:${product_id}`)
    let productList: string | undefined;
    if (typeof productCategory === 'string' && productCategory.trim() !== '') {
      const parts = productCategory.split(':');
      if (parts.length === 2 && parts[1].trim() !== '') {
        productList = parts[1].trim();
      }
    }

    console.log('🔎 Mortech product selection:', {
      productCategoryRaw: productCategory,
      derivedProductList: productList,
    });

    const mortechRequest = {
      ...(finalPropertyState && { propertyState: finalPropertyState }),
      propertyZip,
      appraisedvalue: finalPropertyValue,
      loan_amount: finalLoanAmount,
      fico: finalCreditScore,
      loanpurpose: finalLoanPurpose,
      proptype: finalPropertyType,
      occupancy,
      // Only send loanProduct1 when not forcing a specific product via productList
      ...( !productList && { loanProduct1: finalLoanTerm } ),
      ...(productList && { productList }),
      // filterId is optional
      ...(filterId && { filterId }),
      // Always indicate borrower-paid MI by default; pmiCompany is optional
      ...(includeMI && { 
        pmiCompany: -999, // Best MI company
      }),
      noMI: 0,
      // Additional custom rate parameters - only include if they have meaningful values
      ...(waiveEscrow === true && { waiveEscrow: true }),
      ...(militaryVeteran === true && { militaryVeteran: true }),
      lockDays: finalLockDays,
      ...(safeSecondMortgageAmount > 0 && { secondMortgageAmount: safeSecondMortgageAmount })
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
        occupancy,
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
          occupancy,
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
        occupancy,
        finalLoanTerm,
      });
    }

    // Optionally reduce to exactly 3 quotes for Custom Rates tab (by Mortech price: ~99, ~100, ≥100)
    const quotesToTransform: { quote: MortechQuote; quoteType?: 'Lowest Rate' | 'PAR' | 'Higher Rate' }[] =
      reduceToThree && response.quotes?.length
        ? pickThreeQuotesByPrice(response.quotes).map(({ quote, quoteType }) => ({ quote, quoteType }))
        : (response.quotes ?? []).map(quote => ({ quote }));

    const transformOne = (quote: MortechQuote, quoteType?: 'Lowest Rate' | 'PAR' | 'Higher Rate') => ({
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
      ...(typeof quote.executionPrice === 'number' && Number.isFinite(quote.executionPrice) && quote.executionPrice > 0
        ? { executionPrice: quote.executionPrice }
        : {}),
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
      credits: 0,
      lockPeriod: quote.lockTerm,
      ...(quoteType && { quoteType }),
    });

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
        occupancy,
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
