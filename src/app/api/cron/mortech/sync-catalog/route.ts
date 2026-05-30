import { NextRequest, NextResponse } from 'next/server';
import { syncMortechCatalogToDb } from '@/lib/mortech/syncCatalog';
import { verifyBearerSecret } from '@/lib/api-auth';

/**
 * POST /api/cron/mortech/sync-catalog
 * Syncs Mortech product catalog (investors + products) to DB for the dropdown.
 * Secured by CRON_SECRET_TOKEN. Invoke from AWS Lambda on a schedule (e.g. daily).
 */
export async function POST(req: NextRequest) {
  if (!verifyBearerSecret(req, 'CRON_SECRET_TOKEN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncMortechCatalogToDb();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('❌ Cron syncMortechCatalogToDb failed:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
