import { and, eq } from 'drizzle-orm';
import { createMortechAPI } from '@/lib/mortech/api';
import { db, selectedRates, userCompanies, companies } from '@/lib/db';
import { BUCKET_PRODUCT_IDS, PROGRAM_BUCKETS, ProgramBucket } from '@/lib/mortech/programBuckets';

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

  // Standard scenario for Today's Rates: $550k loan, 20% down (purchase $687,500)
  const standardScenario = {
    propertyState: 'CA',
    propertyZip: '95825',
    appraisedvalue: 687500,
    loan_amount: 550000,
    fico: 800,
    loanpurpose: 'Purchase' as const,
    proptype: 'Single Family' as const,
    occupancy: 'Primary' as const,
    lockDays: '30',
  };

  const bucketBestQuotes = (
    await Promise.all(
      bucketsToSeed.map(async (bucket: ProgramBucket) => {
        try {
          const productIds = BUCKET_PRODUCT_IDS[bucket.id] || [];
          if (!productIds.length) {
            console.warn(`[seed] ${bucket.id}: no product IDs`);
            return null;
          }

          const productList = productIds.join(',');

          const response = await mortechAPI.getRates({
            ...standardScenario,
            productList,
          });

          if (!response.success || !response.quotes || response.quotes.length === 0) {
            console.warn(`[seed] ${bucket.id}: no quotes (success=${response.success}, count=${response.quotes?.length ?? 0})`);
            return null;
          }

          // Pick the PAR quote for this bucket: executionPrice (ratesheet_price)
          // closest to 100. Fallback to lowest note rate if executionPrice is
          // missing on all quotes.
          let parQuote = response.quotes[0];
          let bestDiff = Number.POSITIVE_INFINITY;
          let foundExecutionPrice = false;

          for (const q of response.quotes) {
            const ep = q.executionPrice;
            if (typeof ep === 'number' && Number.isFinite(ep) && ep > 0) {
              const diff = Math.abs(ep - 100);
              if (diff < bestDiff) {
                bestDiff = diff;
                parQuote = q;
                foundExecutionPrice = true;
              }
            }
          }

          // If no executionPrice was available on any quote, fall back to the
          // lowest note rate as before.
          if (!foundExecutionPrice) {
            parQuote = response.quotes.reduce((bestSoFar, current) => {
              const bestRate = bestSoFar.rate ?? Number.POSITIVE_INFINITY;
              const currentRate = current.rate ?? Number.POSITIVE_INFINITY;
              return currentRate < bestRate ? current : bestSoFar;
            });
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
    purchasePrice: standardScenario.appraisedvalue,
    downPayment: standardScenario.appraisedvalue - standardScenario.loan_amount,
    loanAmount: standardScenario.loan_amount,
    creditScore: '800+',
    loanPurpose: standardScenario.loanpurpose,
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
    const points = hasExecutionPrice
      ? Number((100 - quote.executionPrice).toFixed(3))
      : quote.points ?? 0;

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

