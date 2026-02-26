'use client';

import React, { useState, useEffect } from 'react';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { icons } from '@/components/ui/Icon';
import RateResults from '@/components/landingPage/RateResults';
import { supabase } from '@/lib/supabase/client';
import { PROGRAM_BUCKETS } from '@/lib/mortech/programBuckets';

interface TodaysRatesTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  isPublic?: boolean;
  publicTemplateData?: any;
  userId?: string;
  companyId?: string;
}

interface SelectedRate {
  id: string;
  rateData: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * TodaysRatesTab - Displays only selected rates from the loan officer
 * No search form, just shows the rates the officer has selected
 */
export default function TodaysRatesTab({
  selectedTemplate,
  className = '',
  isPublic = false,
  publicTemplateData,
  userId,
  companyId
}: TodaysRatesTabProps) {
  const { getTemplateSync } = useEfficientTemplates();
  
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(selectedTemplate);

  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#01bcc6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  
  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 }
  };
  
  const [selectedRates, setSelectedRates] = useState<SelectedRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const PUBLIC_SELECTED_RATES_PREFIX = 'lo:selected-rates:public:';
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  const getStoredSelectedRates = (uid: string): SelectedRate[] | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`${PUBLIC_SELECTED_RATES_PREFIX}${uid}`);
      if (!raw) return null;
      const { rates: stored, fetchedAt } = JSON.parse(raw);
      if (!Array.isArray(stored) || typeof fetchedAt !== 'number') return null;
      if (Date.now() - fetchedAt > CACHE_TTL_MS) return null;
      return stored as SelectedRate[];
    } catch {
      return null;
    }
  };

  const setStoredSelectedRates = (uid: string, list: SelectedRate[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        `${PUBLIC_SELECTED_RATES_PREFIX}${uid}`,
        JSON.stringify({ rates: list, fetchedAt: Date.now() })
      );
    } catch {
      // ignore
    }
  };

  // Fetch selected rates on mount; hydrate from cache first (stale-while-revalidate)
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const stored = getStoredSelectedRates(userId);
    if (stored && stored.length >= 0) {
      setSelectedRates(stored);
      setIsLoading(false);
    }

    const fetchSelectedRates = async (silent: boolean) => {
      try {
        if (!silent) {
          setIsLoading(true);
          setError(null);
        }

        const response = await fetch(`/api/officers/selected-rates?officerId=${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const list = result.rates || [];
            setSelectedRates(list);
            setStoredSelectedRates(userId, list);
          } else {
            if (!silent) setError(result.error || 'Failed to fetch rates');
          }
        } else {
          if (!silent) {
            const errorResult = await response.json().catch(() => ({ error: 'Unknown error' }));
            setError(errorResult.error || `Failed to load rates (${response.status})`);
            setSelectedRates([]);
          }
        }
      } catch (err) {
        if (!silent) {
          setError('Failed to load rates');
          setSelectedRates([]);
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    };

    fetchSelectedRates(!!stored);
  }, [userId]);

  // Transform selected rates to RateResults format
  const transformRatesToRateResults = () => {
    // Helper to safely extract interest rate
    const getInterestRate = (rate: any): number => {
      const value = rate?.interestRate ?? rate?.rate;
      return typeof value === 'number' && !Number.isNaN(value) ? value : Number.POSITIVE_INFINITY;
    };

    // For each defined program bucket, find all matching selected rates and
    // pick the one with the lowest interest rate.
    const bucketBestRates = PROGRAM_BUCKETS.map((bucket) => {
      const matchLower = bucket.match.toLowerCase();

      const matching = selectedRates.filter((selectedRate) => {
        const rate = selectedRate.rateData || {};
        const program = (rate.loanProgram || '').toLowerCase();
        const productDesc = (rate.productDesc || '').toLowerCase();
        const vendorName = (rate.vendorProductName || '').toLowerCase();
        const vendorCode = (rate.vendorProductCode || '').toLowerCase();
        const combined = `${program} ${productDesc} ${vendorName} ${vendorCode}`;
        return combined.includes(matchLower);
      });

      if (matching.length === 0) {
        return null;
      }

      const best = matching.reduce((bestSoFar, current) => {
        const bestRate = getInterestRate(bestSoFar.rateData);
        const currentRate = getInterestRate(current.rateData);
        return currentRate < bestRate ? current : bestSoFar;
      });

      return { bucket, selectedRate: best };
    }).filter(
      (entry): entry is { bucket: (typeof PROGRAM_BUCKETS)[number]; selectedRate: SelectedRate } =>
        entry !== null
    );

    // Map the best rate per bucket into RateResults format
    return bucketBestRates.map(({ bucket, selectedRate }) => {
      const rate = selectedRate.rateData || {};

      // Normalize numeric fields
      const rawLoanTerm = rate.loanTerm ?? rate.productTerm ?? 30;
      const loanTerm =
        typeof rawLoanTerm === 'number'
          ? rawLoanTerm
          : parseInt(String(rawLoanTerm), 10) || 30;

      const interestRate = getInterestRate(rate);
      const apr =
        typeof rate.apr === 'number' && !Number.isNaN(rate.apr) ? rate.apr : 0;
      const monthlyPayment =
        typeof rate.monthlyPayment === 'number' && !Number.isNaN(rate.monthlyPayment)
          ? rate.monthlyPayment
          : 0;
      const fees =
        typeof rate.fees === 'number' && !Number.isNaN(rate.fees) ? rate.fees : 0;
      const points =
        typeof rate.points === 'number' && !Number.isNaN(rate.points) ? rate.points : 0;
      const credits =
        typeof rate.credits === 'number' && !Number.isNaN(rate.credits)
          ? rate.credits
          : 0;
      const lockPeriodRaw = rate.lockPeriod ?? rate.lockTerm ?? 30;
      const lockPeriod =
        typeof lockPeriodRaw === 'number'
          ? lockPeriodRaw
          : parseInt(String(lockPeriodRaw), 10) || 30;

      return {
        id: rate.id || rate.productId || selectedRate.id,
        lenderName: "Today's Rates",
        loanProgram: bucket.label,
        loanType: rate.loanType || rate.termType || 'Fixed',
        loanTerm,
        interestRate: Number.isFinite(interestRate) ? interestRate : 0,
        apr,
        monthlyPayment,
        fees,
        points,
        credits,
        lockPeriod,
        searchParams: rate.searchParams,
      };
    });
  };

  return (
    <div 
      className={`w-full space-y-6 ${className}`}
      style={{ 
        fontFamily: templateData?.template?.typography?.fontFamily || 'Inter',
        padding: `${layout.padding.medium}px 0`
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 
          className="text-xl @md:text-2xl font-bold mb-2"
          style={{ color: colors.text }}
        >
          Today's Mortgage Rates
        </h2>
        <p 
          className="text-base @md:text-lg"
          style={{ color: colors.textSecondary }}
        >
          Current rates selected by your loan officer
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4" style={{ borderRadius: `${layout.borderRadius}px` }}>
          <div className="flex items-center">
            {React.createElement(icons.error, { size: 20, className: "text-red-500 mr-2" })}
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div 
          className="space-y-4"
          style={{ 
            backgroundColor: colors.background,
            borderRadius: `${layout.borderRadius}px`,
            padding: `${layout.padding.medium}px`
          }}
        >
          {/* Skeleton for rate cards */}
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="animate-pulse border rounded-lg p-4"
              style={{
                borderColor: colors.border,
                borderRadius: `${layout.borderRadius}px`,
              }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Loan Program Skeleton */}
                <div>
                  <div 
                    className="h-3 w-20 mb-2 rounded"
                    style={{ backgroundColor: colors.border }}
                  />
                  <div 
                    className="h-5 w-32 rounded"
                    style={{ backgroundColor: colors.border }}
                  />
                </div>
                {/* Interest Rate Skeleton */}
                <div>
                  <div 
                    className="h-3 w-20 mb-2 rounded"
                    style={{ backgroundColor: colors.border }}
                  />
                  <div 
                    className="h-5 w-24 rounded"
                    style={{ backgroundColor: colors.border }}
                  />
                </div>
                {/* APR Skeleton */}
                <div>
                  <div 
                    className="h-3 w-16 mb-2 rounded"
                    style={{ backgroundColor: colors.border }}
                  />
                  <div 
                    className="h-5 w-24 rounded"
                    style={{ backgroundColor: colors.border }}
                  />
                </div>
                {/* P&I Skeleton */}
                <div>
                  <div 
                    className="h-3 w-24 mb-2 rounded"
                    style={{ backgroundColor: colors.border }}
                  />
                  <div 
                    className="h-5 w-28 rounded"
                    style={{ backgroundColor: colors.border }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && selectedRates.length === 0 && (
        <div 
          className="text-center p-8 rounded-lg"
          style={{ 
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: `${layout.borderRadius}px`,
            color: colors.textSecondary 
          }}
        >
          <p className="text-base font-medium mb-2" style={{ color: colors.text }}>
            No rates available
          </p>
          <p className="text-sm">
            Please contact your loan officer for current mortgage rates.
          </p>
        </div>
      )}

      {/* Rate Results Component - Only show if we have rates */}
      {!isLoading && selectedRates.length > 0 && (
        <RateResults
          products={transformRatesToRateResults()}
          loading={false}
          rawData={[]}
          template={selectedTemplate}
          isMockData={false}
          dataSource="todays-rates"
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
          userId={userId}
          companyId={companyId}
          showTodaysRatesOnly={true}
        />
      )}

      {/* Disclaimer */}
      <div 
        className="text-xs text-center p-4 rounded-lg mt-6"
        style={{ 
          backgroundColor: colors.background,
          border: `1px solid ${colors.border}`,
          borderRadius: `${layout.borderRadius}px`,
          color: colors.textSecondary 
        }}
      >
        <p>
          Disclosures & Disclaimers:

          Rates, APRs, and terms are estimates only and subject to change without notice. All quotes are based on the data you provided, and additional closing costs and fees may apply. This is not a commitment to lend. All loans are subject to final underwriting approval and verifications. This is not a "Loan Estimate" as defined by the CFPB.
        </p>
      </div>
    </div>
  );
}
