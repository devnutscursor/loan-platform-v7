/**
 * Mortech Today's Rates refresh entry points for cron.
 *
 * Selected-rate rows are no longer refreshed one-by-one. The global snapshot in
 * `mortech_todays_rates_snapshot` is refreshed instead (~8 Mortech API calls per run).
 *
 * Used by:
 * - POST /api/cron/mortech/refresh-selected-rates
 */

import { refreshMortechTodaysRatesSnapshot } from '@/lib/mortech/todaysRatesSnapshot';

export type RefreshSelectedRatesResult = { updated: number; failed: number };

export async function refreshAllSelectedRates(): Promise<RefreshSelectedRatesResult> {
  const r = await refreshMortechTodaysRatesSnapshot();
  return { updated: r.updated, failed: r.failed };
}
