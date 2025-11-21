/**
 * Local Logic IO Reports API Test Script
 * 
 * This script tests the complete flow:
 * 1. Get access token
 * 2. Generate a neighborhood report
 */

// For Node.js environment
const fetch = require('node-fetch');

// Configuration
const CLIENT_ID = process.env.LOCAL_LOGIC_CLIENT_ID || '033e02864fa954ad6224aec1d7f53578';
const CLIENT_SECRET = process.env.LOCAL_LOGIC_CLIENT_SECRET || 'XWZSSRP8kQGbr9vwSuCpgsAz7D_No5htxxLHC4qNa0l';

async function getAccessToken(): Promise<string> {
  console.log('🔐 Step 1: Getting Access Token...');
  console.log('-----------------------------------');

  const tokenUrl = `https://api.locallogic.co/oauth/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&audience=reports-api`;

  try {
    const response = await fetch(tokenUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Token Error:', data);
      throw new Error(`Failed to get token: ${data.error_description || data.error}`);
    }

    if (!data.access_token) {
      throw new Error('No access token in response');
    }

    console.log('✅ Access Token obtained!');
    console.log(`Token: ${data.access_token.substring(0, 50)}...`);
    console.log(`Token Type: ${data.token_type}`);
    console.log(`Expires In: ${data.expires_in} seconds\n`);

    return data.access_token;
  } catch (error) {
    console.error('❌ Error getting token:', error);
    throw error;
  }
}

async function generateReport(accessToken: string, reportType: 'ni' | 'nmr' = 'nmr') {
  console.log('📊 Step 2: Generating Neighborhood Report...');
  console.log('-----------------------------------');
  console.log(`Report Type: ${reportType === 'ni' ? 'NeighborhoodIntel Report' : 'Neighborhood Market Trend Report'}\n`);

  const reportData = {
    lat: 39.92422,
    lng: -75.15548,
    address_label: '500 Dudley St, Philadelphia, PA 19148',
    language: 'en',
    type: reportType
  };

  try {
    const response = await fetch('https://reports-api.locallogic.co/v1/reports', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Report Generation Error:', data);
      throw new Error(`Failed to generate report: ${data.error || data.message || JSON.stringify(data)}`);
    }

    console.log('✅ Report generated successfully!');
    console.log(`Report ID: ${data.report_id}`);
    console.log(`Report URL: ${data.report_url}`);
    console.log(`\nYou can view the report at: ${data.report_url}\n`);

    return data;
  } catch (error) {
    console.error('❌ Error generating report:', error);
    throw error;
  }
}

async function testFullFlow() {
  try {
    // Step 1: Get access token
    const accessToken = await getAccessToken();

    // Step 2: Generate NeighborhoodIntel Report
    await generateReport(accessToken, 'ni');

    // Step 3: Generate Neighborhood Market Trend Report
    await generateReport(accessToken, 'nmr');

    console.log('✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testFullFlow();
}

export { getAccessToken, generateReport, testFullFlow };



