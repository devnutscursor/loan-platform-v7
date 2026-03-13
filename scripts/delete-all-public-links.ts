#!/usr/bin/env node
/**
 * Deletes all rows from loan_officer_public_links.
 * Use before switching to name-based public slugs (e.g. firstname+lastinitial).
 * After running, officers will get a new link with the new format when they create one.
 *
 * Usage: npm run script:delete-all-public-links
 *        npx tsx scripts/delete-all-public-links.ts
 *
 * Loads .env.local automatically so DATABASE_URL is set.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env.local'), override: true });

async function run() {
  const { db, loanOfficerPublicLinks } = await import('../src/lib/db');
  const deleted = await db.delete(loanOfficerPublicLinks).returning({ id: loanOfficerPublicLinks.id });
  console.log(`Deleted ${deleted.length} row(s) from loan_officer_public_links.`);
  console.log('Officers will get a new name-based slug when they create a public link.');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
