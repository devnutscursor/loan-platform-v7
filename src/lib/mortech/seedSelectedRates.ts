import { and, eq } from 'drizzle-orm';
import { createMortechAPI } from '@/lib/mortech/api';
import { db, selectedRates, userCompanies, companies } from '@/lib/db';
import { BUCKET_PRODUCT_IDS, PROGRAM_BUCKETS, ProgramBucket, ProgramBucketId } from '@/lib/mortech/programBuckets';

export type SeededSelectedRateRow = {
  id: string;
  rateData: any;
  createdAt: string;
  updatedAt: string;
};

export type SeedSelectedRatesResult = {
  rates: SeededSelectedRateRow[];
  seeded: boolean;
};

// Fixed Today’s Rates product IDs requested by client (single product per bucket).
const FIXED_TODAYS_PRODUCT_LIST_BY_BUCKET: Record<ProgramBucketId, string> = {
  conv_30yr: '4',
  conf_15yr: '2',
  va_30yr: '26',
  fha_30yr: '23',
  // Jumbo Today’s Rates uses Non Conf 30 Yr Fixed.
  jumbo_30yr: '15',
  second_home_30yr: '4',
  home_ready_30yr: '2420',
  home_possible_30yr: '971',
};

function pickParQuoteByPoints(quotes: any[]): any {
  if (!quotes.length) return undefined;

  const EPS = 1e-6;
  const getPoints = (q: any) =>
    typeof q.points === 'number' && Number.isFinite(q.points) ? q.points : Number.POSITIVE_INFINITY;
  const getApr = (q: any) =>
    typeof q.apr === 'number' && Number.isFinite(q.apr) ? q.apr : Number.POSITIVE_INFINITY;

  const zeroPoints = quotes.filter((q) => Math.abs(getPoints(q)) <= EPS);
  if (zeroPoints.length > 0) {
    // PAR rule requested: price="0.000" with lowest APR.
    return zeroPoints.slice().sort((a, b) => getApr(a) - getApr(b))[0];
  }

  // Fallback when no exact 0.000 exists: nearest to zero points, then lowest APR.
  return quotes.slice().sort((a, b) => {
    const aAbs = Math.abs(getPoints(a));
    const bAbs = Math.abs(getPoints(b));
    if (aAbs !== bAbs) return aAbs - bAbs;
    return getApr(a) - getApr(b);
  })[0];
}

/**
 * Seed default selected rates for a given officer and company.
 *
 * - Ensures that each PROGRAM_BUCKET has at least one selected rate.
 * - Uses BUCKET_PRODUCT_IDS per bucket to build productList for Mortech.
 * - Calls Mortech per bucket with a standard scenario and stores the
 *   lowest-rate quote for that bucket.
 *
 * This function is idempotent per bucket: it only inserts for buckets
 * that do not already have at least one matching selected rate.
 */
export async function seedSelectedRatesForOfficer(
  officerId: string,
  companyId?: string,
): Promise<SeedSelectedRatesResult> {
  // Resolve officer's active company if not provided (for convenience)
  let resolvedCompanyId = companyId;
  if (!resolvedCompanyId) {
    const userCompanyResult = await db
      .select({ companyId: userCompanies.companyId })
      .from(userCompanies)
      .where(and(eq(userCompanies.userId, officerId), eq(userCompanies.isActive, true)))
      .limit(1);

    if (userCompanyResult.length === 0) {
      throw new Error('Company not found for officer');
    }
    resolvedCompanyId = userCompanyResult[0].companyId;
  }

  const companyRows = await db
    .select({ hasMortechSubscription: companies.hasMortechSubscription })
    .from(companies)
    .where(eq(companies.id, resolvedCompanyId))
    .limit(1);

  if (companyRows[0]?.hasMortechSubscription === false) {
    return { rates: [], seeded: false };
  }

  // Read existing selected rates via Drizzle
  const existingRatesRaw = await db
    .select()
    .from(selectedRates)
    .where(
      and(eq(selectedRates.officerId, officerId), eq(selectedRates.companyId, resolvedCompanyId)),
    );

  // Determine which buckets are already represented in existing selected rates
  const existingBucketIds = new Set<string>();
  const lowerCaseBuckets = PROGRAM_BUCKETS.map((bucket) => ({
    ...bucket,
    matchLower: bucket.match.toLowerCase(),
  }));

  for (const row of existingRatesRaw as any[]) {
    const rate = row.rateData || row.rate_data || {};
    const combined = `${rate.loanProgram || ''} ${rate.productDesc || ''} ${
      rate.vendorProductName || ''
    } ${rate.vendorProductCode || ''}`.toLowerCase();

    for (const bucket of lowerCaseBuckets) {
      if (!existingBucketIds.has(bucket.id) && combined.includes(bucket.matchLower)) {
        existingBucketIds.add(bucket.id);
      }
    }
  }

  const bucketsToSeed: ProgramBucket[] = PROGRAM_BUCKETS.filter(
    (bucket) => !existingBucketIds.has(bucket.id),
  );

  if (bucketsToSeed.length === 0) {
    // Nothing to seed; just return existing rows in normalized shape
    const mappedExisting: SeededSelectedRateRow[] = (existingRatesRaw as any[]).map((row) => ({
      id: row.id,
      rateData: row.rateData || row.rate_data,
      createdAt: row.createdAt || row.created_at,
      updatedAt: row.updatedAt || row.updated_at,
    }));
    return { rates: mappedExisting, seeded: false };
  }

  const mortechAPI = createMortechAPI();

  // Standard scenario for Today's Rates (fixed across officers):
  // - Purchase: $550,000 price, $440,000 loan (20% down), FICO 780, lock 30 days
  // - 1-unit property type (proptype=0)
  // Note: occupancy is adjusted per bucket (e.g. Second Home).
  const baseScenario = {
    propertyState: 'CA',
    propertyZip: '95825',
    appraisedvalue: 550000,
    loan_amount: 440000,
    // Seed with FICO 780 per default criteria
    fico: 780,
    loanpurpose: 'Purchase' as const,
    // 0 = 1 unit
    proptype: 0 as const,
    lockDays: '30',
  };

  const bucketBestQuotes = (
    await Promise.all(
      bucketsToSeed.map(async (bucket: ProgramBucket) => {
        try {
          const productList = FIXED_TODAYS_PRODUCT_LIST_BY_BUCKET[bucket.id];
          if (!productList) {
            const fallbackIds = BUCKET_PRODUCT_IDS[bucket.id] || [];
            if (!fallbackIds.length) {
              console.warn(`[seed] ${bucket.id}: no product IDs`);
              return null;
            }
          }

          // Bucket-specific fixed params:
          // - Second Home: occupancy=2 (RateCaddy second-home code)
          // - FHA/VA: finance MI to match Marksman pricing logic
          const occupancy = bucket.id === 'second_home_30yr' ? 2 : 0;
          const isFhaBucket = bucket.id.startsWith('fha_');
          const isVaBucket = bucket.id.startsWith('va_');
          const financeMI = isFhaBucket || isVaBucket ? 1 : undefined;
          const vaType = isVaBucket ? '0' : undefined;
          const subsequentUse = isVaBucket ? 0 : undefined;

          const response = await mortechAPI.getRates({
            ...baseScenario,
            occupancy,
            ...(financeMI !== undefined ? { financeMI } : {}),
            ...(vaType !== undefined ? { vaType } : {}),
            ...(subsequentUse !== undefined ? { subsequentUse } : {}),
            productList: productList || BUCKET_PRODUCT_IDS[bucket.id].join(','),
          });

          if (!response.success || !response.quotes || response.quotes.length === 0) {
            console.warn(`[seed] ${bucket.id}: no quotes (success=${response.success}, count=${response.quotes?.length ?? 0})`);
            return null;
          }

          const parQuote = pickParQuoteByPoints(response.quotes);
          if (!parQuote) {
            console.warn(`[seed] ${bucket.id}: unable to pick PAR quote`);
            return null;
          }

          return { bucket, quote: parQuote };
        } catch (err) {
          console.warn(`[seed] ${bucket.id}: error`, err);
          return null;
        }
      }),
    )
  ).filter(
    (entry): entry is { bucket: ProgramBucket; quote: any } =>
      Boolean(entry),
  );

  if (bucketBestQuotes.length === 0) {
    // No new quotes could be seeded; return existing ones unchanged
    const mappedExisting: SeededSelectedRateRow[] = (existingRatesRaw as any[]).map((row) => ({
      id: row.id,
      rateData: row.rateData || row.rate_data,
      createdAt: row.createdAt || row.created_at,
      updatedAt: row.updatedAt || row.updated_at,
    }));
    return { rates: mappedExisting, seeded: false };
  }

  // Build rateData objects and insert into selected_rates
  const defaultSearchParams = {
    purchasePrice: baseScenario.appraisedvalue,
    downPayment: baseScenario.appraisedvalue - baseScenario.loan_amount,
    loanAmount: baseScenario.loan_amount,
    // Match UI bucket closest to 780
    creditScore: '780-799',
    loanPurpose: baseScenario.loanpurpose,
  } as const;

  const inserts = bucketBestQuotes.map(({ bucket, quote }) => {
    const feeItems =
      quote.fees?.map((fee: any) => ({
        description: fee.description,
        amount: fee.feeamount,
        section: fee.section,
        paymentType: fee.paymenttype,
        prepaid: fee.prepaid,
      })) ?? [];

    const totalFees = feeItems.reduce(
      (sum: number, f: any) => sum + (Number.isFinite(f.amount) ? f.amount : 0),
      0,
    );

    const hasExecutionPrice =
      typeof quote.executionPrice === 'number' &&
      Number.isFinite(quote.executionPrice) &&
      quote.executionPrice > 0;

    // quote.points is the <quote_detail price="..."/> attribute (delta vs 100)
    // used by Marksman for the "Price" (100.000 + price) and Points/Credit display.
    const points = Number.isFinite(quote.points) ? Number(quote.points.toFixed(3)) : 0;

    return {
      officerId,
      companyId: resolvedCompanyId,
      rateData: {
        id: quote.productId,
        productId: quote.productId,
        bucketId: bucket.id,
        lenderName: quote.vendorName,
        loanProgram: bucket.label,
        productDesc: quote.productDesc,
        loanType: quote.termType,
        loanTerm: quote.productTerm,
        interestRate: quote.rate,
        apr: quote.apr,
        monthlyPayment: quote.monthlyPayment,
        fees: totalFees,
        feeItems,
        points,
        credits: 0,
        lockPeriod: quote.lockTerm,
        executionPrice: hasExecutionPrice ? quote.executionPrice : undefined,
        searchParams: defaultSearchParams,
      },
    };
  });

  if (inserts.length === 0) {
    const mappedExisting: SeededSelectedRateRow[] = (existingRatesRaw as any[]).map((row) => ({
      id: row.id,
      rateData: row.rateData || row.rate_data,
      createdAt: row.createdAt || row.created_at,
      updatedAt: row.updatedAt || row.updated_at,
    }));
    return { rates: mappedExisting, seeded: false };
  }

  const inserted = await db.insert(selectedRates).values(inserts).returning();

  const allRows = [...(existingRatesRaw as any[]), ...(inserted as any[])];

  const mapped: SeededSelectedRateRow[] = allRows.map((row) => ({
    id: row.id,
    rateData: row.rateData || row.rate_data,
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at,
  }));

  return { rates: mapped, seeded: true };
}

