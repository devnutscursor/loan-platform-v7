import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/api-auth';
import {
  getExternalEmbedForAdmin,
  updateExternalEmbedWidget,
} from '@/lib/embed/officerEmbedWidget';

type RouteContext = { params: Promise<{ widgetId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { widgetId } = await context.params;
  try {
    const widget = await getExternalEmbedForAdmin(widgetId);
    if (!widget) {
      return NextResponse.json({ success: false, error: 'Widget not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, widget });
  } catch (error) {
    console.error('[super-admin/embed-widgets/external/[widgetId]] GET', error);
    return NextResponse.json({ success: false, error: 'Failed to load widget' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { widgetId } = await context.params;
  try {
    const body = await request.json();
    const result = await updateExternalEmbedWidget(widgetId, {
      displayName: body.displayName,
      nmlsNumber: body.nmlsNumber,
      avatarUrl: body.avatarUrl,
      accentColor: body.accentColor,
      contactEmail: body.contactEmail,
      isEnabled: body.isEnabled !== false,
    });
    const widget = await getExternalEmbedForAdmin(widgetId);
    return NextResponse.json({ success: true, embedSlug: result.embedSlug, widget });
  } catch (error) {
    console.error('[super-admin/embed-widgets/external/[widgetId]] PUT', error);
    const message = error instanceof Error ? error.message : 'Failed to update widget';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
