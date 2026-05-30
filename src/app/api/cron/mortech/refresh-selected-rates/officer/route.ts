import { NextRequest, NextResponse } from 'next/server';
import { verifyBearerSecret } from '@/lib/api-auth';

/**
 * POST /api/cron/mortech/refresh-selected-rates/officer
 * Legacy endpoint (deprecated). Today's Rates use a global snapshot; this route does
 * not call Mortech. Body: { officerId: string; companyId: string } (still validated).
 * Secured by CRON_SECRET_TOKEN.
 */
export async function POST(req: NextRequest) {
  if (!verifyBearerSecret(req, 'CRON_SECRET_TOKEN')) {
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

    return NextResponse.json({
      success: true,
      officerId,
      companyId,
      result: { updated: 0, failed: 0 },
      message:
        "Per-officer refresh is deprecated. Use POST /api/cron/mortech/refresh-selected-rates to refresh the global Today's Rates snapshot (~8 Mortech calls).",
    });
  } catch (error) {
    console.error('❌ Cron refresh-selected-rates/officer failed:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
