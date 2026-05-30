import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  assertCanManageOfficer,
  requireCompanyAdminOrSuperAdmin,
} from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireCompanyAdminOrSuperAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const { ctx } = auth;

    const { officerId } = await request.json();

    if (!officerId) {
      return NextResponse.json({ error: 'Officer ID is required' }, { status: 400 });
    }

    const denied = await assertCanManageOfficer(ctx, officerId);
    if (denied) return denied;

    const officer = await db
      .select()
      .from(users)
      .where(eq(users.id, officerId))
      .limit(1);

    if (!officer.length) {
      return NextResponse.json({ error: 'Officer not found' }, { status: 404 });
    }

    if (officer[0].deactivated) {
      return NextResponse.json({ error: 'Officer is already deactivated' }, { status: 400 });
    }

    await db
      .update(users)
      .set({
        deactivated: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, officerId));

    return NextResponse.json({
      success: true,
      message: 'Officer deactivated successfully',
    });
  } catch (error) {
    console.error('Error deactivating officer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
