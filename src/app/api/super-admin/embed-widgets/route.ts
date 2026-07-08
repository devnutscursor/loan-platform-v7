import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/api-auth';
import { listOfficerEmbedWidgetsForAdmin } from '@/lib/embed/officerEmbedWidget';

export async function GET(request: NextRequest) {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const officers = await listOfficerEmbedWidgetsForAdmin();
    return NextResponse.json({ success: true, officers });
  } catch (error) {
    console.error('[super-admin/embed-widgets]', error);
    return NextResponse.json({ success: false, error: 'Failed to load embed widgets' }, { status: 500 });
  }
}
