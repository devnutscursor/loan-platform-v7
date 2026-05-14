#!/usr/bin/env node
/**
 * Refreshes `mortech_todays_rates_snapshot` (~8 Mortech calls), same as
 * POST /api/cron/mortech/refresh-selected-rates (without needing Next.js or CRON_SECRET_TOKEN).
 *
 * Usage:
 *   npx tsx scripts/run-mortech-snapshot-refresh.ts
 *   npm run cron:refresh-todays-rates
 *
 * Loads `.env` then `.env.local` before any DB import (DATABASE_URL + Mortech vars).
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env') });
config({ path: path.resolve(__dirname, '../.env.local'), override: true });

async function main() {
  const { refreshMortechTodaysRatesSnapshot } = await import(
    '../src/lib/mortech/todaysRatesSnapshot',
  );
  console.log("Refreshing global Mortech Today's Rates snapshot...\n");
  const result = await refreshMortechTodaysRatesSnapshot();
  console.log(JSON.stringify(result, null, 2));
  if (result.failed > 0 && result.updated === 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
