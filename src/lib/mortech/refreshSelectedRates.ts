/**
 * Refresh all selected rates in DB: for each row, call Mortech with stored
 * search params + product, then update rateData with new rate/APR/P&I/points.
 * Used by:
 * - POST /api/cron/mortech/refresh-selected-rates          (refresh ALL officers)
 * - POST /api/cron/mortech/refresh-selected-rates/officer  (refresh single officer)
 */

import { and, eq } from 'drizzle-orm';
import { createMortechAPI } from '@/lib/mortech/api';
import { db, selectedRates, companies } from '@/lib/db';
import { PROGRAM_BUCKETS, BUCKET_PRODUCT_IDS } from '@/lib/mortech/programBuckets';

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

        const request: Record<string, unknown> = {
          propertyState: 'CA',
          propertyZip: '95825',
          appraisedvalue,
          loan_amount,
          fico,
          loanpurpose,
          // 0 = 1 unit
          proptype: 0,
          // 0 = Owner occupied (Primary)
          occupancy: 0,
          lockDays,
        };

        // Prefer bucket-based productList (same as Custom Rates) so that
        // refresh uses the full family of candidate products for that bucket.
        let productList = inferBucketProductList(rate);
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

        try {
          const response = await mortechAPI.getRates(request as any);
          if (!response.success || !response.quotes || response.quotes.length === 0) {
            failed++;
            return;
          }

          const quotes = response.quotes;

          // Choose PAR within this product's ladder:
          // 1) Prefer the quote whose executionPrice (ratesheet_price) is closest to 100.
          // 2) If no executionPrice is available on any quote, fall back to lowest note rate.
          let bestQuote = quotes[0];
          let bestDiff = Number.POSITIVE_INFINITY;
          let foundExecutionPrice = false;

          for (const q of quotes) {
            const ep = q.executionPrice;
            if (typeof ep === 'number' && Number.isFinite(ep) && ep > 0) {
              const diff = Math.abs(ep - 100);
              if (diff < bestDiff) {
                bestDiff = diff;
                bestQuote = q;
                foundExecutionPrice = true;
              }
            }
          }

          if (!foundExecutionPrice) {
            bestQuote = quotes.reduce((best, q) =>
              (q.rate ?? Number.POSITIVE_INFINITY) < (best.rate ?? Number.POSITIVE_INFINITY)
                ? q
                : best,
            );
          }

          const quote = bestQuote;

          const feeItems =
            quote.fees?.map((fee) => ({
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

          const hasExecutionPrice =
            typeof quote.executionPrice === 'number' &&
            Number.isFinite(quote.executionPrice) &&
            quote.executionPrice > 0;

          const computedPoints =
            hasExecutionPrice
              ? Number((100 - quote.executionPrice!).toFixed(3))
              : quote.points;

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
