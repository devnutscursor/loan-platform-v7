import { PROGRAM_BUCKETS } from '@/lib/mortech/programBuckets';

export type SelectedRateRow = {
  id: string;
  rateData: Record<string, unknown> | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  isGlobalSnapshot?: boolean;
};

export type DisplayRateProduct = {
  id: string;
  lenderName: string;
  loanProgram: string;
  loanType: string;
  loanTerm: number;
  interestRate: number;
  apr: number;
  executionPrice?: number;
  monthlyPayment: number;
  fees: number;
  points: number;
  credits: number;
  lockPeriod: number;
  searchParams?: {
    purchasePrice?: number;
    downPayment?: number;
    loanAmount: number;
    creditScore: string;
    loanPurpose: 'Purchase' | 'Refinance';
  };
};

function getInterestRate(rate: Record<string, unknown>): number {
  const value = rate.interestRate ?? rate.rate;
  return typeof value === 'number' && !Number.isNaN(value) ? value : Number.POSITIVE_INFINITY;
}

function getExecutionPrice(rate: Record<string, unknown>): number | undefined {
  const value = rate.executionPrice;
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
}

function getParPoints(rate: Record<string, unknown>): number {
  const ep = getExecutionPrice(rate);
  if (ep === undefined) return 0;
  const diff = ep - 100;
  if (Math.abs(diff) < 0.0005) return 0;
  return Number(diff.toFixed(3));
}

function getPoints(rate: Record<string, unknown>): number {
  const value =
    typeof rate.points === 'number' && !Number.isNaN(rate.points) ? rate.points : getParPoints(rate);
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function getApr(rate: Record<string, unknown>): number {
  const value = rate.apr;
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function mapRateToProduct(
  selectedRate: SelectedRateRow,
  lenderName: string,
  loanProgramOverride?: string,
): DisplayRateProduct {
  const rate = (selectedRate.rateData ?? {}) as Record<string, unknown>;
  const rawLoanTerm = rate.loanTerm ?? rate.productTerm ?? 30;
  const loanTerm =
    typeof rawLoanTerm === 'number' ? rawLoanTerm : parseInt(String(rawLoanTerm), 10) || 30;
  const interestRate = getInterestRate(rate);
  const apr = typeof rate.apr === 'number' && !Number.isNaN(rate.apr) ? rate.apr : 0;
  const monthlyPayment =
    typeof rate.monthlyPayment === 'number' && !Number.isNaN(rate.monthlyPayment)
      ? rate.monthlyPayment
      : 0;
  const feeItems = Array.isArray(rate.feeItems)
    ? rate.feeItems
    : Array.isArray(rate.fees)
      ? rate.fees
      : [];
  const totalFees =
    feeItems.length > 0
      ? (feeItems as Array<{ amount?: number; feeamount?: number }>).reduce(
          (sum, f) =>
            sum +
            (Number.isFinite(f.amount) ? (f.amount as number) : Number.isFinite(f.feeamount) ? (f.feeamount as number) : 0),
          0,
        )
      : typeof rate.fees === 'number' && !Number.isNaN(rate.fees)
        ? rate.fees
        : 0;
  const points =
    typeof rate.points === 'number' && !Number.isNaN(rate.points) ? rate.points : getParPoints(rate);
  const credits = typeof rate.credits === 'number' && !Number.isNaN(rate.credits) ? rate.credits : 0;
  const lockPeriodRaw = rate.lockPeriod ?? rate.lockTerm ?? 30;
  const lockPeriod =
    typeof lockPeriodRaw === 'number' ? lockPeriodRaw : parseInt(String(lockPeriodRaw), 10) || 30;

  return {
    id: String(rate.id ?? rate.productId ?? selectedRate.id),
    lenderName,
    loanProgram: loanProgramOverride ?? String(rate.loanProgram ?? 'Loan Program'),
    loanType: String(rate.loanType ?? rate.termType ?? 'Fixed'),
    loanTerm,
    interestRate: Number.isFinite(interestRate) ? interestRate : 0,
    apr,
    executionPrice: getExecutionPrice(rate),
    monthlyPayment,
    fees: totalFees,
    points,
    credits,
    lockPeriod,
    searchParams: rate.searchParams as DisplayRateProduct['searchParams'],
  };
}

function pickBestForBucket(matching: SelectedRateRow[]): SelectedRateRow {
  return matching.reduce((bestSoFar, current) => {
    const bestRateData = (bestSoFar.rateData ?? {}) as Record<string, unknown>;
    const currentRateData = (current.rateData ?? {}) as Record<string, unknown>;

    const bestAbsPoints = Math.abs(getPoints(bestRateData));
    const currentAbsPoints = Math.abs(getPoints(currentRateData));
    if (currentAbsPoints < bestAbsPoints) return current;
    if (currentAbsPoints > bestAbsPoints) return bestSoFar;

    const bestApr = getApr(bestRateData);
    const currentApr = getApr(currentRateData);
    if (currentApr < bestApr) return current;
    if (currentApr > bestApr) return bestSoFar;

    const bestEp = getExecutionPrice(bestRateData);
    const currentEp = getExecutionPrice(currentRateData);
    if (bestEp === undefined && currentEp !== undefined) return current;
    if (bestEp !== undefined && currentEp === undefined) return bestSoFar;
    if (bestEp !== undefined && currentEp !== undefined) {
      const bestEpDiff = Math.abs(bestEp - 100);
      const currentEpDiff = Math.abs(currentEp - 100);
      if (currentEpDiff < bestEpDiff) return current;
      if (currentEpDiff > bestEpDiff) return bestSoFar;
    }

    const bestRate = getInterestRate(bestRateData);
    const currentRate = getInterestRate(currentRateData);
    return currentRate < bestRate ? current : bestSoFar;
  });
}

/**
 * Maps API selected-rates rows to the 8-bucket Today's Rates display cards.
 * Fast path: snapshot rows already carry `bucketId` (O(n) map + O(8) lookup).
 */
export function mapRatesToDisplayProducts(
  selectedRates: SelectedRateRow[],
  options: { hasMortechSubscription?: boolean } = {},
): DisplayRateProduct[] {
  const hasMortech = options.hasMortechSubscription !== false;

  if (!hasMortech) {
    return selectedRates.map((row) => mapRateToProduct(row, 'Manual Rate'));
  }

  const byBucketId = new Map<string, SelectedRateRow>();
  const untagged: SelectedRateRow[] = [];

  for (const row of selectedRates) {
    const bucketId = row.rateData?.bucketId;
    if (typeof bucketId === 'string' && bucketId.length > 0) {
      byBucketId.set(bucketId, row);
    } else {
      untagged.push(row);
    }
  }

  const bucketProducts = PROGRAM_BUCKETS.map((bucket) => {
    const snapshotRow = byBucketId.get(bucket.id);
    if (snapshotRow) {
      return mapRateToProduct(snapshotRow, "Today's Rates", bucket.label);
    }

    const matchLower = bucket.match.toLowerCase();
    const labelLower = bucket.label.toLowerCase();
    const matching = untagged.filter((selectedRate) => {
      const rate = (selectedRate.rateData ?? {}) as Record<string, unknown>;
      const program = String(rate.loanProgram ?? '').toLowerCase();
      const productDesc = String(rate.productDesc ?? '').toLowerCase();
      const vendorName = String(rate.vendorProductName ?? '').toLowerCase();
      const vendorCode = String(rate.vendorProductCode ?? '').toLowerCase();
      const combined = `${program} ${productDesc} ${vendorName} ${vendorCode}`;
      return combined.includes(matchLower) || combined.includes(labelLower);
    });

    if (matching.length === 0) return null;
    return mapRateToProduct(pickBestForBucket(matching), "Today's Rates", bucket.label);
  }).filter((p): p is DisplayRateProduct => p !== null);

  return bucketProducts;
}
