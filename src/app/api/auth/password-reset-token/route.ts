import { NextRequest, NextResponse } from 'next/server';
import { verifyPasswordResetToken } from '@/lib/password-reset-token';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const vis = !local || local.length <= 2 ? '*' : local.slice(0, 2);
  return `${vis}***@${domain}`;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const payload = verifyPasswordResetToken(token);
  if (!payload) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    emailMasked: maskEmail(payload.email),
  });
}
