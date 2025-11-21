import { NextRequest, NextResponse } from 'next/server';

/**
 * Local Logic IO Reports API - Get Access Token
 * This endpoint handles server-side authentication to get a bearer token
 */
export async function POST(request: NextRequest) {
  try {
    const clientId = process.env.LOCAL_LOGIC_CLIENT_ID;
    const clientSecret = process.env.LOCAL_LOGIC_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Local Logic credentials not configured. Please add LOCAL_LOGIC_CLIENT_ID and LOCAL_LOGIC_CLIENT_SECRET to your environment variables.' 
        },
        { status: 500 }
      );
    }

    // Optional: Get agent_id from request body for personalized tokens
    const body = await request.json().catch(() => ({}));
    const agentId = body.agent_id;

    // Build token request URL
    let tokenUrl = `https://api.locallogic.co/oauth/token?client_id=${clientId}&client_secret=${clientSecret}&audience=reports-api`;
    
    // Add agent_id if provided for personalized token
    if (agentId) {
      tokenUrl += `&agent_id=${agentId}`;
    }

    console.log('🔐 Local Logic: Requesting access token...');
    console.log('📍 Token URL:', tokenUrl.replace(clientSecret, '***SECRET***'));

    // Request access token from Local Logic
    // NOTE: Token endpoint uses GET, not POST (as confirmed by Local Logic support)
    const tokenResponse = await fetch(tokenUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    // Check if response is HTML (CloudFront error) instead of JSON
    const contentType = tokenResponse.headers.get('content-type') || '';
    const responseText = await tokenResponse.text();
    
    if (!contentType.includes('application/json')) {
      console.error('❌ Local Logic: Received non-JSON response (likely CloudFront error)');
      console.error('Response:', responseText.substring(0, 500));
      return NextResponse.json(
        { 
          success: false,
          error: 'CloudFront 403 Error: The API endpoint may require IP whitelisting or have restrictions. Please contact Local Logic support to whitelist your server IP address.',
          details: {
            status: tokenResponse.status,
            statusText: tokenResponse.statusText,
            contentType: contentType,
            responsePreview: responseText.substring(0, 200)
          }
        },
        { status: 403 }
      );
    }

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Local Logic: Failed to parse JSON response');
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid JSON response from Local Logic API',
          details: { responsePreview: responseText.substring(0, 500) }
        },
        { status: 500 }
      );
    }

    if (!tokenResponse.ok) {
      console.error('❌ Local Logic Token Error:', tokenData);
      return NextResponse.json(
        { 
          success: false,
          error: tokenData.error || tokenData.error_description || 'Failed to get access token',
          details: tokenData
        },
        { status: tokenResponse.status }
      );
    }

    console.log('✅ Local Logic: Access token obtained successfully');

    return NextResponse.json({
      success: true,
      access_token: tokenData.access_token,
      token_type: tokenData.token_type || 'Bearer',
      expires_in: tokenData.expires_in,
      // Include full response for debugging
      ...(process.env.NODE_ENV === 'development' && { full_response: tokenData })
    });

  } catch (error) {
    console.error('❌ Local Logic Token API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Also support GET for testing
export async function GET(request: NextRequest) {
  return POST(request);
}

