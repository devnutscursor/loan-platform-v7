import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { companies } from '@/lib/db/schema';

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

function deriveFirstName(companyName: string): string {
  const name = companyName.trim();
  if (!name) return 'Company';
  return name.split(/\s+/)[0].slice(0, 30);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const companyId = body?.companyId as string | undefined;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'companyId is required' },
        { status: 400 }
      );
    }

    const rows = await db
      .select({
        id: companies.id,
        name: companies.name,
        adminEmail: companies.adminEmail,
        email: companies.email,
        phone: companies.phone,
        ghlOauthPayload: companies.ghlOauthPayload,
        companyMetadata: companies.companyMetadata,
      })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    const company = rows[0];
    const previousMeta =
      company.companyMetadata && typeof company.companyMetadata === 'object'
        ? (company.companyMetadata as Record<string, unknown>)
        : {};
    if (previousMeta?.ghlAdminUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'GHL admin user already created for this company',
          details: previousMeta.ghlAdminUser,
        },
        { status: 409 }
      );
    }
    const payload = (company.ghlOauthPayload ?? {}) as GhlOauthPayload;
    const accessToken = payload.access_token;
    const locationId = payload.locationId;
    const ghlCompanyId = payload.companyId;
    const scope = payload.scope;

    if (!accessToken || !locationId || !ghlCompanyId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'GHL is not fully connected for this company. Missing access_token/locationId/companyId in ghl_oauth_payload.',
        },
        { status: 400 }
      );
    }

    if (scope && !scope.split(/\s+/).includes('users.write')) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Connected token does not include users.write scope. Reconnect GHL after updating OAuth scopes.',
          details: { scope },
        },
        { status: 400 }
      );
    }

    const adminEmail = company.adminEmail || company.email;
    if (!adminEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company admin email is missing. Set admin_email before creating GHL user.',
        },
        { status: 400 }
      );
    }

    const tempPassword = buildTemporaryPassword();
    const ghlBody: Record<string, unknown> = {
      companyId: ghlCompanyId,
      type: 'account',
      firstName: deriveFirstName(company.name),
      lastName: 'Admin',
      email: adminEmail,
      password: tempPassword,
      role: 'admin',
      locationIds: [locationId],
    };
    if (company.phone) {
      ghlBody.phone = company.phone;
    }

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
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create GHL admin user',
          status: ghlResponse.status,
          details: ghlJson,
        },
        { status: ghlResponse.status }
      );
    }

    await db
      .update(companies)
      .set({
        companyMetadata: {
          ...previousMeta,
          ghlAdminUser: {
            createdAt: new Date().toISOString(),
            email: adminEmail,
            response: ghlJson,
          },
        },
        updatedAt: new Date(),
      })
      .where(eq(companies.id, companyId));

    return NextResponse.json({
      success: true,
      companyId,
      email: adminEmail,
      ghlUserId: (ghlJson as any)?.id ?? (ghlJson as any)?.user?.id ?? null,
      message: 'GHL admin user created successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected server error while creating GHL admin user',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

