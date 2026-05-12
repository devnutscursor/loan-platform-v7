import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { companies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { oauthCallbackShell } from './oauth-callback-html';

const RATECADDY_COMPANY_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRateCaddyCompanyUuid(s: string | null): s is string {
  return Boolean(s && RATECADDY_COMPANY_ID_REGEX.test(s));
}

function htmlResponse(html: string, status = 200) {
  return new NextResponse(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function wantJsonDebug(request: NextRequest) {
  return (
    request.nextUrl.searchParams.get('format') === 'json' &&
    process.env.NODE_ENV !== 'production'
  );
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
    return htmlResponse(
      oauthCallbackShell({
        title: 'Configuration error',
        heading: 'Something went wrong',
        message:
          'GoHighLevel connection is not configured on this server. Please contact support.',
        variant: 'error',
        primaryHref: '/',
        primaryLabel: 'Go to home',
      }),
      500
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
    return htmlResponse(
      oauthCallbackShell({
        title: 'Connection incomplete',
        heading: 'We could not finish connecting',
        message:
          'The sign-in flow did not return a valid authorization code. Please try connecting GoHighLevel again from your dashboard.',
        variant: 'error',
        primaryHref: '/admin/dashboard',
        primaryLabel: 'Go to dashboard',
        secondaryHref: '/super-admin/companies',
        secondaryLabel: 'Super Admin — Companies',
      }),
      400
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
      return htmlResponse(
        oauthCallbackShell({
          title: 'Connection failed',
          heading: 'GoHighLevel could not be connected',
          message:
            'We could not complete the authorization with GoHighLevel. Please try again, or contact support if this keeps happening.',
          variant: 'error',
          primaryHref: '/admin/dashboard',
          primaryLabel: 'Go to dashboard',
          secondaryHref: '/super-admin/companies',
          secondaryLabel: 'Super Admin — Companies',
        }),
        400
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
        if (wantJsonDebug(request)) {
          return NextResponse.json(
            {
              success: false,
              error: 'Company not found for OAuth state',
              state,
            },
            { status: 404 }
          );
        }
        return htmlResponse(
          oauthCallbackShell({
            title: 'Company not found',
            heading: 'We could not save this connection',
            message:
              'Your organization could not be matched in RateCaddy. Please start the GoHighLevel connection again from the Companies page.',
            variant: 'error',
            primaryHref: '/super-admin/companies',
            primaryLabel: 'Super Admin — Companies',
            secondaryHref: '/admin/dashboard',
            secondaryLabel: 'Company dashboard',
          }),
          404
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

      if (wantJsonDebug(request)) {
        return NextResponse.json({
          success: true,
          message: 'GHL OAuth completed (dev JSON only; use without format=json in production).',
        });
      }

      return htmlResponse(
        oauthCallbackShell({
          title: 'Connected',
          heading: 'GoHighLevel connected',
          message:
            'Your RateCaddy company is now linked to GoHighLevel. Tokens were saved securely — nothing else to do here.',
          variant: 'success',
          primaryHref: '/admin/dashboard',
          primaryLabel: 'Go to your dashboard',
          secondaryHref: '/super-admin/dashboard',
          secondaryLabel: 'Super Admin dashboard',
        })
      );
    }

    if (wantJsonDebug(request)) {
      return NextResponse.json({
        success: true,
        state,
        message: 'OAuth completed (dev only; tokens not included in JSON for safety).',
      });
    }

    return htmlResponse(
      oauthCallbackShell({
        title: 'Connected',
        heading: 'Authorization complete',
        message:
          'You can close this tab and return to RateCaddy. If you were setting up an integration, open your dashboard to continue.',
        variant: 'success',
        primaryHref: '/admin/dashboard',
        primaryLabel: 'Go to your dashboard',
        secondaryHref: '/',
        secondaryLabel: 'Home',
      })
    );
  } catch (error) {
    console.error('❌ [OAuth Callback] Unexpected error:', error);
    return htmlResponse(
      oauthCallbackShell({
        title: 'Error',
        heading: 'Something went wrong',
        message:
          'We could not finish connecting to GoHighLevel. Please try again later or contact support.',
        variant: 'error',
        primaryHref: '/admin/dashboard',
        primaryLabel: 'Go to dashboard',
        secondaryHref: '/super-admin/companies',
        secondaryLabel: 'Super Admin — Companies',
      }),
      500
    );
  }
}

