import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase/service';
import { getPublicProfileData } from '@/lib/public-profile';

export const revalidate = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Slug is required' },
        { status: 400 }
      );
    }

    const payload = await getPublicProfileData(slug);

    const supabase = getSupabaseService();
    const link = payload.data.publicLink;
    const linkId = payload.data.publicLink?.id;
    if (linkId && link) {
      const userAgent = request.headers.get('user-agent') || null;
      const referrer = request.headers.get('referer') || null;
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      (async () => {
        try {
          await supabase.from('public_link_usage').insert({
            link_id: linkId,
            ip_address: ipAddress,
            user_agent: userAgent,
            referrer,
          });
          await supabase
            .from('loan_officer_public_links')
            .update({
              current_uses: (payload.data.publicLink.currentUses ?? 0),
              updated_at: new Date().toISOString(),
            })
            .eq('id', linkId);
        } catch (e) {
          console.warn('Failed to record usage analytics:', e);
        }
      })().catch(() => {});
    }

    const res = NextResponse.json(payload);
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return res;
  } catch (err: any) {
    if (err && typeof err.status === 'number') {
      return NextResponse.json(
        { success: false, message: err.message ?? 'Not found' },
        { status: err.status }
      );
    }
    console.error('Error fetching public profile:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: err?.message ?? 'Unknown error',
      },
      { status: 500 }
    );
  }
}
