/**
 * Utility functions for migrating from Optimal Blue to Mortech API
 */

export interface OptimalBlueProduct {
  apr: number;
  productType: string;
  armMargin: number;
  closingCost: number;
  lastUpdate: string;
  loanTerm: string;
  lockPeriod: number;
  price: number;
  rate: number;
  rebate: number;
  discount: number;
  principalAndInterest: number;
  monthlyMI: number;
  totalPayment: number;
  amortizationTerm: string;
  amortizationType: string;
  investorId: number;
  investor: string;
  loanType: string;
  priceStatus: string;
  pendingUpdate: boolean;
  productCode: string;
  productId: number;
  productName: string;
}

export interface MortechRate {
  id: string;
  lenderName: string;
  productName: string;
  loanProgram: string;
  loanType: string;
  loanTerm: string;
  interestRate: number;
  apr: number;
  monthlyPayment: number;
  points: number;
  originationFee: number;
  upfrontFee: number;
  monthlyPremium: number;
  downPayment: number;
  loanAmount: number;
  lockTerm: number;
  pricingStatus: string;
  lastUpdate: string;
  fees: Array<{
    description: string;
    amount: number;
    section: string;
    paymentType: string;
    prepaid: boolean;
  }>;
  eligibility: {
    eligibilityCheck: string;
    comments: string;
  };
  credits: number;
  lockPeriod: number;
}

/**
 * Transform Optimal Blue request format to Mortech format
 */
export function transformOBRequestToMortech(obRequest: any): any {
  return {
    loanAmount: obRequest.baseLoanAmount || obRequest.loanInformation?.baseLoanAmount || 150000,
    propertyValue: obRequest.salesPrice || obRequest.propertyInformation?.appraisedValue || 225000,
    creditScore: parseCreditScore(obRequest.representativeFICO || obRequest.loanInformation?.representativeFICO) || 750,
    propertyState: obRequest.state || obRequest.propertyInformation?.state || 'TX',
    propertyZip: obRequest.zipCode || obRequest.propertyInformation?.zipCode || '95825',
    loanPurpose: (obRequest.loanPurpose === 'Purchase' ? 'Purchase' : 'Refinance') as 'Purchase' | 'Refinance',
    propertyType: mapPropertyType(obRequest.propertyType || obRequest.propertyInformation?.propertyType),
    occupancy: mapOccupancy(obRequest.occupancy || obRequest.propertyInformation?.occupancy),
    loanTerm: mapLoanTerm(obRequest.loanTerms?.[0] || 'ThirtyYear'),
    includeMI: true
  };
}

/**
 * Transform Optimal Blue response format to Mortech format
 */
export function transformOBResponseToMortech(obResponse: any): MortechRate[] {
  const products = obResponse.data?.products || obResponse.products || [];
  
  return products.map((product: OptimalBlueProduct) => ({
    id: product.productId.toString(),
    lenderName: product.investor,
    productName: product.productName,
    loanProgram: product.productName,
    loanType: product.amortizationType,
    loanTerm: mapLoanTermReverse(product.loanTerm),
    interestRate: product.rate,
    apr: product.apr,
    monthlyPayment: product.principalAndInterest,
    points: product.price,
    originationFee: 0, // Not available in OB response
    upfrontFee: 0, // Not available in OB response
    monthlyPremium: product.monthlyMI,
    downPayment: 0, // Not available in OB response
    loanAmount: 0, // Not available in OB response
    lockTerm: product.lockPeriod,
    pricingStatus: product.priceStatus,
    lastUpdate: product.lastUpdate,
    fees: [
      {
        description: 'Closing Costs',
        amount: product.closingCost,
        section: 'Other Costs',
        paymentType: 'Borrower-Paid At Closing',
        prepaid: false
      }
    ],
    eligibility: {
      eligibilityCheck: 'Pass', // Default assumption
      comments: ''
    },
    credits: product.rebate,
    lockPeriod: product.lockPeriod,
  }));
}

/**
 * Parse credit score from various formats
 */
function parseCreditScore(creditScoreRange: string | number): number {
  if (typeof creditScoreRange === 'number') {
    return creditScoreRange;
  }
  
  if (!creditScoreRange || typeof creditScoreRange !== 'string') {
    return 750; // Default fallback
  }
  
  // Handle different range formats
  if (creditScoreRange.includes('-')) {
    const [min, max] = creditScoreRange.split('-').map(num => parseInt(num.trim()));
    if (!isNaN(min) && !isNaN(max)) {
      // Return the midpoint of the range
      return Math.round((min + max) / 2);
    }
  }
  
  // If it's already a single number
  const singleScore = parseInt(creditScoreRange);
  if (!isNaN(singleScore)) {
    return singleScore;
  }
  
  // Fallback for any other format
  return 750;
}

/**
 * Map Optimal Blue property types to Mortech format
 */
function mapPropertyType(obPropertyType: string): 'Single Family' | 'Condo' | 'Townhouse' | 'Multi-Family' {
  switch (obPropertyType) {
    case 'SingleFamily':
      return 'Single Family';
    case 'Condo':
      return 'Condo';
    case 'Townhouse':
      return 'Townhouse';
    case 'MultiFamily':
      return 'Multi-Family';
    default:
      return 'Single Family';
  }
}

/**
 * Map Optimal Blue occupancy to Mortech format
 */
function mapOccupancy(obOccupancy: string): 'Primary' | 'Secondary' | 'Investment' {
  switch (obOccupancy) {
    case 'PrimaryResidence':
      return 'Primary';
    case 'SecondaryResidence':
      return 'Secondary';
    case 'Investment':
      return 'Investment';
    default:
      return 'Primary';
  }
}

/**
 * Map Optimal Blue loan terms to Mortech format
 */
function mapLoanTerm(obLoanTerm: string): string {
  switch (obLoanTerm) {
    case 'ThirtyYear':
      return '30 year fixed';
    case 'FifteenYear':
      return '15 year fixed';
    case 'TwentyYear':
      return '20 year fixed';
    case 'TwentyFiveYear':
      return '25 year fixed';
    case 'TenYear':
      return '10 year fixed';
    default:
      return '30 year fixed';
  }
}

/**
 * Map Mortech loan terms back to Optimal Blue format
 */
function mapLoanTermReverse(mortechLoanTerm: string): string {
  switch (mortechLoanTerm) {
    case '30':
      return 'ThirtyYear';
    case '15':
      return 'FifteenYear';
    case '20':
      return 'TwentyYear';
    case '25':
      return 'TwentyFiveYear';
    case '10':
      return 'TenYear';
    default:
      return 'ThirtyYear';
  }
}

/**
 * Check if a response is from Mortech API
 */
export function isMortechResponse(response: any): boolean {
  return response.success && Array.isArray(response.rates);
}

/**
 * Check if a response is from Optimal Blue API
 */
export function isOptimalBlueResponse(response: any): boolean {
  return response.data?.products || response.products;
}




