import { NextRequest, NextResponse } from 'next/server';
import { createMortechAPI } from '@/lib/mortech/api';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 GET /api/mortech/search - Starting Mortech rate search');

    const { searchParams } = new URL(request.url);
    
    // Extract search parameters - EXACTLY as test script
    const loanAmount = parseFloat(searchParams.get('loanAmount') || '0');
    const propertyValue = parseFloat(searchParams.get('propertyValue') || '0');
    const creditScore = parseInt(searchParams.get('creditScore') || '740');
    const propertyZip = searchParams.get('propertyZip') || '';
    const loanPurpose = searchParams.get('loanPurpose') as 'Purchase' | 'Refinance' || 'Purchase';
    const propertyType = searchParams.get('propertyType') as 'Single Family' | 'Condo' | 'Townhouse' | 'Multi-Family' || 'Single Family';
    const occupancy = searchParams.get('occupancy') as 'Primary' | 'Secondary' | 'Investment' || 'Primary';
    const loanTerm = searchParams.get('loanTerm') || '30 year fixed';
    const filterId = searchParams.get('filterId') || undefined;
    const includeMI = searchParams.get('includeMI') === 'true';
    // Additional custom rate parameters
    const waiveEscrow = searchParams.get('waiveEscrow') === 'true';
    const militaryVeteran = searchParams.get('militaryVeteran') === 'true';
    const lockDays = searchParams.get('lockDays') || '30';
    const secondMortgageAmountParam = searchParams.get('secondMortgageAmount') || '0';
    const safeSecondMortgageAmount = (() => {
      if (!secondMortgageAmountParam || secondMortgageAmountParam === '' || secondMortgageAmountParam === '0') return 0;
      const parsed = parseFloat(secondMortgageAmountParam);
      return isNaN(parsed) ? 0 : parsed;
    })();

    // Validate required parameters - EXACTLY as test script
    if (!loanAmount || !propertyValue || !propertyZip) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: loanAmount, propertyValue, propertyZip'
      }, { status: 400 });
    }

    console.log('📋 Search Parameters:', {
      loanAmount,
      propertyValue,
      creditScore,
      propertyZip,
      loanPurpose,
      propertyType,
      occupancy,
      loanTerm,
      filterId,
      includeMI
    });

    // Create Mortech API instance
    const mortechAPI = createMortechAPI();

    // Prepare request - matching test script format EXACTLY
    const mortechRequest = {
      propertyZip,
      appraisedvalue: propertyValue,
      loan_amount: loanAmount,
      fico: creditScore,
      loanpurpose: loanPurpose,
      proptype: propertyType,
      occupancy,
      loanProduct1: loanTerm,
      // filterId is optional
      ...(filterId && { filterId }),
      ...(includeMI && { 
        pmiCompany: -999, // Best MI company
        noMI: 0, // Borrower paid MI
      }),
      // Additional custom rate parameters - only include if they have meaningful values
      ...(waiveEscrow === true && { waiveEscrow: true }),
      ...(militaryVeteran === true && { militaryVeteran: true }),
      ...(lockDays && lockDays !== '30' && { lockDays }),
      ...(safeSecondMortgageAmount > 0 && { secondMortgageAmount: safeSecondMortgageAmount })
    };

    // Call Mortech API
    const response = await mortechAPI.getRates(mortechRequest);

    if (!response.success) {
      console.error('❌ Mortech API Error:', response.error);
      return NextResponse.json({
        success: false,
        error: response.error || 'Failed to fetch rates from Mortech'
      }, { status: 500 });
    }

    // Transform response to match your existing frontend format
    const transformedRates = response.quotes?.map(quote => ({
      id: quote.productId,
      lenderName: quote.vendorName,
      productName: quote.vendorProductCode || quote.vendorProductName,
      loanProgram: quote.productDesc,
      loanType: quote.termType,
      loanTerm: quote.productTerm,
      interestRate: quote.rate,
      apr: quote.apr,
      monthlyPayment: quote.monthlyPayment,
      points: quote.points,
      originationFee: quote.originationFee,
      upfrontFee: quote.upfrontFee,
      monthlyPremium: quote.monthlyPremium,
      downPayment: quote.downPayment,
      loanAmount: quote.loanAmount,
      lockTerm: quote.lockTerm,
      pricingStatus: quote.pricingStatus,
      lastUpdate: quote.lastUpdate,
      fees: quote.fees.map(fee => ({
        description: fee.description,
        amount: fee.feeamount,
        section: fee.section,
        paymentType: fee.paymenttype,
        prepaid: fee.prepaid
      })),
      eligibility: quote.eligibility,
      // Additional fields for compatibility
      credits: 0, // Not provided by Mortech, set to 0
      lockPeriod: quote.lockTerm,
    })) || [];

    console.log(`✅ Found ${transformedRates.length} rates from Mortech`);
    console.log('📊 Transformed rates sample:', transformedRates);
    console.log('🔍 Response structure:', {
      success: true,
      ratesCount: transformedRates.length,
      source: 'mortech_api',
      isMockData: false
    });

    return NextResponse.json({
      success: true,
      rates: transformedRates,
      source: 'mortech_api',
      isMockData: false,
      searchParams: {
        loanAmount,
        propertyValue,
        creditScore,
        propertyZip,
        loanPurpose,
        propertyType,
        occupancy,
        loanTerm,
        filterId,
        includeMI,
        waiveEscrow,
        militaryVeteran,
        lockDays,
        secondMortgageAmount: safeSecondMortgageAmount
      }
    });

  } catch (error) {
    console.error('❌ Mortech search error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/mortech/search - Starting Mortech rate search');

    const body = await request.json();
    console.log('📥 Raw request body:', body);
    
    // Accept BOTH formats for flexibility
    const {
      // Test script format (preferred - exact match)
      loan_amount,
      appraisedvalue,
      fico,
      propertyZip,
      loanpurpose,
      proptype,
      occupancy,
      loanProduct1,
      // Old format (for backward compatibility)
      loanAmount,
      propertyValue,
      creditScore,
      loanPurpose,
      propertyType,
      loanTerm,
      // Optional params
      filterId,
      includeMI = false,
      waiveEscrow = false,
      militaryVeteran = false,
      lockDays = '30',
      secondMortgageAmount = 0 as number | string
    } = body;
    
    // Use test script format if provided, otherwise fall back to old format
    const finalLoanAmount = loan_amount || loanAmount;
    const finalPropertyValue = appraisedvalue || propertyValue;
    const finalCreditScore = fico || creditScore || 740;
    const finalLoanPurpose = loanpurpose || loanPurpose || 'Purchase';
    const finalPropertyType = proptype || propertyType || 'Single Family';
    const finalLoanTerm = loanProduct1 || loanTerm || '30 year fixed';

    // Handle empty string values for numeric fields
    const safeSecondMortgageAmount = (() => {
      // Handle both string and number types, and empty strings
      if (secondMortgageAmount === undefined || secondMortgageAmount === null) return 0;
      if (typeof secondMortgageAmount === 'string') {
        if (secondMortgageAmount === '' || secondMortgageAmount === '0') return 0;
        const parsed = parseInt(secondMortgageAmount, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
      // It's already a number
      return secondMortgageAmount;
    })();

    // Validate required parameters - EXACTLY as test script
    if (!finalLoanAmount || !finalPropertyValue || !propertyZip) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: finalLoanAmount, finalPropertyValue, propertyZip'
      }, { status: 400 });
    }

    console.log('📋 Search Parameters:', {
      finalLoanAmount,
      finalPropertyValue,
      finalCreditScore,
      propertyZip,
      finalLoanPurpose,
      finalPropertyType,
      occupancy,
      finalLoanTerm,
      filterId,
      includeMI
    });

    // Create Mortech API instance
    const mortechAPI = createMortechAPI();

    // Prepare request - matching test script format EXACTLY
    const mortechRequest = {
      propertyZip,
      appraisedvalue: finalPropertyValue,
      loan_amount: finalLoanAmount,
      fico: finalCreditScore,
      loanpurpose: finalLoanPurpose,
      proptype: finalPropertyType,
      occupancy,
      loanProduct1: finalLoanTerm,
      // filterId is optional
      ...(filterId && { filterId }),
      ...(includeMI && { 
        pmiCompany: -999, // Best MI company
        noMI: 0, // Borrower paid MI
      }),
      // Additional custom rate parameters - only include if they have meaningful values
      ...(waiveEscrow === true && { waiveEscrow: true }),
      ...(militaryVeteran === true && { militaryVeteran: true }),
      ...(lockDays && lockDays !== '30' && { lockDays }),
      ...(safeSecondMortgageAmount > 0 && { secondMortgageAmount: safeSecondMortgageAmount })
    };

    // Call Mortech API
    const response = await mortechAPI.getRates(mortechRequest);

    if (!response.success) {
      console.error('❌ Mortech API Error:', response.error);
      return NextResponse.json({
        success: false,
        error: response.error || 'Failed to fetch rates from Mortech'
      }, { status: 500 });
    }

    // Transform response to match your existing frontend format
    const transformedRates = response.quotes?.map(quote => ({
      id: quote.productId,
      lenderName: quote.vendorName,
      productName: quote.vendorProductCode || quote.vendorProductName,
      loanProgram: quote.productDesc,
      loanType: quote.termType,
      loanTerm: quote.productTerm,
      interestRate: quote.rate,
      apr: quote.apr,
      monthlyPayment: quote.monthlyPayment,
      points: quote.points,
      originationFee: quote.originationFee,
      upfrontFee: quote.upfrontFee,
      monthlyPremium: quote.monthlyPremium,
      downPayment: quote.downPayment,
      loanAmount: quote.loanAmount,
      lockTerm: quote.lockTerm,
      pricingStatus: quote.pricingStatus,
      lastUpdate: quote.lastUpdate,
      fees: quote.fees.map(fee => ({
        description: fee.description,
        amount: fee.feeamount,
        section: fee.section,
        paymentType: fee.paymenttype,
        prepaid: fee.prepaid
      })),
      eligibility: quote.eligibility,
      // Additional fields for compatibility
      credits: 0, // Not provided by Mortech, set to 0
      lockPeriod: quote.lockTerm,
    })) || [];

    console.log(`✅ Found ${transformedRates.length} rates from Mortech`);
    console.log('📊 Transformed rates sample:', transformedRates[0]);
    console.log('🔍 Response structure:', {
      success: true,
      ratesCount: transformedRates.length,
      source: 'mortech_api',
      isMockData: false
    });

    return NextResponse.json({
      success: true,
      rates: transformedRates,
      source: 'mortech_api',
      isMockData: false,
      searchParams: {
        finalLoanAmount,
        finalPropertyValue,
        finalCreditScore,
        propertyZip,
        finalLoanPurpose,
        finalPropertyType,
        occupancy,
        finalLoanTerm,
        filterId,
        includeMI,
        waiveEscrow,
        militaryVeteran,
        lockDays,
        secondMortgageAmount: safeSecondMortgageAmount
      }
    });

  } catch (error) {
    console.error('❌ Mortech search error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
