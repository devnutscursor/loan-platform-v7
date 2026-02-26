import { NextRequest, NextResponse } from 'next/server';
import { getMortechCatalogProducts } from '@/lib/mortech/catalog';

/**
 * GET /api/mortech/catalog/products
 * Returns product list for the Product Category dropdown.
 * Reads only from DB (mortech_investors + mortech_products).
 * Populate DB by running: yarn sync-mortech-catalog
 */
export async function GET(_request: NextRequest) {
  try {
    const list = await getMortechCatalogProducts();
    return NextResponse.json({
      success: true,
      products: list,
    });
  } catch (error) {
    console.error('❌ Error reading Mortech catalog from DB:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load product catalog from DB. Run: yarn sync-mortech-catalog',
      },
      { status: 500 }
    );
  }
}
