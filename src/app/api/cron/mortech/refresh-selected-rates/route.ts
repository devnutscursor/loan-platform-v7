import { NextRequest, NextResponse } from 'next/server';
import { refreshAllSelectedRates } from '@/lib/mortech/refreshSelectedRates';

/**
 * POST /api/cron/mortech/refresh-selected-rates
 * Refreshes all selected rates: reads from DB, calls Mortech per row, updates rateData.
 * Secured by CRON_SECRET_TOKEN. Invoke from AWS Lambda 3× daily.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const expected = `Bearer ${process.env.CRON_SECRET_TOKEN}`;
  if (!process.env.CRON_SECRET_TOKEN || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await refreshAllSelectedRates();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('❌ Cron refreshAllSelectedRates failed:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
