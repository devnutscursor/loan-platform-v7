import { NextRequest, NextResponse } from 'next/server';

/**
 * Local Logic IO Reports API - Generate Report
 * This endpoint generates a neighborhood report using Local Logic API
 */
export async function POST(request: NextRequest) {
  try {
    const clientId = process.env.LOCAL_LOGIC_CLIENT_ID;
    const clientSecret = process.env.LOCAL_LOGIC_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Local Logic credentials not configured' 
        },
        { status: 500 }
      );
    }

    // Get report parameters from request body
    const body = await request.json();
    const { lat, lng, address_label, language = 'en', type = 'ni', agent_id } = body;

    // Validate required parameters
    if (!lat || !lng || !address_label) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required parameters: lat, lng, and address_label are required' 
        },
        { status: 400 }
      );
    }

    // Validate report type
    if (type !== 'ni' && type !== 'nmr') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid report type. Must be "ni" (NeighborhoodIntel) or "nmr" (Neighborhood Market Report)' 
        },
        { status: 400 }
      );
    }

    console.log('🔐 Local Logic: Getting access token...');

    // Step 1: Get access token
    // NOTE: Token endpoint uses GET, not POST (as confirmed by Local Logic support)
    let tokenUrl = `https://api.locallogic.co/oauth/token?client_id=${clientId}&client_secret=${clientSecret}&audience=reports-api`;
    if (agent_id) {
      tokenUrl += `&agent_id=${agent_id}`;
    }

    const tokenResponse = await fetch(tokenUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json();
      console.error('❌ Local Logic Token Error:', tokenError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to authenticate with Local Logic',
          details: tokenError
        },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No access token received from Local Logic' 
        },
        { status: 500 }
      );
    }

    console.log('✅ Local Logic: Access token obtained');
    console.log('📊 Local Logic: Generating report...', { lat, lng, address_label, type });

    // Step 2: Generate report
    const reportResponse = await fetch('https://reports-api.locallogic.co/v1/reports', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: Number(lat),
        lng: Number(lng),
        address_label: address_label,
        language: language,
        type: type
      }),
    });

    const reportData = await reportResponse.json();

    if (!reportResponse.ok) {
      console.error('❌ Local Logic Report Error:', reportData);
      return NextResponse.json(
        { 
          success: false,
          error: reportData.error || reportData.message || 'Failed to generate report',
          details: reportData
        },
        { status: reportResponse.status }
      );
    }

    console.log('✅ Local Logic: Report generated successfully');

    return NextResponse.json({
      success: true,
      report_id: reportData.report_id,
      report_url: reportData.report_url,
      report_type: type,
      address: address_label,
      // Include full response for debugging
      ...(process.env.NODE_ENV === 'development' && { full_response: reportData })
    });

  } catch (error) {
    console.error('❌ Local Logic Report API Error:', error);
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




