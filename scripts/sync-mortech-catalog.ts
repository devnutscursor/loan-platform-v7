#!/usr/bin/env node
/**
 * Sync Mortech catalog to DB: fetch investors (request_id=2) and products (request_id=3),
 * then store in mortech_investors and mortech_products.
 * Run once before starting the server, or on a schedule (e.g. cron).
 *
 * Usage: yarn sync-mortech-catalog
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { parseString } from 'xml2js';
import { sql } from 'drizzle-orm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env.local'), override: true });

// Dynamic import so DATABASE_URL is set from .env.local before db module loads
async function getDb() {
  const mod = await import('../src/lib/db');
  return { db: mod.db, mortechInvestors: mod.mortechInvestors, mortechProducts: mod.mortechProducts };
}

const baseUrl =
  process.env.MORTECH_BASE_URL ||
  'https://thirdparty.mortech-inc.com/mpg/servlet/mpgThirdPartyServlet';

function parseXml(xml: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parseString(xml, { explicitArray: true, trim: true }, (err: Error | null, result: any) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

function ensureSuccess(header: any): void {
  if (!header) throw new Error('Missing header in Mortech response');
  const errorNum = header.errorNum?.[0];
  const errorDesc = header.errorDesc?.[0] ?? 'Unknown error';
  if (errorNum === undefined) throw new Error('Missing errorNum');
  if (parseInt(String(errorNum), 10) !== 0) throw new Error(`Mortech error ${errorNum}: ${errorDesc}`);
}

async function main() {
  const { db, mortechInvestors, mortechProducts } = await getDb();

  const customerId = process.env.MORTECH_CUSTOMER_ID;
  const thirdPartyName = process.env.MORTECH_THIRD_PARTY_NAME;
  const licenseKey = process.env.MORTECH_LICENSE_KEY;
  const emailAddress = process.env.MORTECH_EMAIL_ADDRESS;

  if (!customerId || !thirdPartyName || !licenseKey || !emailAddress) {
    console.error('❌ Set MORTECH_CUSTOMER_ID, MORTECH_THIRD_PARTY_NAME, MORTECH_LICENSE_KEY, MORTECH_EMAIL_ADDRESS in .env.local');
    process.exit(1);
  }

  console.log('📡 Fetching investors (request_id=2)...');
  const investorsRes = await fetch(
    `${baseUrl}?${new URLSearchParams({
      request_id: '2',
      customerId,
      thirdPartyName,
      licenseKey,
      emailAddress,
    })}`,
    { headers: { Accept: 'application/xml, text/xml' } }
  );
  const investorsXml = await investorsRes.text();
  const investorsParsed = await parseXml(investorsXml);
  const invHeader = investorsParsed.mortech?.header?.[0];
  ensureSuccess(invHeader);

  const investorsRaw = investorsParsed.mortech?.investors?.[0]?.investor ?? [];
  const investors = investorsRaw
    .map((inv: any) => {
      const parentId = inv.$?.parent_id?.trim();
      const name = inv._?.trim();
      if (!parentId || !name) return null;
      return { parentId, name };
    })
    .filter(Boolean) as { parentId: string; name: string }[];

  console.log(`   Found ${investors.length} investors.`);

  console.log('🔌 Testing DB connection...');
  await db.execute(sql`SELECT 1`);
  console.log('   DB connection OK.');

  console.log('🗑️  Clearing existing catalog...');
  await db.execute(sql`TRUNCATE mortech_products, mortech_investors RESTART IDENTITY CASCADE`);
  console.log('   Cleared.');

  if (investors.length === 0) {
    console.log('✅ No investors to insert. Done.');
    process.exit(0);
  }

  console.log(`📥 Inserting ${investors.length} investors...`);
  await db.insert(mortechInvestors).values(
    investors.map((inv) => ({
      parentId: inv.parentId,
      name: inv.name,
      isActive: true,
    }))
  );
  console.log('   Inserted investors.');

  console.log('   Reading back investors...');
  const dbInvestors = await db.select().from(mortechInvestors);
  const investorByParentId = new Map(dbInvestors.map((inv) => [inv.parentId, inv]));
  console.log('   Got investor list.');

  let productCount = 0;
  const totalInvestors = investors.length;
  for (let i = 0; i < investors.length; i++) {
    const investor = investors[i];
    console.log(`📡 Fetching products for investor ${i + 1}/${totalInvestors} (${investor.parentId})...`);
    const productsRes = await fetch(
      `${baseUrl}?${new URLSearchParams({
        request_id: '3',
        customerId,
        thirdPartyName,
        licenseKey,
        emailAddress,
        parent_id: investor.parentId,
      })}`,
      { headers: { Accept: 'application/xml, text/xml' } }
    );
    const productsXml = await productsRes.text();
    const productsParsed = await parseXml(productsXml);
    const prodHeader = productsParsed.mortech?.header?.[0];
    ensureSuccess(prodHeader);

    const productsRaw = productsParsed.mortech?.products?.[0]?.product ?? [];
    const dbInv = investorByParentId.get(investor.parentId) ?? null;
    const numProducts = productsRaw.filter((p: any) => p.$?.product_id?.trim() && p._?.trim()).length;
    console.log(`   Inserting ${numProducts} products for ${investor.parentId}...`);

    for (const product of productsRaw) {
      const productId = product.$?.product_id?.trim();
      const parentId = product.$?.parent_id?.trim() || investor.parentId;
      const vendorProductCode = product.$?.vendor_product_code?.trim();
      const name = product._?.trim();
      if (!productId || !name) continue;

      await db.insert(mortechProducts).values({
        investorId: dbInv?.id ?? null,
        parentId,
        productId,
        name,
        vendorProductCode: vendorProductCode || null,
        isActive: true,
      });
      productCount++;
    }
  }

  console.log(`✅ Stored ${investors.length} investors and ${productCount} products in DB.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
