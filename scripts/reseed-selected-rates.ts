#!/usr/bin/env node
/**
 * Clears legacy `selected_rates` rows for Mortech-backed officers and refreshes the
 * global Today's Rates snapshot (`mortech_todays_rates_snapshot`, ~8 Mortech calls).
 *
 * Run after migrating to the snapshot model or when you want to reset officer-specific
 * Mortech picks while keeping the shared PAR rows fresh.
 *
 * Usage: npm run reseed:selected-rates
 *        pnpm reseed:selected-rates
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { and, eq } from 'drizzle-orm';
import { db, selectedRates, userCompanies, companies } from '../src/lib/db';
import { refreshMortechTodaysRatesSnapshot } from '../src/lib/mortech/todaysRatesSnapshot';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env.local'), override: true });

async function getOfficerCompanyPairs(): Promise<{ officerId: string; companyId: string }[]> {
  const rows = await db
    .select({
      officerId: userCompanies.userId,
      companyId: userCompanies.companyId,
      hasMortechSubscription: companies.hasMortechSubscription,
    })
    .from(userCompanies)
    .innerJoin(companies, eq(userCompanies.companyId, companies.id))
    .where(eq(userCompanies.isActive, true));

  return rows
    .filter((r) => r.hasMortechSubscription !== false)
    .map((r) => ({ officerId: r.officerId, companyId: r.companyId }));
}

async function reseed() {
  const pairs = await getOfficerCompanyPairs();
  console.log(`Clearing selected_rates for ${pairs.length} Mortech officer+company pair(s)...\n`);

  for (const { officerId, companyId } of pairs) {
    await db
      .delete(selectedRates)
      .where(
        and(
          eq(selectedRates.officerId, officerId),
          eq(selectedRates.companyId, companyId),
        ),
      );
  }

  const result = await refreshMortechTodaysRatesSnapshot();
  console.log('Global snapshot refresh:', result);
}

reseed()
  .then(() => {
    console.log('Reseed completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Reseed failed:', err);
    process.exit(1);
  });
