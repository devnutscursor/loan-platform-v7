import { db, mortechInvestors, mortechProducts } from '@/lib/db';
import { eq } from 'drizzle-orm';

export type CatalogProduct = {
  id: string;
  parentId: string;
  productId: string;
  investorName: string;
  productName: string;
  vendorProductCode?: string;
};

/**
 * Fetch Mortech product catalog from DB (for SSR or API).
 * Use in server components or API routes so the Product Category dropdown can be preloaded.
 */
export async function getMortechCatalogProducts(): Promise<CatalogProduct[]> {
  const products = await db
    .select({
      parentId: mortechProducts.parentId,
      productId: mortechProducts.productId,
      productName: mortechProducts.name,
      vendorProductCode: mortechProducts.vendorProductCode,
      investorName: mortechInvestors.name,
    })
    .from(mortechProducts)
    .leftJoin(
      mortechInvestors,
      eq(mortechProducts.investorId, mortechInvestors.id)
    )
    .where(eq(mortechProducts.isActive, true));

  const list: CatalogProduct[] = products
    .map((row) => ({
      id: `${row.parentId}:${row.productId}`,
      parentId: row.parentId,
      productId: row.productId,
      investorName: row.investorName ?? '',
      productName: row.productName,
      vendorProductCode: row.vendorProductCode ?? undefined,
    }))
    .sort((a, b) => {
      if (a.investorName === b.investorName) {
        return a.productName.localeCompare(b.productName);
      }
      return a.investorName.localeCompare(b.investorName);
    });

  return list;
}
