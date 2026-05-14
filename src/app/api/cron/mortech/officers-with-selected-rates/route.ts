import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/cron/mortech/officers-with-selected-rates
 * Legacy endpoint: previously returned distinct (officerId, companyId) pairs for
 * per-officer refresh. Today's Rates now use a global snapshot only; this returns
 * an empty list with `useGlobalCron` so old Lambdas fail soft.
 * Secured by CRON_SECRET_TOKEN.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const expected = `Bearer ${process.env.CRON_SECRET_TOKEN}`;
  if (!process.env.CRON_SECRET_TOKEN || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json({
      success: true,
      count: 0,
      officers: [] as { officerId: string; companyId: string }[],
      useGlobalCron: true,
      message:
        'Per-officer refresh removed. Schedule POST /api/cron/mortech/refresh-selected-rates only.',
    });
  } catch (error) {
    console.error('❌ Cron officers-with-selected-rates failed:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
