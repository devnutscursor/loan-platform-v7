import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase/service';

/**
 * GET /api/public/invite-info?companyId=...
 * Returns minimal company information needed to render invite acceptance pages.
 * Public endpoint — no auth required (used before profile is created).
 */
export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ success: false, error: 'companyId is required' }, { status: 400 });
    }

    const admin = getSupabaseService();

    const { data: company, error } = await admin
      .from('companies')
      .select('name, admin_email, invite_status, invite_expires_at')
      .eq('id', companyId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        name: company.name,
        adminEmail: company.admin_email,
        inviteStatus: company.invite_status,
        inviteExpiresAt: company.invite_expires_at,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    );
  }
}
