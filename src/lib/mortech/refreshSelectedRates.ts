/**
 * Refresh all selected rates in DB: for each row, call Mortech with stored
 * search params + product, then update rateData with new rate/APR/P&I/points.
 * Used by:
 * - POST /api/cron/mortech/refresh-selected-rates          (refresh ALL officers)
 * - POST /api/cron/mortech/refresh-selected-rates/officer  (refresh single officer)
 */

import { and, eq } from 'drizzle-orm';
import { createMortechAPI } from '@/lib/mortech/api';
import { db, selectedRates } from '@/lib/db';

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
        const search = (rate.searchParams as Record<string, unknown>) || {};

        const appraisedvalue =
          typeof search.purchasePrice === 'number' && !Number.isNaN(search.purchasePrice)
            ? search.purchasePrice
            : 500000;
        const loan_amount =
          typeof search.loanAmount === 'number' && !Number.isNaN(search.loanAmount)
            ? search.loanAmount
            : 400000;
        const fico = parseFico(search.creditScore);
        const loanpurpose =
          search.loanPurpose === 'Refinance' ? 'Refinance' : 'Purchase';
        const lockDays = '30';

        const productId = rate.productId ?? rate.id;
        const request: Record<string, unknown> = {
          propertyState: 'CA',
          propertyZip: '95825',
          appraisedvalue,
          loan_amount,
          fico,
          loanpurpose,
          proptype: 'Single Family',
          occupancy: 'Primary',
          lockDays,
        };

        if (productId != null && String(productId).trim() !== '') {
          request.productList = String(productId).trim();
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
          let quote = quotes[0];
          if (productId != null) {
            const productIdStr = String(productId);
            const exact = quotes.find((q) => q.productId === productIdStr);
            if (exact) quote = exact;
          } else {
            quote = quotes.reduce((best, q) =>
              (q.rate ?? Number.POSITIVE_INFINITY) < (best.rate ?? Number.POSITIVE_INFINITY)
                ? q
                : best,
            );
          }

          const updatedRateData = {
            ...rate,
            interestRate: quote.rate,
            apr: quote.apr,
            monthlyPayment: quote.monthlyPayment,
            points: quote.points,
            lockPeriod: quote.lockTerm,
            executionPrice: quote.executionPrice,
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
  const rows = await db.select().from(selectedRates);
  return refreshSelectedRateRows(rows, { label: 'all-officers' });
}

export async function refreshSelectedRatesForOfficer(
  officerId: string,
  companyId: string,
): Promise<RefreshSelectedRatesResult> {
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
