#!/usr/bin/env node
/**
 * Test Mortech pricing for the RateCaddy default program buckets.
 *
 * For each bucket (30yr Conventional, 15yr Conforming, VA, FHA, Jumbo, Second Home,
 * Home Ready, Home Possible), this script:
 *   1. Looks up matching products in the local mortech_products catalog by name.
 *   2. Calls the Mortech API with productList for those product_ids using a fixed scenario.
 *   3. Prints the lowest rate quote returned for that bucket (if any).
 *
 * Usage:
 *   yarn test:mortech-ratecaddy-buckets
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import postgres from 'postgres';
import { createMortechAPI } from '../src/lib/mortech/api';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');
const result = config({ path: envPath, override: true });
if (result.error) {
  console.warn('⚠️  dotenv failed:', result.error.message);
} else {
  console.log('📂 Loaded env from:', envPath);
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set after loading .env.local');
  process.exit(1);
}

const connectionString = DATABASE_URL;
const useSsl =
  process.env.NODE_ENV === 'production' || connectionString.includes('supabase');
const pg = postgres(connectionString, {
  max: 1,
  ssl: useSsl ? 'require' : false,
  prepare: false,
});

type ProgramBucket = {
  id: string;
  label: string;
  match: string;
};

const PROGRAM_BUCKETS: ProgramBucket[] = [
  { id: 'conv_30yr', label: '30yr Conventional', match: 'Conf 30 Yr Fixed' },
  { id: 'conf_15yr', label: '15yr Conforming', match: 'Conf 15 Yr Fixed' },
  { id: 'va_30yr', label: 'VA', match: 'Govt VA 30 Yr Fixed' },
  { id: 'fha_30yr', label: 'FHA', match: 'Govt FHA 30 Yr Fixed' },
  { id: 'jumbo_30yr', label: 'Jumbo', match: 'Agency Jumbo 30 Yr Fixed' },
  { id: 'second_home_30yr', label: 'Second Home', match: 'Second 30 Yr Fixed' },
  { id: 'home_ready_30yr', label: 'Home Ready Program', match: 'Conf Home Ready 30 Yr Fixed' },
  { id: 'home_possible_30yr', label: 'Home Possible Program', match: 'Conf Home Poss 97% 30 Yr Fixed' },
];

async function fetchBucketProducts(bucket: ProgramBucket) {
  switch (bucket.id) {
    case 'conv_30yr': {
      console.log(
        '   🔍 Query: name ILIKE %Conf% AND %30%Yr% AND %Fixed% (excluding Home Ready/Home Possible/HomeStyle)'
      );
      return pg`
        SELECT DISTINCT product_id, name
        FROM mortech_products
        WHERE name ILIKE '%Conf%'
          AND name ILIKE '%30%Yr%'
          AND name ILIKE '%Fixed%'
          AND name NOT ILIKE '%Home Ready%'
          AND name NOT ILIKE '%Home Poss%'
          AND name NOT ILIKE '%HomeStyle%'
        LIMIT 25
      `;
    }
    case 'conf_15yr': {
      console.log(
        '   🔍 Query: name ILIKE %Conf% AND %15%Yr% AND %Fixed% (excluding Home Ready/Home Possible/HomeStyle)'
      );
      return pg`
        SELECT DISTINCT product_id, name
        FROM mortech_products
        WHERE name ILIKE '%Conf%'
          AND name ILIKE '%15%Yr%'
          AND name ILIKE '%Fixed%'
          AND name NOT ILIKE '%Home Ready%'
          AND name NOT ILIKE '%Home Poss%'
          AND name NOT ILIKE '%HomeStyle%'
        LIMIT 25
      `;
    }
    case 'va_30yr': {
      console.log('   🔍 Query: name ILIKE %VA% AND %30%Yr% AND %Fixed%');
      return pg`
        SELECT DISTINCT product_id, name
        FROM mortech_products
        WHERE name ILIKE '%VA%'
          AND name ILIKE '%30%Yr%'
          AND name ILIKE '%Fixed%'
        LIMIT 25
      `;
    }
    case 'fha_30yr': {
      console.log('   🔍 Query: name ILIKE %FHA% AND %30%Yr% AND %Fixed%');
      return pg`
        SELECT DISTINCT product_id, name
        FROM mortech_products
        WHERE name ILIKE '%FHA%'
          AND name ILIKE '%30%Yr%'
          AND name ILIKE '%Fixed%'
        LIMIT 25
      `;
    }
    case 'jumbo_30yr': {
      console.log('   🔍 Query: name ILIKE %Jumbo% AND %30%Yr% AND %Fixed%');
      return pg`
        SELECT DISTINCT product_id, name
        FROM mortech_products
        WHERE name ILIKE '%Jumbo%'
          AND name ILIKE '%30%Yr%'
          AND name ILIKE '%Fixed%'
        LIMIT 25
      `;
    }
    case 'second_home_30yr': {
      console.log('   🔍 Query: name ILIKE %Second Home% AND %30%Yr% AND %Fixed%');
      return pg`
        SELECT DISTINCT product_id, name
        FROM mortech_products
        WHERE name ILIKE '%Second Home%'
          AND name ILIKE '%30%Yr%'
          AND name ILIKE '%Fixed%'
        LIMIT 25
      `;
    }
    case 'home_ready_30yr': {
      console.log('   🔍 Query: name ILIKE %Conf Home Ready% AND %30%Yr%');
      return pg`
        SELECT DISTINCT product_id, name
        FROM mortech_products
        WHERE name ILIKE '%Conf Home Ready%'
          AND name ILIKE '%30%Yr%'
        LIMIT 25
      `;
    }
    case 'home_possible_30yr': {
      console.log('   🔍 Query: name ILIKE %Conf Home Poss 97% AND %30%Yr%');
      return pg`
        SELECT DISTINCT product_id, name
        FROM mortech_products
        WHERE name ILIKE '%Conf Home Poss 97%'
          AND name ILIKE '%30%Yr%'
        LIMIT 25
      `;
    }
    default: {
      const pattern = `%${bucket.match}%`;
      console.log(`   🔍 Query: name ILIKE "${pattern}" (default matcher)`);
      return pg`
        SELECT DISTINCT product_id, name
        FROM mortech_products
        WHERE name ILIKE ${pattern}
        LIMIT 25
      `;
    }
  }
}

async function main() {
  const mortechAPI = createMortechAPI();

  console.log('🚀 Testing Mortech RateCaddy buckets using catalog product_ids\n');

  // Use a direct connection with the DATABASE_URL we just loaded (no app db module)
  try {
    const parsed = new URL(connectionString);
    console.log(
      `🔗 Connected DB: protocol=${parsed.protocol.replace(':', '')}, host=${parsed.host}, pathname=${parsed.pathname}`
    );

    const countRows = await pg`SELECT COUNT(*)::int AS count FROM mortech_products`;
    const total = countRows[0]?.count ?? 0;
    console.log(`📊 mortech_products total rows: ${total}`);

    const sampleRows = await pg`
      SELECT product_id, name FROM mortech_products
      ORDER BY created_at DESC NULLS LAST LIMIT 5
    `;
    console.log('📋 Sample mortech_products rows:');
    for (const row of sampleRows) {
      console.log(`   - product_id=${row.product_id}, name="${row.name}"`);
    }
  } catch (err) {
    console.log('⚠️  Error while debugging mortech_products catalog:', err);
  }

  for (const bucket of PROGRAM_BUCKETS) {
    console.log('='.repeat(80));
    console.log(`🔎 Bucket: ${bucket.label} (match: "${bucket.match}")`);

    // 1) Find candidate product_ids for this bucket from the local catalog
    console.log('   🔍 Searching catalog for bucket-specific patterns...');
    const products = await fetchBucketProducts(bucket);

    if (products.length === 0) {
      console.log('   ⚠️  No catalog products found matching this bucket name. Skipping.');
      continue;
    }

    const productIds = products.map((p) => p.product_id.trim()).filter(Boolean);
    console.log(`   📦 Found ${productIds.length} candidate products in catalog.`);
    console.log(
      `   product_ids (first 10): ${productIds.slice(0, 10).join(', ')}${
        productIds.length > 10 ? ' ...' : ''
      }`
    );

    // 2) Call Mortech API with productList for these IDs using a fixed scenario
    const productList = productIds.join(',');

    const mortechRequest: any = {
      // Scenario chosen to mirror Mortech docs/productList examples:
      // loan_amount=400000, appraisedvalue=500000 -> LTV 80%
      propertyState: 'CA',
      propertyZip: '95825',
      appraisedvalue: 500000,
      loan_amount: 400000,
      fico: 740,
      loanpurpose: 'Purchase',
      proptype: 'Single Family',
      occupancy: 'Primary',
      // We rely on productList to specify the actual program instead of loanProduct1
      productList,
      noMI: 0,
      lockDays: '30',
    };

    console.log(`   📡 Calling Mortech with productList=${productList}`);

    const response = await mortechAPI.getRates(mortechRequest);

    if (!response.success) {
      console.log(`   ❌ Mortech error: ${response.error ?? 'Unknown error'}`);
      continue;
    }

    const quotes = response.quotes || [];
    if (quotes.length === 0) {
      console.log('   ⚠️  No quotes returned for this bucket.');
      continue;
    }

    // 3) Find the lowest-rate quote among all returned quotes
    const best = quotes.reduce((bestSoFar, current) => {
      const bestRate =
        typeof bestSoFar.rate === 'number' && !Number.isNaN(bestSoFar.rate)
          ? bestSoFar.rate
          : Number.POSITIVE_INFINITY;
      const currentRate =
        typeof current.rate === 'number' && !Number.isNaN(current.rate)
          ? current.rate
          : Number.POSITIVE_INFINITY;
      return currentRate < bestRate ? current : bestSoFar;
    }, quotes[0]);

    console.log(`   ✅ Quotes returned: ${quotes.length}`);
    console.log(
      `   ⭐ Lowest rate: ${best.rate}% APR ${best.apr}% | Monthly: $${best.monthlyPayment.toFixed(
        2
      )}`
    );
    console.log(
      `   ↳ product_id=${best.productId} | vendor="${best.vendorName}" | desc="${best.productDesc}"`
    );
  }

  console.log('\n✅ Finished testing RateCaddy buckets.');
  await pg.end();
}

main().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});

