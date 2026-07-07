import { loadMortechSnapshotApiRows } from '@/lib/mortech/todaysRatesSnapshot';
import { PROGRAM_BUCKETS } from '@/lib/mortech/programBuckets';
import { EMBED_RATE_MARKUP } from '@/lib/embed/constants';

export { EMBED_RATE_MARKUP };

export type EmbedTodaysRateRow = {
  bucketId: string;
  loanProgram: string;
  interestRate: number;
  displayRate: number;
  apr: number;
  displayApr: number;
  updatedAt: string;
};

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function bucketLabel(bucketId: string): string {
  return PROGRAM_BUCKETS.find((b) => b.id === bucketId)?.label ?? bucketId;
}

export function applyEmbedRateMarkup(rate: number): number {
  return Number((rate + EMBED_RATE_MARKUP).toFixed(3));
}

export function formatEmbedRate(rate: number): string {
  return `${rate.toFixed(3)}%`;
}

export async function getEmbedTodaysRates(): Promise<EmbedTodaysRateRow[]> {
  const snapshotRows = await loadMortechSnapshotApiRows();

  return snapshotRows
    .map((row) => {
      const rd = (row.rateData ?? {}) as Record<string, unknown>;
      const bucketId = String(rd.bucketId ?? '');
      const interestRate =
        readNumber(rd.interestRate) ?? readNumber(rd.rate);
      const apr = readNumber(rd.apr);

      if (interestRate === null || apr === null) return null;

      const loanProgram =
        (typeof rd.loanProgram === 'string' && rd.loanProgram.trim()) ||
        bucketLabel(bucketId);

      const updatedAt =
        row.updatedAt instanceof Date
          ? row.updatedAt.toISOString()
          : String(row.updatedAt ?? new Date().toISOString());

      return {
        bucketId,
        loanProgram,
        interestRate,
        displayRate: applyEmbedRateMarkup(interestRate),
        apr,
        displayApr: applyEmbedRateMarkup(apr),
        updatedAt,
      };
    })
    .filter((row): row is EmbedTodaysRateRow => row !== null);
}
