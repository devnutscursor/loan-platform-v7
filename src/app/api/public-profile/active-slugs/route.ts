import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase/service';

/**
 * GET /api/public-profile/active-slugs
 * Returns all active public profile slugs (e.g. for cache preloading).
 * Secured by ?key=KEEP_WARM_SECRET or header x-keep-warm-key.
 */
export async function GET(request: NextRequest) {
  try {
    const secret = process.env.KEEP_WARM_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Keep-warm not configured' },
        { status: 503 }
      );
    }

    const keyQuery = request.nextUrl.searchParams.get('key');
    const keyHeader = request.headers.get('x-keep-warm-key');
    if (keyQuery !== secret && keyHeader !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseService();
    const { data: rows, error } = await supabase
      .from('loan_officer_public_links')
      .select('public_slug, is_active, expires_at, max_uses, current_uses')
      .eq('is_active', true);

    if (error) {
      console.error('active-slugs: DB error', error);
      return NextResponse.json(
        { error: 'Failed to fetch links' },
        { status: 500 }
      );
    }

    const now = new Date();
    const slugs: string[] = [];
    for (const row of rows ?? []) {
      const r = row as {
        public_slug: string;
        is_active: boolean;
        expires_at: string | null;
        max_uses: number | null;
        current_uses: number | null;
      };
      if (r.expires_at && new Date(r.expires_at) < now) continue;
      if (r.max_uses != null && (r.current_uses ?? 0) >= r.max_uses) continue;
      slugs.push(r.public_slug);
    }

    return NextResponse.json({ slugs });
  } catch (e) {
    console.error('active-slugs error', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
