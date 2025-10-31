#!/usr/bin/env tsx

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function testMortechWithoutAuth() {
  console.log('🧪 Testing Mortech API without client credentials...\n');

  const baseUrl = 'https://thirdparty.mortech-inc.com/mpg/servlet/mpgThirdPartyServlet';
  
  // Test 1: No credentials at all
  console.log('=== Test 1: No credentials ===');
  try {
    const url1 = `${baseUrl}?request_id=1&propertyState=TX&propertyZip=75024&appraisedvalue=225000&loan_amount=150000&fico=750&loanpurpose=Purchase&proptype=Single+Family&occupancy=Primary&loanProduct1=30+year+fixed`;
    
    console.log('🔍 Request URL:', url1);
    
    const response1 = await fetch(url1, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml, text/xml',
        'User-Agent': 'LoanOfficerPlatform/1.0',
      },
    });

    console.log('📊 Response Status:', response1.status);
    console.log('📊 Response OK:', response1.ok);
    
    const xmlData1 = await response1.text();
    console.log('📄 XML Response:', xmlData1.substring(0, 500) + '...');
    
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log('\n=== Test 2: With dummy credentials ===');
  try {
    const url2 = `${baseUrl}?request_id=1&customerId=dummy&thirdPartyName=dummy&licenseKey=dummy&emailAddress=dummy@test.com&propertyState=TX&propertyZip=75024&appraisedvalue=225000&loan_amount=150000&fico=750&loanpurpose=Purchase&proptype=Single+Family&occupancy=Primary&loanProduct1=30+year+fixed`;
    
    console.log('🔍 Request URL:', url2);
    
    const response2 = await fetch(url2, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml, text/xml',
        'User-Agent': 'LoanOfficerPlatform/1.0',
      },
    });

    console.log('📊 Response Status:', response2.status);
    console.log('📊 Response OK:', response2.ok);
    
    const xmlData2 = await response2.text();
    console.log('📄 XML Response:', xmlData2.substring(0, 500) + '...');
    
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log('\n=== Test 3: With current client credentials ===');
  try {
    const customerId = process.env.MORTECH_CUSTOMER_ID;
    const thirdPartyName = process.env.MORTECH_THIRD_PARTY_NAME;
    const licenseKey = process.env.MORTECH_LICENSE_KEY;
    const emailAddress = process.env.MORTECH_EMAIL_ADDRESS;
    
    console.log('🔑 Using credentials:');
    console.log('- Customer ID:', customerId);
    console.log('- Third Party Name:', thirdPartyName);
    console.log('- License Key:', licenseKey);
    console.log('- Email Address:', emailAddress);
    
    const url3 = `${baseUrl}?request_id=1&customerId=${customerId}&thirdPartyName=${thirdPartyName}&licenseKey=${licenseKey}&emailAddress=${emailAddress}&propertyState=TX&propertyZip=75024&appraisedvalue=225000&loan_amount=150000&fico=750&loanpurpose=Purchase&proptype=Single+Family&occupancy=Primary&loanProduct1=30+year+fixed`;
    
    console.log('🔍 Request URL:', url3);
    
    const response3 = await fetch(url3, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml, text/xml',
        'User-Agent': 'LoanOfficerPlatform/1.0',
      },
    });

    console.log('📊 Response Status:', response3.status);
    console.log('📊 Response OK:', response3.ok);
    
    const xmlData3 = await response3.text();
    console.log('📄 XML Response:', xmlData3.substring(0, 500) + '...');
    
    // Parse XML to check for errors
    if (xmlData3.includes('<errorNum>') && xmlData3.includes('<errorDesc>')) {
      const errorMatch = xmlData3.match(/<errorNum>(\d+)<\/errorNum>[\s\S]*?<errorDesc>(.*?)<\/errorDesc>/);
      if (errorMatch) {
        console.log('🚨 Error Number:', errorMatch[1]);
        console.log('🚨 Error Description:', errorMatch[2]);
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error);
  }

  console.log('\n=== Test 4: Check if API endpoint is accessible ===');
  try {
    const response4 = await fetch(baseUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'LoanOfficerPlatform/1.0',
      },
    });

    console.log('📊 HEAD Response Status:', response4.status);
    console.log('📊 HEAD Response OK:', response4.ok);
    console.log('📊 Server:', response4.headers.get('server'));
    console.log('📊 Content-Type:', response4.headers.get('content-type'));
    
  } catch (error) {
    console.log('❌ HEAD Error:', error);
  }

  console.log('\n🎯 Summary:');
  console.log('- Test 1: No credentials - Shows if API requires auth');
  console.log('- Test 2: Dummy credentials - Shows if API validates credentials');
  console.log('- Test 3: Client credentials - Shows if current creds work');
  console.log('- Test 4: HEAD request - Shows if endpoint is accessible');
}

// Run the test
if (require.main === module) {
  testMortechWithoutAuth()
    .then(() => {
      console.log('\n✅ Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

export { testMortechWithoutAuth };
