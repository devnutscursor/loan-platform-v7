import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { companies, userCompanies, users } from '@/lib/db/schema';

type GhlOauthPayload = {
  access_token?: string;
  locationId?: string;
  companyId?: string;
  scope?: string;
};

function buildTemporaryPassword(length = 14): string {
  const minLength = Math.max(length, 10);
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const specials = '!@#$%^&*()-_=+[]{}';
  const all = upper + lower + digits + specials;

  const pick = (chars: string) =>
    chars[crypto.randomInt(0, chars.length)];

  const chars: string[] = [
    pick(upper),
    pick(lower),
    pick(digits),
    pick(specials),
  ];

  for (let i = chars.length; i < minLength; i += 1) {
    chars.push(pick(all));
  }

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

function isLikelyDuplicate(details: unknown): boolean {
  const text = JSON.stringify(details ?? {}).toLowerCase();
  return (
    text.includes('already') ||
    text.includes('exists') ||
    text.includes('duplicate') ||
    text.includes('email')
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const officerId = body?.officerId as string | undefined;
    const companyId = body?.companyId as string | undefined;

    if (!officerId || !companyId) {
      return NextResponse.json(
        { success: false, error: 'officerId and companyId are required' },
        { status: 400 }
      );
    }

    const rows = await db
      .select({
        userId: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        userIsActive: users.isActive,
        userDeactivated: users.deactivated,
        ghlUserId: users.ghlUserId,
        companyId: companies.id,
        companyName: companies.name,
        ghlOauthPayload: companies.ghlOauthPayload,
        relationshipIsActive: userCompanies.isActive,
      })
      .from(users)
      .innerJoin(
        userCompanies,
        and(
          eq(userCompanies.userId, users.id),
          eq(userCompanies.companyId, companyId),
          eq(userCompanies.role, 'employee')
        )
      )
      .innerJoin(companies, eq(companies.id, userCompanies.companyId))
      .where(eq(users.id, officerId))
      .limit(1);

    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: 'Loan officer or company relation not found' },
        { status: 404 }
      );
    }

    const row = rows[0];
    if (!row.userIsActive || row.userDeactivated || !row.relationshipIsActive) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Loan officer is not active yet. Activate account before creating GHL user.',
        },
        { status: 400 }
      );
    }

    if (row.ghlUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'GHL user already created for this loan officer',
          details: { ghlUserId: row.ghlUserId },
        },
        { status: 409 }
      );
    }

    const payload = (row.ghlOauthPayload ?? {}) as GhlOauthPayload;
    const accessToken = payload.access_token;
    const locationId = payload.locationId;
    const ghlCompanyId = payload.companyId;
    const scope = payload.scope;
    if (!accessToken || !locationId || !ghlCompanyId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Company GHL connection missing required fields (access_token/locationId/companyId).',
        },
        { status: 400 }
      );
    }
    if (scope && !scope.split(/\s+/).includes('users.write')) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Connected token does not include users.write scope. Reconnect GHL for this company.',
          details: { scope },
        },
        { status: 400 }
      );
    }

    const firstName = (row.firstName || 'Loan').trim().slice(0, 30);
    const lastName = (row.lastName || 'Officer').trim().slice(0, 30);
    const tempPassword = buildTemporaryPassword();

    const ghlBody: Record<string, unknown> = {
      companyId: ghlCompanyId,
      type: 'account',
      firstName,
      lastName,
      email: row.email,
      password: tempPassword,
      role: 'user',
      locationIds: [locationId],
    };
    if (row.phone) ghlBody.phone = row.phone;

    const ghlResponse = await fetch('https://services.leadconnectorhq.com/users/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Version: '2021-07-28',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ghlBody),
    });

    const ghlJson = await ghlResponse.json().catch(() => null);

    if (!ghlResponse.ok) {
      if (isLikelyDuplicate(ghlJson)) {
        return NextResponse.json(
          {
            success: false,
            error: 'GHL user already exists for this email',
            status: ghlResponse.status,
            details: ghlJson,
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create GHL loan officer user',
          status: ghlResponse.status,
          details: ghlJson,
        },
        { status: ghlResponse.status }
      );
    }

    const ghlUserId =
      (ghlJson as any)?.id ?? (ghlJson as any)?.user?.id ?? null;

    await db
      .update(users)
      .set({
        ghlUserId,
        ghlUserPayload: (ghlJson ?? {}) as Record<string, unknown>,
        ghlUserCreatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, officerId));

    return NextResponse.json({
      success: true,
      officerId,
      companyId,
      email: row.email,
      ghlUserId,
      message: 'Loan officer user created in GHL successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected server error while creating GHL loan officer user',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

