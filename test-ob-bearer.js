#!/usr/bin/env node

// Test Optimal Blue API with Bearer Token
// Run with: node test-ob-bearer.js

const fetch = require('node-fetch');

async function testOptimalBlueBearerAPI() {
  console.log('🔍 Testing Optimal Blue API with Bearer Token...\n');

  // Check environment variables
  const OB_BASE_URL = process.env.OB_BASE_URL || "https://marketplace.optimalblue.com/consumer/api";
  const BUSINESS_CHANNEL_ID = process.env.OB_BUSINESS_CHANNEL_ID || "64170";
  const ORIGINATOR_ID = process.env.OB_ORIGINATOR_ID || "749463";
  const OB_BEARER_TOKEN = process.env.OB_BEARER_TOKEN;

  console.log('📋 Configuration:');
  console.log(`   Base URL: ${OB_BASE_URL}`);
  console.log(`   Business Channel ID: ${BUSINESS_CHANNEL_ID}`);
  console.log(`   Originator ID: ${ORIGINATOR_ID}`);
  console.log(`   Bearer Token: ${OB_BEARER_TOKEN ? '✅ Provided' : '❌ Missing'}`);
  console.log('');

  if (!OB_BEARER_TOKEN) {
    console.log('❌ Missing Bearer Token!');
    console.log('   Please add OB_BEARER_TOKEN to your .env.local file');
    return;
  }

  // Test API endpoint
  const url = `${OB_BASE_URL}/businesschannels/${BUSINESS_CHANNEL_ID}/originators/${ORIGINATOR_ID}/bestexsearch`;
  
  const testPayload = {
    borrowerInformation: {
      citizenship: "USCitizen",
      firstName: "test",
      lastName: "test1",
      vaFirstTimeUse: true,
      firstTimeHomeBuyer: false,
      monthsReserves: 24,
      selfEmployed: true,
      waiveEscrows: false
    },
    propertyInformation: {
      appraisedValue: 225000,
      occupancy: "PrimaryResidence",
      propertyStreetAddress: "string",
      county: "Collin",
      state: "TX",
      zipCode: "75024",
      propertyType: "SingleFamily",
      corporateRelocation: false,
      salesPrice: 225000,
      numberOfStories: 1,
      numberOfUnits: "OneUnit"
    },
    loanInformation: {
      loanPurpose: "Purchase",
      lienType: "First",
      amortizationTypes: ["Fixed"],
      armFixedTerms: ["FiveYear"],
      automatedUnderwritingSystem: "NotSpecified",
      borrowerPaidMI: "Yes",
      buydown: "None",
      cashOutAmount: 0,
      desiredLockPeriod: 0,
      desiredPrice: 0,
      desiredRate: 0,
      feesIn: "No",
      expandedApprovalLevel: "NotApplicable",
      interestOnly: false,
      baseLoanAmount: 150000,
      secondLienAmount: 0,
      helocDrawnAmount: 0,
      helocLineAmount: 0,
      loanTerms: ["ThirtyYear", "TwentyFiveYear"],
      loanType: "Conventional",
      prepaymentPenalty: "None",
      exemptFromVAFundingFee: false,
      includeLOCompensationInPricing: "YesLenderPaid",
      calculateTotalLoanAmount: true,
      expandedGuidelines: {
        incomeVerificationType: "FullDoc",
        housingEventType: "None",
        housingEventSeasoning: "NotApplicable",
        bankruptcyType: "None",
        bankruptcyOutcome: "NotApplicable",
        bankruptcySeasoning: "NotApplicable",
        mortgageLatesx30_12Mos: 0,
        mortgageLatesx30_13to24Mos: 0,
        mortgageLatesx60_12Mos: 0,
        mortgageLatesx60_13to24Mos: 0,
        mortgageLatesx90_12Mos: 0,
        mortgageLatesx90_13to24Mos: 0,
        mortgageLatesx120_12Mos: 0,
        mortgageLatesx120_13to24Mos: 0,
        debtConsolidation: false,
        uniqueProperty: false
      },
      representativeFICO: 500,
      loanLevelDebtToIncomeRatio: 18,
      totalMonthlyQualifyingIncome: 9000,
      customerInternalId: "OBSearch"
    }
  };

  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "api-version": "4",
    "Authorization": `Bearer ${OB_BEARER_TOKEN}`
  };

  console.log('🚀 Testing API call...');
  console.log(`   URL: ${url}`);
  console.log('   Headers:', Object.keys(headers).join(', '));
  console.log('');

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(testPayload)
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call successful!');
      console.log(`   Products returned: ${data.products?.length || 0}`);
      console.log(`   Search ID: ${data.searchId || 'N/A'}`);
      
      if (data.products && data.products.length > 0) {
        console.log('   Sample product:');
        console.log(`     APR: ${data.products[0].apr}%`);
        console.log(`     Rate: ${data.products[0].rate}%`);
        console.log(`     Points: ${data.products[0].points}`);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API call failed!');
      console.log(`   Error: ${errorText}`);
      
      if (response.status === 401) {
        console.log('   💡 This is an authentication error. Check your Bearer token.');
        console.log('   💡 Token might be expired or invalid.');
      } else if (response.status === 403) {
        console.log('   💡 This is a permission error. Check your account permissions.');
      } else if (response.status === 404) {
        console.log('   💡 This is a not found error. Check your Business Channel ID and Originator ID.');
      }
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testOptimalBlueBearerAPI();
