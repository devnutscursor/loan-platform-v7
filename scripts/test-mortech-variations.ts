#!/usr/bin/env tsx

import { config } from 'dotenv';
import { createMortechAPI } from '../src/lib/mortech/api';

// Load environment variables
config({ path: '.env.local' });

async function testMortechVariations() {
  console.log('🧪 Testing Mortech API with different parameters...\n');

  const mortechAPI = createMortechAPI();

  // Test cases with different parameters
  const testCases = [
    {
      name: 'Test 1: Default Conventional',
      params: {
        propertyState: 'TX',
        propertyZip: '75024',
        appraisedvalue: 225000,
        loan_amount: 150000,
        fico: 750,
        loanpurpose: 'Purchase' as const,
        proptype: 'Single Family' as const,
        occupancy: 'Primary' as const,
        loanProduct1: '30 year fixed',
        filterId: 'CONV',
        waiveEscrow: false,
        militaryVeteran: false,
        lockDays: '30',
        secondMortgageAmount: 0
      }
    },
    {
      name: 'Test 2: FHA Loan',
      params: {
        propertyState: 'TX',
        propertyZip: '75024',
        appraisedvalue: 225000,
        loan_amount: 150000,
        fico: 650,
        loanpurpose: 'Purchase' as const,
        proptype: 'Single Family' as const,
        occupancy: 'Primary' as const,
        loanProduct1: '30 year fixed',
        filterId: 'FHA',
        waiveEscrow: false,
        militaryVeteran: false,
        lockDays: '30',
        secondMortgageAmount: 0
      }
    },
    {
      name: 'Test 3: VA Loan',
      params: {
        propertyState: 'TX',
        propertyZip: '75024',
        appraisedvalue: 225000,
        loan_amount: 150000,
        fico: 750,
        loanpurpose: 'Purchase' as const,
        proptype: 'Single Family' as const,
        occupancy: 'Primary' as const,
        loanProduct1: '30 year fixed',
        filterId: 'VA',
        waiveEscrow: false,
        militaryVeteran: true,
        lockDays: '30',
        secondMortgageAmount: 0
      }
    },
    {
      name: 'Test 4: Investment Property',
      params: {
        propertyState: 'TX',
        propertyZip: '75024',
        appraisedvalue: 225000,
        loan_amount: 150000,
        fico: 750,
        loanpurpose: 'Purchase' as const,
        proptype: 'Single Family' as const,
        occupancy: 'Investment' as const,
        loanProduct1: '30 year fixed',
        filterId: 'INVESTMENT',
        waiveEscrow: false,
        militaryVeteran: false,
        lockDays: '30',
        secondMortgageAmount: 0
      }
    },
    {
      name: 'Test 5: Different Credit Score',
      params: {
        propertyState: 'TX',
        propertyZip: '75024',
        appraisedvalue: 225000,
        loan_amount: 150000,
        fico: 620,
        loanpurpose: 'Purchase' as const,
        proptype: 'Single Family' as const,
        occupancy: 'Primary' as const,
        loanProduct1: '30 year fixed',
        filterId: 'CONV',
        waiveEscrow: false,
        militaryVeteran: false,
        lockDays: '30',
        secondMortgageAmount: 0
      }
    },
    {
      name: 'Test 6: Different Loan Amount',
      params: {
        propertyState: 'TX',
        propertyZip: '75024',
        appraisedvalue: 400000,
        loan_amount: 320000,
        fico: 750,
        loanpurpose: 'Purchase' as const,
        proptype: 'Single Family' as const,
        occupancy: 'Primary' as const,
        loanProduct1: '30 year fixed',
        filterId: 'CONV',
        waiveEscrow: false,
        militaryVeteran: false,
        lockDays: '30',
        secondMortgageAmount: 0
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n${testCase.name}`);
    console.log('='.repeat(50));
    
    try {
      const response = await mortechAPI.getRates(testCase.params);
      
      if (response.success && response.quotes) {
        console.log(`✅ Success: Found ${response.quotes.length} rates`);
        console.log('📊 Rate Summary:');
        response.quotes.forEach((quote, index) => {
          console.log(`  ${index + 1}. ${quote.vendorName} - ${quote.productDesc}`);
          console.log(`     Rate: ${quote.rate}%, APR: ${quote.apr}%, Payment: $${quote.monthlyPayment}`);
        });
      } else {
        console.log(`❌ Failed: ${response.error}`);
      }
    } catch (error) {
      console.log(`💥 Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎯 Test Summary:');
  console.log('If all tests return the same 3 rates, the Mortech API is configured to return static test data.');
  console.log('If rates vary by test case, the API is working correctly with different parameters.');
}

// Run the test
if (require.main === module) {
  testMortechVariations()
    .then(() => {
      console.log('\n✅ Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

export { testMortechVariations };

