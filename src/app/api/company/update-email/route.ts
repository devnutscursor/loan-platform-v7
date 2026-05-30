import { NextRequest, NextResponse } from 'next/server';
import { redisCache } from '@/lib/redis';
import { assertCanManageCompany, requireCompanyAdminOrSuperAdmin } from '@/lib/api-auth';
import { getSupabaseService } from '@/lib/supabase/service';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireCompanyAdminOrSuperAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const { ctx } = auth;

    const { companyId, newEmail } = await req.json();

    if (!companyId || !newEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing companyId or newEmail' },
        { status: 400 },
      );
    }

    const denied = await assertCanManageCompany(ctx, companyId);
    if (denied) return denied;

    const normalizedEmail = String(newEmail).trim().toLowerCase();
    const supabase = getSupabaseService();

    const { data, error } = await supabase
      .from('companies')
      .update({
        email: normalizedEmail,
        admin_email: normalizedEmail,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)
      .select('id, name, email, admin_email, slug')
      .single();

    if (error) {
      console.error('Error updating company email:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    try {
      await redisCache.clearUserCache('*');
    } catch (cacheError) {
      console.warn('Could not clear cache:', cacheError);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        adminEmail: data.admin_email,
        slug: data.slug,
      },
    });
  } catch (error: unknown) {
    console.error('Unexpected error updating company email:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    );
  }
}
