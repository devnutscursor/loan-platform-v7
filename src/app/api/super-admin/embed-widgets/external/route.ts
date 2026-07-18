import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/api-auth';
import {
  createExternalEmbedWidget,
  getExternalEmbedForAdmin,
} from '@/lib/embed/officerEmbedWidget';

export async function POST(request: NextRequest) {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const result = await createExternalEmbedWidget({
      displayName: body.displayName,
      nmlsNumber: body.nmlsNumber,
      avatarUrl: body.avatarUrl,
      accentColor: body.accentColor,
      contactEmail: body.contactEmail,
      isEnabled: body.isEnabled !== false,
    });
    const widget = await getExternalEmbedForAdmin(result.widgetId);
    return NextResponse.json({
      success: true,
      widgetId: result.widgetId,
      embedSlug: result.embedSlug,
      widget,
    });
  } catch (error) {
    console.error('[super-admin/embed-widgets/external] POST', error);
    const message = error instanceof Error ? error.message : 'Failed to create external embed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
