import { NextRequest, NextResponse } from 'next/server';
import {
  EMBED_RATE_MARKUP,
  getEmbedTodaysRates,
} from '@/lib/mortech/embedTodaysRates';
import { getOfficerEmbedBySlug } from '@/lib/embed/officerEmbedWidget';

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CACHE_HEADERS });
}

export async function GET(request: NextRequest) {
  try {
    const officerSlug = new URL(request.url).searchParams.get('officer')?.trim();
    const officer = officerSlug ? await getOfficerEmbedBySlug(officerSlug) : null;

    if (officerSlug && !officer) {
      return NextResponse.json(
        { success: false, error: 'Embed widget not found' },
        { status: 404, headers: CACHE_HEADERS },
      );
    }

    const rates = await getEmbedTodaysRates();
    const latestUpdatedAt = rates.reduce<string | null>((latest, row) => {
      if (!latest || row.updatedAt > latest) return row.updatedAt;
      return latest;
    }, null);

    return NextResponse.json(
      {
        success: true,
        markup: EMBED_RATE_MARKUP,
        updatedAt: latestUpdatedAt,
        officer,
        rates,
      },
      { headers: CACHE_HEADERS },
    );
  } catch (error) {
    console.error('[embed/todays-rates]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load rates' },
      { status: 500, headers: CACHE_HEADERS },
    );
  }
}
