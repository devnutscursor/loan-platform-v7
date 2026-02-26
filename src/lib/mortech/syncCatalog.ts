/**
 * Sync Mortech catalog to DB: fetch investors (request_id=2) and products (request_id=3),
 * then upsert into mortech_investors and mortech_products.
 * Used by: POST /api/cron/mortech/sync-catalog (and optionally scripts/sync-mortech-catalog.ts).
 */

import { parseString } from 'xml2js';
import { sql } from 'drizzle-orm';
import { db, mortechInvestors, mortechProducts } from '@/lib/db';

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
  if (parseInt(String(errorNum), 10) !== 0) {
    throw new Error(`Mortech error ${errorNum}: ${errorDesc}`);
  }
}

export type SyncCatalogResult = { investors: number; products: number };

export async function syncMortechCatalogToDb(): Promise<SyncCatalogResult> {
  const customerId = process.env.MORTECH_CUSTOMER_ID;
  const thirdPartyName = process.env.MORTECH_THIRD_PARTY_NAME;
  const licenseKey = process.env.MORTECH_LICENSE_KEY;
  const emailAddress = process.env.MORTECH_EMAIL_ADDRESS;

  if (!customerId || !thirdPartyName || !licenseKey || !emailAddress) {
    throw new Error(
      'Missing Mortech env vars (MORTECH_CUSTOMER_ID, MORTECH_THIRD_PARTY_NAME, MORTECH_LICENSE_KEY, MORTECH_EMAIL_ADDRESS)',
    );
  }

  // 1) Fetch investors (request_id=2)
  const investorsRes = await fetch(
    `${baseUrl}?${new URLSearchParams({
      request_id: '2',
      customerId,
      thirdPartyName,
      licenseKey,
      emailAddress,
    })}`,
    { headers: { Accept: 'application/xml, text/xml' } },
  );
  const investorsXml = await investorsRes.text();
  const investorsParsed = await parseXml(investorsXml);
  const invHeader = investorsParsed.mortech?.header?.[0];
  ensureSuccess(invHeader);

  const investorsRaw = investorsParsed.mortech?.investors?.[0]?.investor ?? [];
  const investors = (investorsRaw
    .map((inv: any) => {
      const parentId = inv.$?.parent_id?.trim();
      const name = inv._?.trim();
      if (!parentId || !name) return null;
      return { parentId, name };
    })
    .filter(Boolean) ?? []) as { parentId: string; name: string }[];

  await db.execute(sql`SELECT 1`);

  await db.execute(
    sql`TRUNCATE mortech_products, mortech_investors RESTART IDENTITY CASCADE`,
  );

  if (investors.length === 0) {
    return { investors: 0, products: 0 };
  }

  await db.insert(mortechInvestors).values(
    investors.map((inv) => ({
      parentId: inv.parentId,
      name: inv.name,
      isActive: true,
    })),
  );

  const dbInvestors = await db.select().from(mortechInvestors);
  const investorByParentId = new Map(dbInvestors.map((inv) => [inv.parentId, inv]));

  let productCount = 0;
  for (const investor of investors) {
    const productsRes = await fetch(
      `${baseUrl}?${new URLSearchParams({
        request_id: '3',
        customerId,
        thirdPartyName,
        licenseKey,
        emailAddress,
        parent_id: investor.parentId,
      })}`,
      { headers: { Accept: 'application/xml, text/xml' } },
    );
    const productsXml = await productsRes.text();
    const productsParsed = await parseXml(productsXml);
    const prodHeader = productsParsed.mortech?.header?.[0];
    ensureSuccess(prodHeader);

    const productsRaw = productsParsed.mortech?.products?.[0]?.product ?? [];
    const dbInv = investorByParentId.get(investor.parentId) ?? null;

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

  return { investors: investors.length, products: productCount };
}
