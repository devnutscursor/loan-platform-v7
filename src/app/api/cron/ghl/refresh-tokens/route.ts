import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { companies } from '@/lib/db/schema';
import { verifyBearerSecret } from '@/lib/api-auth';

type GhlOauthPayload = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  locationId?: string;
  companyId?: string;
  userId?: string;
  [key: string]: unknown;
};

export async function POST(req: NextRequest) {
  if (!verifyBearerSecret(req, 'CRON_SECRET_TOKEN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = process.env.GHL_LOCATION_CLIENT_ID;
  const clientSecret = process.env.GHL_LOCATION_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Missing required env vars: GHL_LOCATION_CLIENT_ID and/or GHL_LOCATION_CLIENT_SECRET',
      },
      { status: 500 }
    );
  }

  try {
    const companyRows = await db
      .select({
        id: companies.id,
        name: companies.name,
        ghlOauthPayload: companies.ghlOauthPayload,
      })
      .from(companies);

    const summary = {
      totalCompanies: companyRows.length,
      eligible: 0,
      refreshed: 0,
      skipped: 0,
      failed: 0,
      failures: [] as Array<{ companyId: string; companyName: string; error: string }>,
    };

    for (const company of companyRows) {
      const payload = (company.ghlOauthPayload ?? {}) as GhlOauthPayload;
      const refreshToken = payload.refresh_token;

      if (!refreshToken) {
        summary.skipped += 1;
        continue;
      }

      summary.eligible += 1;

      try {
        const res = await fetch(
          'https://services.leadconnectorhq.com/oauth/token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: 'refresh_token',
              refresh_token: refreshToken,
            }),
          }
        );

        const refreshed = (await res.json().catch(() => null)) as
          | Record<string, unknown>
          | null;

        if (!res.ok || !refreshed) {
          summary.failed += 1;
          summary.failures.push({
            companyId: company.id,
            companyName: company.name,
            error: `Refresh failed (status ${res.status})`,
          });
          continue;
        }

        const mergedPayload = {
          ...payload,
          ...refreshed,
        };

        await db
          .update(companies)
          .set({
            ghlOauthPayload: mergedPayload,
            updatedAt: new Date(),
          })
          .where(eq(companies.id, company.id));

        summary.refreshed += 1;
      } catch (error) {
        summary.failed += 1;
        summary.failures.push({
          companyId: company.id,
          companyName: company.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

