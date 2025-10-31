import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

// Stable stringify to create consistent cache keys for objects
function stableStringify(obj: any): string {
  const allKeys: string[] = [];
  JSON.stringify(obj, (key, value) => { allKeys.push(key); return value; });
  allKeys.sort();
  return JSON.stringify(obj, allKeys);
}

export interface MortechSearchRequest {
  loanAmount: number;
  propertyValue: number;
  creditScore: number;
  propertyState: string;
  propertyZip: string;
  loanPurpose: 'Purchase' | 'Refinance';
  propertyType: 'Single Family' | 'Condo' | 'Townhouse' | 'Multi-Family';
  occupancy: 'Primary' | 'Secondary' | 'Investment';
  loanTerm: string;
  filterId?: string;
  includeMI?: boolean;
}

export interface MortechSearchResponse {
  success: boolean;
  rates: Array<{
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
  }>;
  searchParams: MortechSearchRequest;
}

export const mortechApi = createApi({
  reducerPath: 'mortechApi',
  baseQuery,
  tagTypes: ['MortechSearch'],
  endpoints: (builder) => ({
    searchRates: builder.query<MortechSearchResponse, MortechSearchRequest>({
      query: (body) => ({
        url: '/api/mortech/search',
        method: 'POST',
        body,
      }),
      // Long-lived cache for market rates
      keepUnusedDataFor: 12 * 60 * 60, // 12 hours (in seconds)
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}(${stableStringify(queryArgs)})`;
      },
      providesTags: (result, error, arg) => [{ type: 'MortechSearch', id: stableStringify(arg) }],
    }),
  }),
});

export const { useSearchRatesQuery, useLazySearchRatesQuery } = mortechApi;




