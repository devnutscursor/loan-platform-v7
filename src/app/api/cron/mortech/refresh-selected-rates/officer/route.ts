import { NextRequest, NextResponse } from 'next/server';
import { refreshSelectedRatesForOfficer } from '@/lib/mortech/refreshSelectedRates';

/**
 * POST /api/cron/mortech/refresh-selected-rates/officer
 * Refreshes selected rates for a single officer+company pair.
 * Body: { officerId: string; companyId: string }
 * Secured by CRON_SECRET_TOKEN. Intended to be called from a Lambda driver.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const expected = `Bearer ${process.env.CRON_SECRET_TOKEN}`;
  if (!process.env.CRON_SECRET_TOKEN || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const officerId = body.officerId as string | undefined;
    const companyId = body.companyId as string | undefined;

    if (!officerId || !companyId) {
      return NextResponse.json(
        { error: 'officerId and companyId are required' },
        { status: 400 },
      );
    }

    const result = await refreshSelectedRatesForOfficer(officerId, companyId);
    return NextResponse.json({
      success: true,
      officerId,
      companyId,
      result,
    });
  } catch (error) {
    console.error('❌ Cron refreshSelectedRatesForOfficer failed:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

