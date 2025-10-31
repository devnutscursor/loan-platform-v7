import { config } from 'dotenv';
import { createMortechAPI } from '../src/lib/mortech/api';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config({ path: '.env.local' });

interface TestCase {
  name: string;
  description: string;
  params: {
    propertyZip: string;
    appraisedvalue: number;
    loan_amount: number;
    fico: number;
    loanpurpose: 'Purchase' | 'Refinance';
    proptype: 'Single Family' | 'Condo' | 'Townhouse' | 'Multi-Family';
    occupancy: 'Primary' | 'Secondary' | 'Investment';
    loanProduct1: string;
    filterId?: string;
    waiveEscrow?: boolean;
    militaryVeteran?: boolean;
    lockDays?: string;
    secondMortgageAmount?: number;
    pmiCompany?: number;
    noMI?: number;
  };
}

// Define test cases
const testCases: TestCase[] = [
  {
    name: 'conventional-30-year-primary',
    description: 'Conventional 30 year fixed, Primary residence, Single Family',
    params: {
      propertyZip: '99503',
      appraisedvalue: 100000,
      loan_amount: 30000,
      fico: 800,
      loanpurpose: 'Purchase',
      proptype: 'Single Family',
      occupancy: 'Investment',
      loanProduct1: '30 year fixed',
    },
  },
  {
    name: 'fha-30-year-primary',
    description: 'FHA 30 year fixed, Primary residence, Single Family',
    params: {
      propertyZip: '98001',
      appraisedvalue: 500000,
      loan_amount: 400000,
      fico: 800,
      loanpurpose: 'Purchase',
      proptype: 'Single Family',
      occupancy: 'Primary',
      loanProduct1: '30 year fixed',
    },
  },
  {
    name: 'va-30-year-primary',
    description: 'VA 30 year fixed, Primary residence, Single Family, Military Veteran',
    params: {
      propertyZip: '99503',
      appraisedvalue: 100000,
      loan_amount: 70000,
      fico: 800,
      loanpurpose: 'Purchase',
      proptype: 'Multi-Family',
      occupancy: 'Investment',
      loanProduct1: '15 year fixed',
      militaryVeteran: true,
    },
  },
  {
    name: 'conventional-15-year-primary',
    description: 'Conventional 15 year fixed, Primary residence, Single Family',
    params: {
      propertyZip: '98001',
      appraisedvalue: 500000,
      loan_amount: 400000,
      fico: 740,
      loanpurpose: 'Purchase',
      proptype: 'Single Family',
      occupancy: 'Primary',
      loanProduct1: '15 year fixed',
    },
  },
  {
    name: 'conventional-30-year-refinance',
    description: 'Conventional 30 year fixed, Refinance, Single Family',
    params: {
      propertyZip: '98001',
      appraisedvalue: 500000,
      loan_amount: 400000,
      fico: 740,
      loanpurpose: 'Refinance',
      proptype: 'Single Family',
      occupancy: 'Primary',
      loanProduct1: '30 year fixed',
    },
  },
  {
    name: 'conventional-30-year-condo',
    description: 'Conventional 30 year fixed, Primary residence, Condo',
    params: {
      propertyZip: '98001',
      appraisedvalue: 350000,
      loan_amount: 280000,
      fico: 740,
      loanpurpose: 'Purchase',
      proptype: 'Condo',
      occupancy: 'Primary',
      loanProduct1: '30 year fixed',
    },
  },
  {
    name: 'conventional-30-year-investment',
    description: 'Conventional 30 year fixed, Investment property, Single Family',
    params: {
      propertyZip: '98001',
      appraisedvalue: 500000,
      loan_amount: 400000,
      fico: 740,
      loanpurpose: 'Purchase',
      proptype: 'Single Family',
      occupancy: 'Investment',
      loanProduct1: '30 year fixed',
    },
  },
  {
    name: 'conventional-30-year-low-credit',
    description: 'Conventional 30 year fixed, Primary residence, Single Family, Low credit score',
    params: {
      propertyZip: '98001',
      appraisedvalue: 500000,
      loan_amount: 400000,
      fico: 620,
      loanpurpose: 'Purchase',
      proptype: 'Single Family',
      occupancy: 'Primary',
      loanProduct1: '30 year fixed',
      filterId: 'CONV',
    },
  },
  {
    name: 'conventional-30-year-high-ltv',
    description: 'Conventional 30 year fixed, Primary residence, Single Family, High LTV (80%+)',
    params: {
      propertyZip: '98001',
      appraisedvalue: 500000,
      loan_amount: 425000, // 85% LTV
      fico: 740,
      loanpurpose: 'Purchase',
      proptype: 'Single Family',
      occupancy: 'Primary',
      loanProduct1: '30 year fixed',
      pmiCompany: -999, // Best MI company
      noMI: 0, // Borrower paid MI
    },
  },
  {
    name: 'conventional-30-year-with-escrow-waived',
    description: 'Conventional 30 year fixed, Primary residence, Single Family, Escrow waived',
    params: {
      propertyZip: '98001',
      appraisedvalue: 500000,
      loan_amount: 400000,
      fico: 740,
      loanpurpose: 'Purchase',
      proptype: 'Single Family',
      occupancy: 'Primary',
      loanProduct1: '30 year fixed',
      waiveEscrow: true,
    },
  },
  {
    name: 'conventional-30-year-60-day-lock',
    description: 'Conventional 30 year fixed, Primary residence, Single Family, 60 day lock',
    params: {
      propertyZip: '98001',
      appraisedvalue: 500000,
      loan_amount: 400000,
      fico: 740,
      loanpurpose: 'Purchase',
      proptype: 'Single Family',
      occupancy: 'Primary',
      loanProduct1: '30 year fixed',
      lockDays: '60',
    },
  },
  {
    name: 'conventional-30-year-second-mortgage',
    description: 'Conventional 30 year fixed, Primary residence, Single Family, With second mortgage',
    params: {
      propertyZip: '98001',
      appraisedvalue: 500000,
      loan_amount: 400000,
      fico: 740,
      loanpurpose: 'Purchase',
      proptype: 'Single Family',
      occupancy: 'Primary',
      loanProduct1: '30 year fixed',
      secondMortgageAmount: 50000,
    },
  },
  {
    name: 'conventional-30-year-california',
    description: 'Conventional 30 year fixed, Primary residence, Single Family, California',
    params: {
      propertyZip: '90210',
      appraisedvalue: 800000,
      loan_amount: 640000,
      fico: 740,
      loanpurpose: 'Purchase',
      proptype: 'Single Family',
      occupancy: 'Primary',
      loanProduct1: '30 year fixed',
    },
  },
  {
    name: 'conventional-arm-30-year',
    description: 'Conventional ARM 5/30, Primary residence, Single Family',
    params: {
      propertyZip: '98001',
      appraisedvalue: 500000,
      loan_amount: 400000,
      fico: 740,
      loanpurpose: 'Purchase',
      proptype: 'Single Family',
      occupancy: 'Primary',
      loanProduct1: '5 year ARM/30 yrs',
    },
  },
];

async function runTests() {
  console.log('🚀 Starting Mortech API Comprehensive Tests\n');
  
  // Create results directory
  const resultsDir = path.join(__dirname, 'mortech-test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Create timestamp for this test run
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const testRunDir = path.join(resultsDir, `test-run-${timestamp}`);
  fs.mkdirSync(testRunDir, { recursive: true });

  console.log(`📁 Results will be saved to: ${testRunDir}\n`);

  try {
    const mortechAPI = createMortechAPI();
    console.log('✅ Mortech API initialized\n');

    const results = {
      timestamp: new Date().toISOString(),
      totalTests: testCases.length,
      successful: 0,
      failed: 0,
      testResults: [] as any[],
    };

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n${'='.repeat(80)}`);
      console.log(`Test ${i + 1}/${testCases.length}: ${testCase.name}`);
      console.log(`Description: ${testCase.description}`);
      console.log(`${'='.repeat(80)}`);

      try {
        // Make API call with raw XML included
        const response = await mortechAPI.getRates(testCase.params, { includeRawXml: true });

        // Save individual test result
        const testResultFile = path.join(testRunDir, `${testCase.name}.json`);
        const testResult = {
          testCase: {
            name: testCase.name,
            description: testCase.description,
            params: testCase.params,
          },
          response: response,
          timestamp: new Date().toISOString(),
        };

        fs.writeFileSync(testResultFile, JSON.stringify(testResult, null, 2), 'utf-8');

        // Save raw XML separately
        if (response.rawXml) {
          const xmlFile = path.join(testRunDir, `${testCase.name}.xml`);
          fs.writeFileSync(xmlFile, response.rawXml, 'utf-8');
          console.log(`   📄 Raw XML saved to: ${xmlFile}`);
        }

        if (response.success) {
          console.log(`✅ SUCCESS - Found ${response.quotes?.length || 0} quotes`);
          if (response.quotes && response.quotes.length > 0) {
            console.log(`   Rate: ${response.quotes[0].rate}%`);
            console.log(`   APR: ${response.quotes[0].apr}%`);
            console.log(`   Monthly Payment: $${response.quotes[0].monthlyPayment.toFixed(2)}`);
            console.log(`   Product: ${response.quotes[0].vendorProductCode}`);
          }
          results.successful++;
          results.testResults.push({
            name: testCase.name,
            status: 'success',
            quoteCount: response.quotes?.length || 0,
            ...(response.quotes && response.quotes.length > 0 ? {
              firstQuote: {
                rate: response.quotes[0].rate,
                apr: response.quotes[0].apr,
                monthlyPayment: response.quotes[0].monthlyPayment,
                productName: response.quotes[0].vendorProductCode,
              },
            } : {}),
          });
        } else {
          console.log(`❌ FAILED - Error: ${response.error}`);
          results.failed++;
          results.testResults.push({
            name: testCase.name,
            status: 'failed',
            error: response.error,
          });
        }

        // Add delay between requests to avoid rate limiting
        if (i < testCases.length - 1) {
          console.log('⏳ Waiting 2 seconds before next test...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`❌ EXCEPTION: ${error instanceof Error ? error.message : 'Unknown error'}`);
        results.failed++;
        results.testResults.push({
          name: testCase.name,
          status: 'exception',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Save summary
    const summaryFile = path.join(testRunDir, 'summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2), 'utf-8');

    // Print summary
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 TEST SUMMARY');
    console.log(`${'='.repeat(80)}`);
    console.log(`Total Tests: ${results.totalTests}`);
    console.log(`✅ Successful: ${results.successful}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`\n📁 Results saved to: ${testRunDir}`);
    console.log(`📄 Summary saved to: ${summaryFile}`);

    // Print failed tests
    if (results.failed > 0) {
      console.log(`\n❌ Failed Tests:`);
      results.testResults
        .filter(r => r.status !== 'success')
        .forEach(r => {
          console.log(`   - ${r.name}: ${r.error}`);
        });
    }

  } catch (error) {
    console.error('❌ Failed to initialize Mortech API:', error);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

