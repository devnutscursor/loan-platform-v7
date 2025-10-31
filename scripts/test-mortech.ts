#!/usr/bin/env node

/**
 * Test script for Mortech API integration
 * Run with: npx tsx scripts/test-mortech.ts
 */

import { config } from 'dotenv';
import { createMortechAPI } from '../src/lib/mortech/api';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function testMortechIntegration() {
  console.log('🧪 Testing Mortech API Integration...\n');

  // Debug: Show loaded environment variables (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Environment Variables Check:');
    console.log(`MORTECH_CUSTOMER_ID: ${process.env.MORTECH_CUSTOMER_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`MORTECH_THIRD_PARTY_NAME: ${process.env.MORTECH_THIRD_PARTY_NAME ? '✅ Set' : '❌ Missing'}`);
    console.log(`MORTECH_LICENSE_KEY: ${process.env.MORTECH_LICENSE_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`MORTECH_EMAIL_ADDRESS: ${process.env.MORTECH_EMAIL_ADDRESS ? '✅ Set' : '❌ Missing'}`);
    console.log('');
  }

  try {
    // Create Mortech API instance
    const mortechAPI = createMortechAPI();
    console.log('✅ Mortech API instance created successfully');

    // Test search parameters
    const testRequest = {
      propertyState: 'CA',
      propertyZip: '90210',
      appraisedvalue: 625000,
      loan_amount: 500000,
      fico: 740,
      loanpurpose: 'Purchase' as const,
      proptype: 'Single Family' as const,
      occupancy: 'Primary' as const,
      loanProduct1: '30 year fixed',
      filterId: 'CONV', // Conventional filter
      pmiCompany: -999, // Best MI company
      noMI: 0, // Borrower paid MI
    };

    console.log('📋 Test Request Parameters:');
    console.log(JSON.stringify(testRequest, null, 2));

    console.log('\n🔍 Calling Mortech API...');
    const response = await mortechAPI.getRates(testRequest);

    if (response.success) {
      console.log('✅ Mortech API call successful!');
      console.log(`📊 Found ${response.quotes?.length || 0} quotes`);
      
      if (response.quotes && response.quotes.length > 0) {
        console.log('\n📈 Sample Quote:');
        const sampleQuote = response.quotes[0];
        console.log(`- Lender: ${sampleQuote.vendorName}`);
        console.log(`- Product: ${sampleQuote.vendorProductName}`);
        console.log(`- Rate: ${sampleQuote.rate}%`);
        console.log(`- APR: ${sampleQuote.apr}%`);
        console.log(`- Monthly Payment: $${sampleQuote.monthlyPayment}`);
        console.log(`- Points: ${sampleQuote.points}`);
        console.log(`- Origination Fee: $${sampleQuote.originationFee}`);
        console.log(`- Monthly MI: $${sampleQuote.monthlyPremium}`);
        console.log(`- Eligibility: ${sampleQuote.eligibility.eligibilityCheck}`);
        
        if (sampleQuote.fees.length > 0) {
          console.log('\n💰 Fees:');
          sampleQuote.fees.forEach(fee => {
            console.log(`- ${fee.description}: $${fee.feeamount}`);
          });
        }
      }
    } else {
      console.log('❌ Mortech API call failed:');
      console.log(`Error: ${response.error}`);
    }

  } catch (error) {
    console.error('💥 Test failed with error:');
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message.includes('Missing required Mortech configuration')) {
        console.log('\n💡 Setup Instructions:');
        console.log('1. Get Mortech credentials from your account manager');
        console.log('2. Add environment variables to .env.local:');
        console.log('   MORTECH_CUSTOMER_ID=your_customer_id');
        console.log('   MORTECH_THIRD_PARTY_NAME=your_third_party_name');
        console.log('   MORTECH_LICENSE_KEY=your_license_key');
        console.log('   MORTECH_EMAIL_ADDRESS=your_email@company.com');
        console.log('3. Run this test again');
      }
    }
  }
}

// Run the test
if (require.main === module) {
  testMortechIntegration()
    .then(() => {
      console.log('\n🎉 Test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

export { testMortechIntegration };
