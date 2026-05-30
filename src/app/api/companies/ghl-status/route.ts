import { NextRequest, NextResponse } from 'next/server';
import {
  assertCanManageCompany,
  requireCompanyAdminOrSuperAdmin,
} from '@/lib/api-auth';
import { getSupabaseService } from '@/lib/supabase/service';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireCompanyAdminOrSuperAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const { ctx } = auth;

    const { searchParams } = new URL(req.url);
    const requestedCompanyId = searchParams.get('companyId');
    const companyId =
      ctx.role === 'super_admin' ? requestedCompanyId : ctx.companyId;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Missing companyId' },
        { status: 400 },
      );
    }

    const denied = await assertCanManageCompany(ctx, companyId);
    if (denied) return denied;

    const supabase = getSupabaseService();
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, ghl_connected_at, ghl_oauth_payload')
      .eq('id', companyId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching GHL status:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 },
      );
    }

    const payload = data.ghl_oauth_payload as Record<string, unknown> | null;
    const isConnected =
      Boolean(data.ghl_connected_at) ||
      Boolean(payload?.access_token || payload?.refresh_token);

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        name: data.name,
        ghl_connected_at: data.ghl_connected_at,
        isConnected,
      },
    });
  } catch (error: unknown) {
    console.error('Unexpected error fetching GHL status:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
