#!/usr/bin/env node
/**
 * Reseed selected_rates for all officers (with Mortech subscription).
 * - Deletes existing selected_rates rows per officer+company.
 * - Calls seedSelectedRatesForOfficer (PAR-based) to insert fresh rows per bucket.
 *
 * Run once after changing seed logic to PAR, or when you want to reset Today's Rates.
 *
 * Usage: npm run reseed:selected-rates
 *        pnpm reseed:selected-rates
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { and, eq } from 'drizzle-orm';
import { db, selectedRates, userCompanies, companies } from '../src/lib/db';
import { seedSelectedRatesForOfficer } from '../src/lib/mortech/seedSelectedRates';

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
  console.log(`Found ${pairs.length} officer+company pair(s) to reseed.\n`);

  for (const { officerId, companyId } of pairs) {
    console.log(`Reseeding officer=${officerId}, company=${companyId} ...`);

    await db
      .delete(selectedRates)
      .where(
        and(
          eq(selectedRates.officerId, officerId),
          eq(selectedRates.companyId, companyId),
        ),
      );

    const { rates, seeded } = await seedSelectedRatesForOfficer(officerId, companyId);
    console.log(`  -> ${seeded ? `inserted ${rates.length} rows` : 'no new rows (already had data)'}\n`);
  }
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
