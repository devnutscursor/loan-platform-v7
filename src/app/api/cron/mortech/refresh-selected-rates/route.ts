import { NextRequest, NextResponse } from 'next/server';
import { refreshAllSelectedRates } from '@/lib/mortech/refreshSelectedRates';
import { verifyBearerSecret } from '@/lib/api-auth';

/**
 * POST /api/cron/mortech/refresh-selected-rates
 * Refreshes the global Mortech Today's Rates snapshot (`mortech_todays_rates_snapshot`):
 * one PAR quote per program bucket (~8 Mortech API calls per run).
 * Secured by CRON_SECRET_TOKEN. Invoke from AWS Lambda 3× daily.
 */
export async function POST(req: NextRequest) {
  if (!verifyBearerSecret(req, 'CRON_SECRET_TOKEN')) {
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
