import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { companies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const RATECADDY_COMPANY_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRateCaddyCompanyUuid(s: string | null): s is string {
  return Boolean(s && RATECADDY_COMPANY_ID_REGEX.test(s));
}

type GhlTokenSuccess = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token: string;
  scope?: string;
  locationId?: string;
  userId?: string;
  companyId?: string;
};

export async function GET(request: NextRequest) {
  const clientId = process.env.GHL_LOCATION_CLIENT_ID;
  const clientSecret = process.env.GHL_LOCATION_CLIENT_SECRET;
  const redirectUri = process.env.GHL_REDIRECT_URI;
  console.log('🔐 [OAuth Callback] Request received');

  if (!clientId || !clientSecret || !redirectUri) {
    console.error(
      '❌ [OAuth Callback] Missing env vars:',
      JSON.stringify({
        hasClientId: Boolean(clientId),
        hasClientSecret: Boolean(clientSecret),
        hasRedirectUri: Boolean(redirectUri),
      })
    );
    return NextResponse.json(
      {
        success: false,
        error:
          'Missing required env vars: GHL_LOCATION_CLIENT_ID, GHL_LOCATION_CLIENT_SECRET, and/or GHL_REDIRECT_URI',
      },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  console.log(
    '📥 [OAuth Callback] Query params received',
    JSON.stringify({
      hasCode: Boolean(code),
      state,
    })
  );

  if (!code) {
    return NextResponse.json(
      { success: false, error: 'Missing "code" in querystring' },
      { status: 400 }
    );
  }

  try {
    console.log('🔄 [OAuth Callback] Exchanging auth code for tokens...');
    const res = await fetch('https://services.leadconnectorhq.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const json = (await res.json().catch(() => null)) as
      | GhlTokenSuccess
      | Record<string, unknown>
      | null;
    console.log(
      '📡 [OAuth Callback] Token endpoint response status:',
      res.status
    );

    if (!res.ok) {
      console.error(
        '❌ [OAuth Callback] Token exchange failed',
        JSON.stringify(json)
      );
      return NextResponse.json(
        {
          success: false,
          error: 'Token exchange failed',
          status: res.status,
          details: json,
        },
        { status: 400 }
      );
    }

    const tokenPayload = json as GhlTokenSuccess | null;
    if (process.env.NODE_ENV === 'production') {
      console.log(
        '✅ [OAuth Callback] Token exchange succeeded',
        JSON.stringify({
          hasAccessToken: Boolean(tokenPayload?.access_token),
          hasRefreshToken: Boolean(tokenPayload?.refresh_token),
          expiresIn: tokenPayload?.expires_in ?? null,
          tokenType: tokenPayload?.token_type ?? null,
          locationId: tokenPayload?.locationId ?? null,
          companyId: tokenPayload?.companyId ?? null,
          userId: tokenPayload?.userId ?? null,
        })
      );
    } else {
      console.log(
        '✅ [OAuth Callback] Token exchange succeeded (dev tokens visible below)'
      );
      console.log(
        '🔑 [OAuth Callback] access_token:',
        tokenPayload?.access_token ?? null
      );
      console.log(
        '🔄 [OAuth Callback] refresh_token:',
        tokenPayload?.refresh_token ?? null
      );
    }

    if (isRateCaddyCompanyUuid(state)) {
      const existing = await db
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.id, state))
        .limit(1);

      if (!existing.length) {
        console.error(
          '❌ [OAuth Callback] state is UUID but no company row:',
          state
        );
        return NextResponse.json(
          {
            success: false,
            error: 'Company not found for OAuth state',
            state,
            tokens: json,
          },
          { status: 404 }
        );
      }

      const payload =
        json && typeof json === 'object' ? (json as Record<string, unknown>) : {};

      await db
        .update(companies)
        .set({
          ghlOauthPayload: payload,
          ghlConnectedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(companies.id, state));

      console.log('💾 [OAuth Callback] Stored GHL payload on company', state);

      return NextResponse.json({
        success: true,
        savedToCompanyId: state,
        ghlLocationId: tokenPayload?.locationId ?? null,
        ghlIntegrationCompanyId: tokenPayload?.companyId ?? null,
        ghlUserId: tokenPayload?.userId ?? null,
        message:
          'GHL OAuth completed. Full token response stored in companies.ghl_oauth_payload.',
      });
    }

    return NextResponse.json({
      success: true,
      state,
      tokens: json,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected error exchanging code for token',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

