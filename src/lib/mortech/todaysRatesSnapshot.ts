/**
 * Global Mortech Today's Rates snapshot: one PAR row per PROGRAM_BUCKET in
 * `mortech_todays_rates_snapshot`. Cron runs ~8 Mortech pricing calls per refresh
 * instead of one per `selected_rates` row per officer.
 */

import { and, eq } from 'drizzle-orm';
import { createMortechAPI, type MortechFee } from '@/lib/mortech/api';
import { db, mortechTodaysRatesSnapshot, selectedRates } from '@/lib/db';
import {
  BUCKET_PRODUCT_IDS,
  PROGRAM_BUCKETS,
  type ProgramBucket,
  type ProgramBucketId,
} from '@/lib/mortech/programBuckets';

export const MORTECH_SNAPSHOT_SCOPE_GLOBAL = 'global' as const;

const FIXED_TODAYS_PRODUCT_LIST_BY_BUCKET: Record<ProgramBucketId, string> = {
  conv_30yr: '4',
  conf_15yr: '2',
  va_30yr: '26',
  fha_30yr: '23',
  jumbo_30yr: '15',
  second_home_30yr: '4',
  home_ready_30yr: '2420',
  home_possible_30yr: '971',
};

const DEFAULT_BUCKET_ID_SET = new Set<string>(PROGRAM_BUCKETS.map((b) => b.id));

function pickParQuoteByPoints(quotes: any[]): any {
  if (!quotes.length) return undefined;

  const EPS = 1e-6;
  const getPoints = (q: any) =>
    typeof q.points === 'number' && Number.isFinite(q.points) ? q.points : Number.POSITIVE_INFINITY;
  const getApr = (q: any) =>
    typeof q.apr === 'number' && Number.isFinite(q.apr) ? q.apr : Number.POSITIVE_INFINITY;

  const zeroPoints = quotes.filter((q) => Math.abs(getPoints(q)) <= EPS);
  if (zeroPoints.length > 0) {
    return zeroPoints.slice().sort((a, b) => getApr(a) - getApr(b))[0];
  }

  return quotes.slice().sort((a, b) => {
    const aAbs = Math.abs(getPoints(a));
    const bAbs = Math.abs(getPoints(b));
    if (aAbs !== bAbs) return aAbs - bAbs;
    return getApr(a) - getApr(b);
  })[0];
}

export type RefreshMortechSnapshotResult = {
  updated: number;
  failed: number;
  bucketsTotal: number;
};

export type MortechMergedApiRateRow = {
  id: string;
  rateData: unknown;
  createdAt: Date;
  updatedAt: Date;
  isGlobalSnapshot?: boolean;
};

const baseScenario = {
  propertyState: 'CA',
  propertyZip: '95825',
  appraisedvalue: 550000,
  loan_amount: 440000,
  fico: 780,
  loanpurpose: 'Purchase' as const,
  proptype: 0 as const,
  lockDays: '30',
};

function rateDataFromParQuote(bucket: ProgramBucket, quote: any): Record<string, unknown> {
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

  const hasExecutionPrice =
    typeof quote.executionPrice === 'number' &&
    Number.isFinite(quote.executionPrice) &&
    quote.executionPrice > 0;

  const points = Number.isFinite(quote.points) ? Number(quote.points.toFixed(3)) : 0;

  const defaultSearchParams = {
    purchasePrice: baseScenario.appraisedvalue,
    downPayment: baseScenario.appraisedvalue - baseScenario.loan_amount,
    loanAmount: baseScenario.loan_amount,
    creditScore: '780-799',
    loanPurpose: baseScenario.loanpurpose,
  } as const;

  return {
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
  };
}

/**
 * Calls Mortech once per PROGRAM_BUCKET and upserts PAR rows into the snapshot table.
 */
export async function refreshMortechTodaysRatesSnapshot(): Promise<RefreshMortechSnapshotResult> {
  const mortechAPI = createMortechAPI();
  let updated = 0;
  let failed = 0;

  for (const bucket of PROGRAM_BUCKETS) {
    try {
      const productList = FIXED_TODAYS_PRODUCT_LIST_BY_BUCKET[bucket.id];
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
        console.warn(
          `[mortech snapshot] ${bucket.id}: no quotes (success=${response.success}, count=${response.quotes?.length ?? 0})`,
        );
        failed++;
        continue;
      }

      const parQuote = pickParQuoteByPoints(response.quotes);
      if (!parQuote) {
        console.warn(`[mortech snapshot] ${bucket.id}: unable to pick PAR quote`);
        failed++;
        continue;
      }

      const rateData = rateDataFromParQuote(bucket, parQuote);

      await db
        .insert(mortechTodaysRatesSnapshot)
        .values({
          scopeKey: MORTECH_SNAPSHOT_SCOPE_GLOBAL,
          bucketId: bucket.id,
          rateData,
        })
        .onConflictDoUpdate({
          target: [mortechTodaysRatesSnapshot.scopeKey, mortechTodaysRatesSnapshot.bucketId],
          set: {
            rateData,
            updatedAt: new Date(),
          },
        });

      updated++;
    } catch (err) {
      console.warn(`[mortech snapshot] ${bucket.id}:`, err);
      failed++;
    }
  }

  return { updated, failed, bucketsTotal: PROGRAM_BUCKETS.length };
}

function bucketOrderIndex(bucketId: string): number {
  const idx = PROGRAM_BUCKETS.findIndex((b) => b.id === bucketId);
  return idx >= 0 ? idx : 999;
}

/**
 * Loads snapshot rows for the global scope. By default does **not** call Mortech;
 * use `refreshMortechTodaysRatesSnapshot` from cron/scripts to populate rows.
 * Pass `{ fillIfIncomplete: true }` only when you explicitly want a read-time refresh
 * (e.g. one-off tooling).
 */
export async function loadMortechSnapshotApiRows(options?: {
  fillIfIncomplete?: boolean;
}): Promise<MortechMergedApiRateRow[]> {
  const fillIfIncomplete = options?.fillIfIncomplete ?? false;

  let rows = await db
    .select()
    .from(mortechTodaysRatesSnapshot)
    .where(eq(mortechTodaysRatesSnapshot.scopeKey, MORTECH_SNAPSHOT_SCOPE_GLOBAL));

  if (fillIfIncomplete && rows.length < PROGRAM_BUCKETS.length) {
    await refreshMortechTodaysRatesSnapshot();
    rows = await db
      .select()
      .from(mortechTodaysRatesSnapshot)
      .where(eq(mortechTodaysRatesSnapshot.scopeKey, MORTECH_SNAPSHOT_SCOPE_GLOBAL));
  }

  rows = rows.slice().sort((a, b) => bucketOrderIndex(a.bucketId) - bucketOrderIndex(b.bucketId));

  return rows.map((row) => ({
    id: row.id,
    rateData: row.rateData,
    createdAt: row.createdAt ?? new Date(),
    updatedAt: row.updatedAt ?? new Date(),
    isGlobalSnapshot: true,
  }));
}

/**
 * Eight default buckets from the global snapshot plus any officer-specific `selected_rates`
 * that are not one of the eight default buckets (e.g. ad‑hoc picks from search).
 */
export async function getMortechMergedSelectedRatesForDisplay(
  officerId: string,
  companyId: string,
): Promise<MortechMergedApiRateRow[]> {
  const snapshotRows = await loadMortechSnapshotApiRows();

  const extraRows = await db
    .select()
    .from(selectedRates)
    .where(and(eq(selectedRates.officerId, officerId), eq(selectedRates.companyId, companyId)));

  const extrasMapped: MortechMergedApiRateRow[] = [];
  for (const row of extraRows) {
    const rd = row.rateData as Record<string, unknown> | null;
    const bid = rd?.bucketId as string | undefined;
    if (bid && DEFAULT_BUCKET_ID_SET.has(bid)) continue;

    extrasMapped.push({
      id: row.id,
      rateData: row.rateData,
      createdAt: row.createdAt ?? new Date(),
      updatedAt: row.updatedAt ?? new Date(),
    });
  }

  extrasMapped.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return [...snapshotRows, ...extrasMapped];
}
