#!/usr/bin/env node

// Test Optimal Blue API Configuration
// Run with: node test-ob-api.js

const fetch = require('node-fetch');

async function testOptimalBlueAPI() {
  console.log('🔍 Testing Optimal Blue API Configuration...\n');

  // Check environment variables
  const OB_BASE_URL = process.env.OB_BASE_URL || "https://marketplace.optimalblue.com/consumer/api";
  const BUSINESS_CHANNEL_ID = process.env.OB_BUSINESS_CHANNEL_ID || "64170";
  const ORIGINATOR_ID = process.env.OB_ORIGINATOR_ID || "749463";
  const OB_API_KEY = process.env.OB_API_KEY;
  const OB_SECRET_KEY = process.env.OB_SECRET_KEY;

  console.log('📋 Configuration:');
  console.log(`   Base URL: ${OB_BASE_URL}`);
  console.log(`   Business Channel ID: ${BUSINESS_CHANNEL_ID}`);
  console.log(`   Originator ID: ${ORIGINATOR_ID}`);
  console.log(`   API Key: ${OB_API_KEY ? '✅ Provided' : '❌ Missing'}`);
  console.log(`   Secret Key: ${OB_SECRET_KEY ? '✅ Provided' : '❌ Missing'}`);
  console.log('');

  if (!OB_API_KEY || !OB_SECRET_KEY) {
    console.log('❌ Missing API credentials!');
    console.log('   Please add OB_API_KEY and OB_SECRET_KEY to your .env.local file');
    console.log('   See OPTIMAL_BLUE_SETUP.md for instructions');
    return;
  }

  // Test API endpoint
  const url = `${OB_BASE_URL}/businesschannels/${BUSINESS_CHANNEL_ID}/originators/${ORIGINATOR_ID}/bestexsearch`;
  
  const testPayload = {
    borrowerInformation: {
      citizenship: "USCitizen",
      firstName: "Test",
      lastName: "User",
      vaFirstTimeUse: true,
      firstTimeHomeBuyer: false,
      monthsReserves: 6,
      selfEmployed: false,
      waiveEscrows: false
    },
    propertyInformation: {
      appraisedValue: 400000,
      occupancy: "PrimaryResidence",
      propertyStreetAddress: "123 Test St",
      county: "Collin",
      state: "TX",
      zipCode: "75024",
      propertyType: "SingleFamily",
      corporateRelocation: false,
      salesPrice: 400000,
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
      loanAmount: 320000,
      loanLevelDebtToIncomeRatio: 28,
      totalMonthlyQualifyingIncome: 11428,
      representativeFICO: 750,
      customerInternalId: "TestSearch"
    }
  };

  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "api-version": "4",
    "X-API-Key": OB_API_KEY,
    "X-Secret-Key": OB_SECRET_KEY
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
    } else {
      const errorText = await response.text();
      console.log('❌ API call failed!');
      console.log(`   Error: ${errorText}`);
      
      if (response.status === 401) {
        console.log('   💡 This is an authentication error. Check your API credentials.');
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

testOptimalBlueAPI();
