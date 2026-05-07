import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.GHL_LOCATION_CLIENT_ID;
  const redirectUri = process.env.GHL_REDIRECT_URI;
  console.log('🔐 [OAuth Choose Location] Request received');

  if (!clientId || !redirectUri) {
    console.error(
      '❌ [OAuth Choose Location] Missing env vars:',
      JSON.stringify({
        hasClientId: Boolean(clientId),
        hasRedirectUri: Boolean(redirectUri),
      })
    );
    return NextResponse.json(
      {
        success: false,
        error:
          'Missing required env vars: GHL_LOCATION_CLIENT_ID and/or GHL_REDIRECT_URI',
      },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  // Prefer `company=<uuid>` so super-admin flow passes RateCaddy company id as OAuth state.
  const oauthState =
    searchParams.get('company') ??
    searchParams.get('state') ??
    'ratecaddy';
  const scope =
    searchParams.get('scope') ??
    [
      'contacts.readonly',
      'contacts.write',
      'opportunities.readonly',
      'opportunities.write',
      'users.readonly',
      'users.write',
      'locations.readonly',
      'oauth.readonly',
      'oauth.write',
    ].join(' ');

  const url = new URL(
    'https://marketplace.gohighlevel.com/oauth/chooselocation'
  );
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('scope', scope);
  url.searchParams.set('state', oauthState);
  console.log(
    '✅ [OAuth Choose Location] Built authorize URL',
    JSON.stringify({
      redirectUri,
      state: oauthState,
      format: searchParams.get('format') ?? 'redirect',
    })
  );

  if (searchParams.get('format') === 'json') {
    return NextResponse.json({
      success: true,
      message:
        'Open authorizeUrl in a browser to complete OAuth. After approval, GHL redirects to your callback with ?code=...',
      authorizeUrl: url.toString(),
      redirectUri,
      state: oauthState,
    });
  }

  return NextResponse.redirect(url.toString());
}

