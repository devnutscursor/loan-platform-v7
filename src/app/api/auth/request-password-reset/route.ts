import { NextRequest, NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { createPasswordResetToken } from '@/lib/password-reset-token';
import { sendPasswordResetLinkEmail } from '@/lib/mortech/email-service';
import { getAppBaseUrlFromRequest } from '@/lib/app-url';

const bodySchema = z.object({
  email: z.string().email(),
});

async function findAuthUserByEmail(supabase: SupabaseClient, email: string) {
  const normalized = email.trim().toLowerCase();
  let page = 1;
  const perPage = 1000;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const user = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (user) return user;
    if (!data.users.length || data.users.length < perPage) return null;
    page += 1;
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = bodySchema.parse(await request.json());
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ success: false, message: 'Server misconfiguration.' }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey);
    const user = await findAuthUserByEmail(supabase, json.email);

    if (user?.id && user.email) {
      const token = createPasswordResetToken(user.id, user.email);
      const resetUrl = `${getAppBaseUrlFromRequest(request)}/auth/reset-password?token=${encodeURIComponent(token)}`;
      const result = await sendPasswordResetLinkEmail(user.email, resetUrl);
      if (!result.success) {
        console.error('sendPasswordResetLinkEmail:', result.message);
        return NextResponse.json(
          { success: false, message: 'Could not send email. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: 'Invalid email address.' }, { status: 400 });
    }
    console.error('request-password-reset:', error);
    return NextResponse.json({ success: false, message: 'Something went wrong.' }, { status: 500 });
  }
}
