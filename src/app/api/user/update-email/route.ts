import { NextRequest, NextResponse } from 'next/server';
import { redisCache } from '@/lib/redis';
import { assertSelfOrAdmin, requireAuth } from '@/lib/api-auth';
import { getSupabaseService } from '@/lib/supabase/service';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof NextResponse) return auth;
    const { ctx } = auth;

    const { userId, newEmail } = await req.json();

    if (!userId || !newEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or newEmail' },
        { status: 400 },
      );
    }

    const denied = assertSelfOrAdmin(ctx, userId);
    if (denied) return denied;

    const normalizedEmail = String(newEmail).trim().toLowerCase();
    const supabase = getSupabaseService();

    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(userId, {
      email: normalizedEmail,
    });
    if (authUpdateError) {
      console.error('Error updating auth email:', authUpdateError);
      return NextResponse.json(
        { success: false, error: authUpdateError.message },
        { status: 500 },
      );
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        email: normalizedEmail,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, email, first_name, last_name')
      .single();

    if (error) {
      console.error('Error updating user email:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    await redisCache.clearProfile(userId);

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
      },
    });
  } catch (error: unknown) {
    console.error('Unexpected error updating email:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    );
  }
}
