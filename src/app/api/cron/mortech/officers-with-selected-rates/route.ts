import { NextRequest, NextResponse } from 'next/server';
import { db, selectedRates } from '@/lib/db';

/**
 * GET /api/cron/mortech/officers-with-selected-rates
 * Returns distinct (officerId, companyId) from selected_rates for Lambda to call
 * POST .../refresh-selected-rates/officer for each.
 * Secured by CRON_SECRET_TOKEN.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const expected = `Bearer ${process.env.CRON_SECRET_TOKEN}`;
  if (!process.env.CRON_SECRET_TOKEN || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await db
      .selectDistinct({
        officerId: selectedRates.officerId,
        companyId: selectedRates.companyId,
      })
      .from(selectedRates);

    return NextResponse.json({
      success: true,
      count: rows.length,
      officers: rows,
    });
  } catch (error) {
    console.error('❌ Cron officers-with-selected-rates failed:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
