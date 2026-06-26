'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { icons } from '@/components/ui/Icon';
import RateResults from '@/components/landingPage/RateResults';
import {
  mapRatesToDisplayProducts,
  type SelectedRateRow,
} from '@/lib/mortech/mapRatesToDisplayProducts';
import { PROGRAM_BUCKETS } from '@/lib/mortech/programBuckets';

interface TodaysRatesTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  isPublic?: boolean;
  publicTemplateData?: any;
  userId?: string;
  companyId?: string;
  hasMortechSubscription?: boolean;
  /** SSR / prefetched rates — avoids client fetch waterfall on public profile */
  initialSelectedRates?: SelectedRateRow[];
}

interface SelectedRate {
  id: string;
  rateData: any;
  createdAt: string;
  updatedAt: string;
}

const PUBLIC_SELECTED_RATES_PREFIX = 'lo:selected-rates:public:';
const CACHE_TTL_MS = 5 * 60 * 1000;
const EXPECTED_MORTECH_BUCKETS = PROGRAM_BUCKETS.length;

function normalizeRates(list: SelectedRateRow[]): SelectedRate[] {
  return list.map((r) => ({
    id: r.id,
    rateData: r.rateData,
    createdAt:
      r.createdAt instanceof Date
        ? r.createdAt.toISOString()
        : String(r.createdAt ?? new Date().toISOString()),
    updatedAt:
      r.updatedAt instanceof Date
        ? r.updatedAt.toISOString()
        : String(r.updatedAt ?? new Date().toISOString()),
  }));
}

function getStoredSelectedRates(uid: string): SelectedRate[] | null {
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
}

function setStoredSelectedRates(uid: string, list: SelectedRate[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      `${PUBLIC_SELECTED_RATES_PREFIX}${uid}`,
      JSON.stringify({ rates: list, fetchedAt: Date.now() }),
    );
  } catch {
    // ignore quota errors
  }
}

function isCacheComplete(list: SelectedRate[], hasMortech: boolean): boolean {
  if (list.length === 0) return false;
  if (!hasMortech) return true;
  const tagged = list.filter((r) => r.rateData?.bucketId).length;
  return tagged >= Math.min(3, EXPECTED_MORTECH_BUCKETS) || list.length >= EXPECTED_MORTECH_BUCKETS;
}

/**
 * TodaysRatesTab - Displays only selected rates from the loan officer
 */
export default function TodaysRatesTab({
  selectedTemplate,
  className = '',
  isPublic = false,
  publicTemplateData,
  userId,
  companyId,
  hasMortechSubscription,
  initialSelectedRates,
}: TodaysRatesTabProps) {
  const { getTemplateSync } = useEfficientTemplates();
  const [, startTransition] = useTransition();

  const templateData =
    isPublic && publicTemplateData ? publicTemplateData : getTemplateSync(selectedTemplate);

  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#01bcc6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
  };

  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 },
  };

  const resolvedHasMortechSubscription = hasMortechSubscription !== false;

  const initialNormalized = useMemo(
    () => (initialSelectedRates?.length ? normalizeRates(initialSelectedRates) : null),
    [initialSelectedRates],
  );

  const [selectedRates, setSelectedRates] = useState<SelectedRate[]>(
    () => initialNormalized ?? [],
  );
  const [isLoading, setIsLoading] = useState(() => !initialNormalized?.length);
  const [error, setError] = useState<string | null>(null);

  const rateProducts = useMemo(
    () =>
      mapRatesToDisplayProducts(selectedRates, {
        hasMortechSubscription: resolvedHasMortechSubscription,
      }),
    [selectedRates, resolvedHasMortechSubscription],
  );

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // SSR already provided fresh rates from the same source the client
    // endpoint uses (getMortechMergedSelectedRatesForDisplay). Skip the client
    // refetch entirely — it only triggers a redundant re-render of every card
    // (time-sliced via startTransition), which on a slow mobile CPU makes the
    // cards visibly re-render in as you scroll. Server data is authoritative on
    // first load.
    if (initialNormalized?.length) {
      setSelectedRates(initialNormalized);
      setIsLoading(false);
      return;
    }

    const stored = getStoredSelectedRates(userId);
    const storedComplete = stored ? isCacheComplete(stored, resolvedHasMortechSubscription) : false;

    if (!initialNormalized?.length && storedComplete) {
      setSelectedRates(stored!);
      setIsLoading(false);
    }

    const fetchSelectedRates = async (silent: boolean) => {
      try {
        if (!silent) {
          setIsLoading(true);
          setError(null);
        }

        const endpoint = resolvedHasMortechSubscription
          ? `/api/officers/selected-rates?officerId=${userId}`
          : `/api/officers/manual-rates?officerId=${userId}`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          if (!silent) {
            const errorResult = await response.json().catch(() => ({ error: 'Unknown error' }));
            setError(errorResult.error || `Failed to load rates (${response.status})`);
            setSelectedRates([]);
          }
          return;
        }

        const result = await response.json();
        if (!result.success) {
          if (!silent) setError(result.error || 'Failed to fetch rates');
          return;
        }

        const list = normalizeRates(result.rates || []);
        startTransition(() => {
          setSelectedRates(list);
          setStoredSelectedRates(userId, list);
        });
      } catch {
        if (!silent) {
          setError('Failed to load rates');
          setSelectedRates([]);
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    };

    const silent =
      !!initialNormalized?.length || (!!stored && storedComplete);
    fetchSelectedRates(silent);
  }, [userId, resolvedHasMortechSubscription, initialNormalized]);

  const showSkeleton = isLoading || (rateProducts.length === 0 && selectedRates.length === 0 && !error);
  const showResults = !showSkeleton && rateProducts.length > 0;

  return (
    <div
      className={`w-full space-y-6 ${className}`}
      style={{
        fontFamily: templateData?.template?.typography?.fontFamily || 'Inter',
        padding: `${layout.padding.medium}px 0`,
      }}
    >
      {error && (
        <div
          className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
          style={{ borderRadius: `${layout.borderRadius}px` }}
        >
          <div className="flex items-center">
            {React.createElement(icons.error, { size: 20, className: 'text-red-500 mr-2' })}
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {showSkeleton && (
        <div
          className="space-y-4"
          style={{
            backgroundColor: colors.background,
            borderRadius: `${layout.borderRadius}px`,
            padding: `${layout.padding.medium}px`,
          }}
        >
          {Array.from({ length: EXPECTED_MORTECH_BUCKETS }, (_, i) => (
            <div
              key={i}
              className="animate-pulse border rounded-lg p-4"
              style={{
                borderColor: colors.border,
                borderRadius: `${layout.borderRadius}px`,
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="h-5 rounded w-3/4" style={{ backgroundColor: colors.border }} />
                <div className="h-5 rounded w-1/2" style={{ backgroundColor: colors.border }} />
                <div className="h-4 rounded w-2/3" style={{ backgroundColor: colors.border }} />
                <div className="h-4 rounded w-1/3" style={{ backgroundColor: colors.border }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!showSkeleton && selectedRates.length === 0 && !error && (
        <div
          className="text-center p-8 rounded-lg"
          style={{
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: `${layout.borderRadius}px`,
            color: colors.textSecondary,
          }}
        >
          <p className="text-base font-medium mb-2" style={{ color: colors.text }}>
            No rates available
          </p>
          <p className="text-sm">Please contact your loan officer for current mortgage rates.</p>
        </div>
      )}

      {showResults && (
        <RateResults
          products={rateProducts}
          loading={false}
          rawData={[]}
          template={selectedTemplate}
          isMockData={false}
          dataSource="todays-rates"
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
          userId={userId}
          companyId={companyId}
          showTodaysRatesOnly={resolvedHasMortechSubscription}
        />
      )}

      <div
        className="text-xs text-center p-4 rounded-lg mt-6"
        style={{
          backgroundColor: colors.background,
          border: `1px solid ${colors.border}`,
          borderRadius: `${layout.borderRadius}px`,
          color: colors.textSecondary,
        }}
      >
        <p>
          Disclosures & Disclaimers: Rates, APRs, and terms are estimates only and subject to change
          without notice. All quotes are based on the data you provided, and additional closing costs
          and fees may apply. This is not a commitment to lend. All loans are subject to final
          underwriting approval and verifications. This is not a &quot;Loan Estimate&quot; as defined
          by the CFPB.
        </p>
      </div>
    </div>
  );
}
