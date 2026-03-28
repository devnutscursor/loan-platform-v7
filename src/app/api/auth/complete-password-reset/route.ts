import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { verifyPasswordResetToken } from '@/lib/password-reset-token';
import { validatePasswordStrength } from '@/lib/password-policy';

const bodySchema = z.object({
  token: z.string().min(1),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const json = bodySchema.parse(await request.json());
    const payload = verifyPasswordResetToken(json.token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    const strength = validatePasswordStrength(json.newPassword);
    if (!strength.ok) {
      return NextResponse.json(
        { success: false, message: strength.errors[0] ?? 'Password does not meet requirements.', errors: strength.errors },
        { status: 400 }
      );
    }

    if (json.currentPassword === json.newPassword) {
      return NextResponse.json(
        { success: false, message: 'New password must be different from your current password.' },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !anonKey || !serviceKey) {
      return NextResponse.json({ success: false, message: 'Server misconfiguration.' }, { status: 500 });
    }

    const anon = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: signError } = await anon.auth.signInWithPassword({
      email: payload.email,
      password: json.currentPassword,
    });

    if (signError) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect.' },
        { status: 401 }
      );
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: updateError } = await admin.auth.admin.updateUserById(payload.sub, {
      password: json.newPassword,
    });

    if (updateError) {
      console.error('complete-password-reset updateUserById:', updateError);
      return NextResponse.json(
        { success: false, message: updateError.message || 'Could not update password.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: 'Invalid request.' }, { status: 400 });
    }
    console.error('complete-password-reset:', error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}
