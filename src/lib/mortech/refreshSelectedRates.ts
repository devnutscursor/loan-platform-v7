/**
 * Refresh all selected rates in DB: for each row, call Mortech with stored
 * search params + product, then update rateData with new rate/APR/P&I/points.
 * Used by:
 * - POST /api/cron/mortech/refresh-selected-rates          (refresh ALL officers)
 * - POST /api/cron/mortech/refresh-selected-rates/officer  (refresh single officer)
 */

import { and, eq } from 'drizzle-orm';
import { createMortechAPI, type MortechFee } from '@/lib/mortech/api';
import { db, selectedRates, companies } from '@/lib/db';
import { PROGRAM_BUCKETS, BUCKET_PRODUCT_IDS, type ProgramBucketId } from '@/lib/mortech/programBuckets';

function parseFico(creditScore: unknown): number {
  if (typeof creditScore === 'number' && !Number.isNaN(creditScore)) {
    return Math.max(300, Math.min(850, creditScore));
  }
  if (typeof creditScore === 'string') {
    const num = parseInt(creditScore.replace(/\D/g, ''), 10);
    if (!Number.isNaN(num)) return Math.max(300, Math.min(850, num));
  }
  return 740;
}

export type RefreshSelectedRatesResult = { updated: number; failed: number };

// Fixed Today’s Rates product IDs requested by client (single product per bucket).
const FIXED_TODAYS_PRODUCT_LIST_BY_BUCKET: Record<ProgramBucketId, string> = {
  conv_30yr: '4',
  conf_15yr: '2',
  va_30yr: '26',
  fha_30yr: '23',
  jumbo_30yr: '2678',
  second_home_30yr: '2869',
  home_ready_30yr: '2420',
  home_possible_30yr: '971',
};

function inferBucketProductList(rate: Record<string, unknown>): string | undefined {
  const bucketId = rate.bucketId as string | undefined;
  if (bucketId && Object.prototype.hasOwnProperty.call(BUCKET_PRODUCT_IDS, bucketId)) {
    const ids = BUCKET_PRODUCT_IDS[bucketId as keyof typeof BUCKET_PRODUCT_IDS];
    if (Array.isArray(ids) && ids.length > 0) {
      return ids.join(',');
    }
  }

  const combined = `${(rate.loanProgram ?? '') as string} ${(rate.productDesc ?? '') as string} ${(rate.vendorProductName ?? '') as string} ${(rate.vendorProductCode ?? '') as string}`.toLowerCase();

  for (const bucket of PROGRAM_BUCKETS) {
    const matchLower = bucket.match.toLowerCase();
    const labelLower = bucket.label.toLowerCase();
    if (combined.includes(matchLower) || combined.includes(labelLower)) {
      const ids = BUCKET_PRODUCT_IDS[bucket.id];
      if (Array.isArray(ids) && ids.length > 0) {
        return ids.join(',');
      }
    }
  }

  return undefined;
}

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

async function refreshSelectedRateRows(
  rows: any[],
  context: { label: string },
): Promise<RefreshSelectedRatesResult> {
  if (!rows.length) {
    console.log('🔁 refreshSelectedRateRows: no selected_rates rows found for context', context);
    return { updated: 0, failed: 0 };
  }

  const mortechAPI = createMortechAPI();
  let updated = 0;
  let failed = 0;
  const startedAt = Date.now();
  console.log('🔁 refreshSelectedRateRows: starting', {
    context,
    totalRows: rows.length,
  });

  // Limit Mortech calls to a small concurrency to speed up wall-clock time
  // without hammering the API. Adjust as needed if we add more traffic.
  const CONCURRENCY = 5;

  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const batch = rows.slice(i, i + CONCURRENCY);

    await Promise.all(
      batch.map(async (row) => {
        const rate = (row.rateData as Record<string, unknown>) || {};
        const bucketId = rate.bucketId as string | undefined;

        // Fixed Today's Rates scenario for all refreshed selected rates:
        // - Purchase price: $687,500
        // - Loan amount:   $550,000
        // - Credit score:  780
        // - Purpose:       Purchase
        // - Property:      CA / 95825 / Single Family / Primary
        // - Lock:          30 days
        const appraisedvalue = 687500;
        const loan_amount = 550000;
        const fico = 780;
        const loanpurpose = 'Purchase';
        const lockDays = '30';
        // Second Home should be "Secondary" occupancy in Mortech/Marksman.
        // For other buckets (Conventional/Jumbo/VA/FHA/etc), keep Primary.
        const occupancy = bucketId === 'second_home_30yr' ? 1 : 0;

        const request: Record<string, unknown> = {
          propertyState: 'CA',
          propertyZip: '95825',
          appraisedvalue,
          loan_amount,
          fico,
          loanpurpose,
          // 0 = 1 unit
          proptype: 0,
          // 0 = Owner occupied (Primary), 1 = Secondary
          occupancy,
          lockDays,
        };

        // Use fixed productList per bucket (client-defined Today’s Rates params).
        let productList =
          bucketId && Object.prototype.hasOwnProperty.call(FIXED_TODAYS_PRODUCT_LIST_BY_BUCKET, bucketId)
            ? FIXED_TODAYS_PRODUCT_LIST_BY_BUCKET[bucketId as ProgramBucketId]
            : inferBucketProductList(rate);

        if (!productList) {
          const productId = rate.productId ?? rate.id;
          if (productId != null && String(productId).trim() !== '') {
            productList = String(productId).trim();
          }
        }

        if (productList) {
          request.productList = productList;
        } else {
          const term = rate.loanTerm ?? 30;
          request.loanProduct1 = `${term} year fixed`;
        }

        const isFhaBucket = typeof bucketId === 'string' && bucketId.startsWith('fha_');
        const isVaBucket = typeof bucketId === 'string' && bucketId.startsWith('va_');

        // FHA: Marksman scenario "finance MI" must be passed to match pricing.
        if (isFhaBucket) {
          request.financeMI = 1;
        }
        if (isVaBucket) {
          request.financeMI = 1;
          request.vaType = '0';
          request.subsequentUse = 0;
        }

        if (isVaBucket) {
          console.log('🧪 [VA DEBUG][refreshSelectedRates] VA request payload', {
            officerId: row.officerId,
            selectedRateId: row.id,
            bucketId,
            request,
          });
        }

        try {
          const response = await mortechAPI.getRates(request as any);
          if (!response.success || !response.quotes || response.quotes.length === 0) {
            if (isVaBucket) {
              console.log('🧪 [VA DEBUG][refreshSelectedRates] VA response empty/failed', {
                officerId: row.officerId,
                selectedRateId: row.id,
                bucketId,
                success: response.success,
                quotesCount: response.quotes?.length ?? 0,
                error: response.error,
              });
            }
            failed++;
            return;
          }

          const quote = pickParQuoteByPoints(response.quotes);
          if (!quote) {
            if (isVaBucket) {
              console.log('🧪 [VA DEBUG][refreshSelectedRates] VA PAR pick failed', {
                officerId: row.officerId,
                selectedRateId: row.id,
                bucketId,
                quotesCount: response.quotes.length,
              });
            }
            failed++;
            return;
          }

          if (isVaBucket) {
            console.log('🧪 [VA DEBUG][refreshSelectedRates] VA PAR picked', {
              officerId: row.officerId,
              selectedRateId: row.id,
              bucketId,
              picked: {
                productId: quote.productId,
                rate: quote.rate,
                apr: quote.apr,
                points: quote.points,
                executionPrice: quote.executionPrice,
              },
            });
          }

          const feeItems =
            (quote.fees as MortechFee[] | undefined)?.map((fee: MortechFee) => ({
              description: fee.description,
              amount: fee.feeamount,
              section: fee.section,
              paymentType: fee.paymenttype,
              prepaid: fee.prepaid,
            })) ?? [];

          const totalFees = feeItems.reduce(
            (sum, f) => sum + (Number.isFinite(f.amount) ? f.amount : 0),
            0,
          );

          // quote.points is the <quote_detail price="..."/> attribute (delta vs 100)
          // used by Marksman for the "Price" (100.000 + price) and Points/Credit display.
          const computedPoints = Number.isFinite(quote.points) ? Number(quote.points.toFixed(3)) : 0;

          const updatedRateData = {
            ...rate,
            interestRate: quote.rate,
            apr: quote.apr,
            monthlyPayment: quote.monthlyPayment,
            points: computedPoints,
            lockPeriod: quote.lockTerm,
            executionPrice: quote.executionPrice,
            // Store detailed fee breakdown and numeric summary for DB-backed views.
            fees: totalFees,
            feeItems,
          };

          if (isVaBucket) {
            console.log('🧪 [VA DEBUG][refreshSelectedRates] VA row saved', {
              officerId: row.officerId,
              selectedRateId: row.id,
              bucketId,
              saved: {
                interestRate: updatedRateData.interestRate,
                apr: updatedRateData.apr,
                points: updatedRateData.points,
                executionPrice: updatedRateData.executionPrice,
                lockPeriod: updatedRateData.lockPeriod,
              },
            });
          }

          await db
            .update(selectedRates)
            .set({ rateData: updatedRateData, updatedAt: new Date() })
            .where(eq(selectedRates.id, row.id));

          updated++;
        } catch (err) {
          console.warn(`Refresh selected rate id=${row.id} failed:`, err);
          failed++;
        }
      }),
    );

    console.log('🔁 refreshSelectedRateRows: progress', {
      context,
      processed: Math.min(i + CONCURRENCY, rows.length),
      total: rows.length,
      updated,
      failed,
      elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
    });
  }

  console.log('✅ refreshSelectedRateRows: finished', {
    context,
    totalRows: rows.length,
    updated,
    failed,
    elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
  });

  return { updated, failed };
}

export async function refreshAllSelectedRates(): Promise<RefreshSelectedRatesResult> {
  const joined = await db
    .select({ rate: selectedRates })
    .from(selectedRates)
    .innerJoin(companies, eq(selectedRates.companyId, companies.id))
    .where(eq(companies.hasMortechSubscription, true));
  const rows = joined.map((row) => row.rate);
  return refreshSelectedRateRows(rows, { label: 'all-officers' });
}

export async function refreshSelectedRatesForOfficer(
  officerId: string,
  companyId: string,
): Promise<RefreshSelectedRatesResult> {
  const companyRows = await db
    .select({ hasMortechSubscription: companies.hasMortechSubscription })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (companyRows[0]?.hasMortechSubscription === false) {
    return { updated: 0, failed: 0 };
  }

  const rows = await db
    .select()
    .from(selectedRates)
    .where(
      and(eq(selectedRates.officerId, officerId), eq(selectedRates.companyId, companyId)),
    );

  return refreshSelectedRateRows(rows, {
    label: `officer=${officerId},company=${companyId}`,
  });
}
