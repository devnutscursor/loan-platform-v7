import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseService } from '@/lib/supabase/service';
import { createServerClient } from '@supabase/ssr';

const bodySchema = z.object({
  companyId: z.string().uuid(),
  isOfficerInvite: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // IMPORTANT: do NOT require an existing public.users row here.
    // This endpoint is responsible for creating/updating public.users + user_companies
    // during invite completion, so it must authenticate using Supabase Auth only.
    const authHeader = request.headers.get('authorization');
    const bearer =
      authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null;

    const admin = getSupabaseService();

    const resolvedUser = bearer
      ? await admin.auth.getUser(bearer).then((r) => r.data.user ?? null)
      : null;

    let user = resolvedUser;
    if (!user) {
      // Fallback to cookie-based auth
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {
              // Route handlers can't reliably set cookies here.
            },
          },
        },
      );
      const { data } = await supabase.auth.getUser();
      user = data.user ?? null;
    }

    if (!user?.id || !user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = bodySchema.parse(await request.json());
    const companyId = body.companyId;
    const isOfficerInvite = body.isOfficerInvite === true;

    // Always ensure the app user row exists and is active.
    const role = isOfficerInvite ? 'employee' : 'company_admin';
    const firstName = (user.user_metadata as any)?.first_name ?? '';
    const lastName = (user.user_metadata as any)?.last_name ?? '';

    const { error: userUpsertError } = await admin.from('users').upsert({
      id: user.id,
      email: user.email,
      first_name: firstName,
      last_name: lastName,
      role,
      is_active: true,
      deactivated: false,
      invite_status: 'accepted',
      updated_at: new Date().toISOString(),
    });
    if (userUpsertError) {
      return NextResponse.json(
        { success: false, error: userUpsertError.message },
        { status: 500 },
      );
    }

    // Link user to company.
    const companyRole = isOfficerInvite ? 'employee' : 'admin';
    const { error: linkError } = await admin.from('user_companies').upsert(
      {
        user_id: user.id,
        company_id: companyId,
        role: companyRole,
        is_active: true,
        joined_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,company_id' },
    );
    if (linkError) {
      return NextResponse.json({ success: false, error: linkError.message }, { status: 500 });
    }

    if (!isOfficerInvite) {
      // Company admin invite acceptance: mark company accepted + active.
      const { error: companyError } = await admin
        .from('companies')
        .update({
          invite_status: 'accepted',
          admin_email_verified: true,
          admin_user_id: user.id,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyId);
      if (companyError) {
        return NextResponse.json(
          { success: false, error: companyError.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: { userId: user.id, companyId, role },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 },
      );
    }
    console.error('[finalize-invite] error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    );
  }
}

