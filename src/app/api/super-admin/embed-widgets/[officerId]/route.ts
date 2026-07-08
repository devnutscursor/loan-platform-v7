import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/api-auth';
import {
  getOfficerEmbedForAdmin,
  upsertOfficerEmbedWidget,
} from '@/lib/embed/officerEmbedWidget';

type RouteContext = { params: Promise<{ officerId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { officerId } = await context.params;
  try {
    const officer = await getOfficerEmbedForAdmin(officerId);
    if (!officer) {
      return NextResponse.json({ success: false, error: 'Officer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, officer });
  } catch (error) {
    console.error('[super-admin/embed-widgets/[officerId]] GET', error);
    return NextResponse.json({ success: false, error: 'Failed to load officer embed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { officerId } = await context.params;
  try {
    const body = await request.json();
    const result = await upsertOfficerEmbedWidget({
      officerId,
      displayName: body.displayName,
      nmlsNumber: body.nmlsNumber,
      avatarUrl: body.avatarUrl,
      isEnabled: body.isEnabled !== false,
    });
    const officer = await getOfficerEmbedForAdmin(officerId);
    return NextResponse.json({ success: true, embedSlug: result.embedSlug, officer });
  } catch (error) {
    console.error('[super-admin/embed-widgets/[officerId]] PUT', error);
    const message = error instanceof Error ? error.message : 'Failed to save embed widget';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
