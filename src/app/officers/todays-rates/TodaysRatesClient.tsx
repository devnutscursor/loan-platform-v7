'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useTemplateSelection, useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { DashboardLoadingState } from '@/components/ui/LoadingState';
import { supabase } from '@/lib/supabase/client';
import { icons } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import SpotlightCard from '@/components/ui/SpotlightCard';
import MortgageSearchForm from '@/components/landingPage/MortgageSearchForm';
import RateResults from '@/components/landingPage/RateResults';
import { useNotification } from '@/components/ui/Notification';
import Modal from '@/components/ui/Modal';

interface RateFeeItem {
  description: string;
  amount: number;
  section: string;
  paymentType: string;
  prepaid: boolean;
}

interface Rate {
  id: string;
  lenderName: string;
  loanProgram: string;
  loanType: string;
  loanTerm: number;
  interestRate: number;
  apr: number;
  monthlyPayment: number;
  /**
   * Total of all upfront fees for summary display.
   * Computed from feeItems when available.
   */
  fees: number;
  points: number;
  credits: number;
  lockPeriod: number;
  /**
   * Detailed itemized fee breakdown from Mortech.
   */
  feeItems?: RateFeeItem[];
  searchParams?: {
    purchasePrice?: number;
    downPayment?: number;
    loanAmount: number;
    creditScore: string;
    loanPurpose: 'Purchase' | 'Refinance';
  };
  [key: string]: any;
}

interface SelectedRate {
  id: string;
  rateData: Rate;
  createdAt: string;
  updatedAt: string;
}

interface ManualRate {
  id: string;
  rateData: Rate;
  createdAt: string;
  updatedAt: string;
}

interface SearchFormData {
  zipCode: string;
  salesPrice: string;
  downPayment: string;
  downPaymentPercent: string;
  creditScore: string;
  propertyType: string;
  occupancy: string;
  loanType: string;
  loanTerm: string;
  eligibleForLowerRate: boolean;
  loanPurpose: string;
  homeValue: string;
  mortgageBalance: string;
  cashOut: string;
  ltv: string;
  firstName: string;
  lastName: string;
  vaFirstTimeUse: boolean;
  firstTimeHomeBuyer: boolean;
  monthsReserves: number;
  selfEmployed: boolean;
  waiveEscrows: boolean;
  county: string;
  state: string;
  numberOfStories: number;
  numberOfUnits: string;
  lienType: string;
  borrowerPaidMI: string;
  baseLoanAmount: number;
  loanLevelDebtToIncomeRatio: number;
  totalMonthlyQualifyingIncome: number;
  waiveEscrow: boolean;
  militaryVeteran: boolean;
  lockDays: string;
  secondMortgageAmount: string;
  amortizationTypes: string[];
  armFixedTerms: string[];
  loanTerms: string[];
  productCategory?: string;
}

type TabType = 'search' | 'selected';

export type TodaysRatesClientProps = {
  initialProductCategoryOptions?: { value: string; label: string }[];
};

export default function TodaysRatesClient({ initialProductCategoryOptions }: TodaysRatesClientProps = {}) {
  const { user, companyId, loading: authLoading } = useAuth();
  const { selectedTemplate } = useTemplateSelection();
  const { getTemplateSync } = useEfficientTemplates();
  const router = useRouter();
  const { showNotification } = useNotification();
  
  // Get template data for colors and layout
  const templateData = getTemplateSync(selectedTemplate || 'template1');
  const templateColors = templateData?.template?.colors || {
    primary: '#111827',
    secondary: '#111827',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  const templateLayout = templateData?.template?.layout || {
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24 },
    spacing: 16
  };

  useEffect(() => {
    if (!companyId) return;
    const loadCompanyAccess = async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('has_mortech_subscription')
        .eq('id', companyId)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setHasMortechSubscription(data.has_mortech_subscription !== false);
      }
    };
    loadCompanyAccess();
  }, [companyId]);

  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [loading, setLoading] = useState(false);
  const [loadingSelectedRates, setLoadingSelectedRates] = useState(false);
  const [loadingManualRates, setLoadingManualRates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rates, setRates] = useState<Rate[]>([]);
  const [selectedRates, setSelectedRates] = useState<SelectedRate[]>([]);
  const [manualRates, setManualRates] = useState<ManualRate[]>([]);
  const [rateLimit, setRateLimit] = useState<{ remaining: number; resetAt: Date; used: number } | null>(null);
  const [hasMortechSubscription, setHasMortechSubscription] = useState(true);
  
  // Current search parameters state
  const [currentSearchParams, setCurrentSearchParams] = useState<{
    purchasePrice?: number;
    downPayment?: number;
    loanAmount: number;
    creditScore: string;
    loanPurpose: 'Purchase' | 'Refinance';
  } | null>(null);
  
  // Confirmation modal states
  const [showSelectConfirm, setShowSelectConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showManualRateModal, setShowManualRateModal] = useState(false);
  const [rateToSelect, setRateToSelect] = useState<Rate | null>(null);
  const [rateToRemove, setRateToRemove] = useState<SelectedRate | null>(null);
  const [rateToView, setRateToView] = useState<Rate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingManualRate, setIsSavingManualRate] = useState(false);

  const [manualRateForm, setManualRateForm] = useState({
    lenderName: '',
    loanProgram: '',
    loanType: '',
    loanTerm: '',
    interestRate: '',
    apr: '',
    executionPrice: '',
    monthlyPayment: '',
    fees: '',
    points: '',
    credits: '',
    lockPeriod: '',
  });
  const [manualFeeItems, setManualFeeItems] = useState<RateFeeItem[]>([]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const updateManualField = useCallback(
    (field: keyof typeof manualRateForm) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setManualRateForm((prev) => ({ ...prev, [field]: event.target.value }));
      },
    [],
  );

  const addFeeItem = useCallback(() => {
    setManualFeeItems((prev) => [
      ...prev,
      { description: '', amount: 0, section: '', paymentType: '', prepaid: false },
    ]);
  }, []);

  const updateFeeItem = useCallback(
    (index: number, field: keyof RateFeeItem, value: string | boolean) => {
      setManualFeeItems((prev) => {
        const next = [...prev];
        const item = { ...next[index] };
        if (field === 'amount') {
          const parsed = parseFloat(String(value));
          item.amount = Number.isFinite(parsed) ? parsed : 0;
        } else if (field === 'prepaid') {
          item.prepaid = Boolean(value);
        } else if (field === 'description') {
          item.description = String(value);
        } else if (field === 'section') {
          item.section = String(value);
        } else if (field === 'paymentType') {
          item.paymentType = String(value);
        }
        next[index] = item;
        return next;
      });
    },
    [],
  );

  const removeFeeItem = useCallback((index: number) => {
    setManualFeeItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Map property type from form to Mortech numeric proptype code
  const mapPropertyType = (type: string): number => {
    const mapping: Record<string, number> = {
      // 0 = 1 unit
      SingleFamily: 0,
      '1Unit': 0,
      // 1 = 2 unit
      '2Unit': 1,
      // 2 = 3 unit
      '3Unit': 2,
      // 3 = 4 unit
      '4Unit': 3,
      MultiFamily: 3,
      // 4 = Co-op
      Coop: 4,
      // 5 = Manufactured home
      Manufactured: 5,
      // 6 = Warrantable condo < 5 stories
      AttachedCondo: 6,
      Condo: 6,
      // 15 = Townhome
      Townhouse: 15,
      // 20 = Detached condo
      DetachedCondo: 20,
    };
    return mapping[type] ?? 0;
  };

  // Map occupancy from form to Mortech numeric occupancy code
  const mapOccupancy = (occ: string): number => {
    let normalized = occ;
    if (normalized === 'PrimaryResidence') normalized = 'Primary';
    if (normalized === 'SecondHome') normalized = 'Secondary';

    const mapping: Record<string, number> = {
      // 0 = Owner occupied (Primary)
      Primary: 0,
      // 2 = Second home
      Secondary: 2,
      // 1 = Non-owner occupied (Investment)
      Investment: 1,
    };
    return mapping[normalized] ?? 0;
  };

  // Normalize loan term to Mortech format
  const normalizeLoanTerm = (term: string): string => {
    if (!term) return '30 year fixed';
    if (term.includes('year fixed')) return term;
    return `${term} year fixed`;
  };

  // Map credit score from form to numeric value
  const mapCreditScore = (creditScore: string): number => {
    if (creditScore.includes('+')) {
      return parseInt(creditScore.replace('+', '')) || 800;
    }
    if (creditScore.includes('-')) {
      const parts = creditScore.split('-');
      return parseInt(parts[0]) || 740;
    }
    return parseInt(creditScore) || 740;
  };

  const SELECTED_RATES_STORAGE_PREFIX = 'lo:selected-rates:';
  const SELECTED_RATES_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    if (!hasMortechSubscription) {
      setActiveTab('selected');
    }
  }, [hasMortechSubscription]);

  const getStoredSelectedRates = (): SelectedRate[] | null => {
    if (typeof window === 'undefined' || !user?.id) return null;
    try {
      const raw = localStorage.getItem(`${SELECTED_RATES_STORAGE_PREFIX}${user.id}`);
      if (!raw) return null;
      const { rates: stored, fetchedAt } = JSON.parse(raw);
      if (!Array.isArray(stored) || typeof fetchedAt !== 'number') return null;
      if (Date.now() - fetchedAt > SELECTED_RATES_CACHE_TTL_MS) return null;
      return stored as SelectedRate[];
    } catch {
      return null;
    }
  };

  const setStoredSelectedRates = (list: SelectedRate[]) => {
    if (typeof window === 'undefined' || !user?.id) return;
    try {
      localStorage.setItem(
        `${SELECTED_RATES_STORAGE_PREFIX}${user.id}`,
        JSON.stringify({ rates: list, fetchedAt: Date.now() })
      );
    } catch {
      // ignore
    }
  };

  // Fetch selected rates (silent = true skips loading state for background revalidate)
  const fetchSelectedRates = useCallback(
    async (silent = false) => {
      if (!user?.id) return;

      try {
        if (!silent) setLoadingSelectedRates(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          if (!silent) setLoadingSelectedRates(false);
          return;
        }

        const response = await fetch('/api/officers/selected-rates', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const list = (result.rates || []) as SelectedRate[];
            setSelectedRates(list);
            setStoredSelectedRates(list);
          }
        }
      } catch (err) {
        console.error('Error fetching selected rates:', err);
      } finally {
        if (!silent) setLoadingSelectedRates(false);
      }
    },
    [user?.id],
  );

  const fetchManualRates = useCallback(
    async () => {
      if (!user?.id || hasMortechSubscription) return;
      setLoadingManualRates(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setLoadingManualRates(false);
          return;
        }

        const response = await fetch('/api/officers/manual-rates', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setManualRates(result.rates || []);
          }
        }
      } catch (err) {
        console.error('Error fetching manual rates:', err);
      } finally {
        setLoadingManualRates(false);
      }
    },
    [hasMortechSubscription, user?.id],
  );

  // Fetch selected rates on mount and when tab changes; hydrate from cache first
  useEffect(() => {
    if (!user?.id) return;

    const stored = getStoredSelectedRates();
    if (stored && stored.length >= 0) {
      setSelectedRates(stored);
      setLoadingSelectedRates(false);
    }

    if (hasMortechSubscription) {
      fetchSelectedRates(!!stored);
    }
  }, [activeTab, fetchSelectedRates, hasMortechSubscription, user?.id]);

  useEffect(() => {
    if (!hasMortechSubscription) {
      fetchManualRates();
    }
  }, [fetchManualRates, hasMortechSubscription]);

  // Handle search form updates
  const handleSearchFormUpdate = useCallback(async (formData: SearchFormData, email?: string) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      let propertyValue: number;
      let calculatedLoanAmount: number;
      let purchasePrice: number | undefined;
      let downPayment: number | undefined;

      if (formData.loanPurpose === 'Refinance') {
        const mortgageBalance = parseFloat(formData.mortgageBalance || '0');
        calculatedLoanAmount = mortgageBalance;
        propertyValue = calculatedLoanAmount;
        // For refinance, don't set purchasePrice or downPayment
      } else {
        const salesPrice = parseFloat(formData.salesPrice || '0');
        const calculatedDownPayment = parseFloat(formData.downPayment || '0');
        calculatedLoanAmount = salesPrice - calculatedDownPayment;
        propertyValue = salesPrice;
        purchasePrice = salesPrice;
        downPayment = calculatedDownPayment;
      }

      // Store current search parameters for rate selection
      setCurrentSearchParams({
        purchasePrice,
        downPayment,
        loanAmount: calculatedLoanAmount,
        creditScore: formData.creditScore, // Keep original string format (range)
        loanPurpose: formData.loanPurpose as 'Purchase' | 'Refinance',
      });

      const request: any = {
        propertyZip: formData.zipCode || '95825',
        appraisedvalue: propertyValue,
        loan_amount: calculatedLoanAmount,
        fico: mapCreditScore(formData.creditScore),
        loanpurpose: formData.loanPurpose as 'Purchase' | 'Refinance',
        // Numeric codes per Mortech 3rd Party guide
        proptype: mapPropertyType(formData.propertyType),
        occupancy: mapOccupancy(formData.occupancy),
        loanProduct1: normalizeLoanTerm(formData.loanTerm || '30')
      };

      if (formData.waiveEscrow === true) {
        request.waiveEscrow = true;
      }
      if (formData.militaryVeteran === true) {
        request.militaryVeteran = true;
        // Pass VA first-time use flag so server can derive vaType/subsequentUse
        request.vaFirstTimeUse = formData.vaFirstTimeUse;
      }
      if (formData.lockDays && formData.lockDays !== '') {
        request.lockDays = formData.lockDays;
      }
      if (formData.secondMortgageAmount && formData.secondMortgageAmount !== '0' && formData.secondMortgageAmount !== '') {
        const amount = parseInt(formData.secondMortgageAmount);
        if (!isNaN(amount) && amount > 0) {
          request.secondMortgageAmount = amount;
        }
      }

      // Optional: product category selected from catalog (maps to Mortech productList on the server)
      if (formData.productCategory) {
        request.productCategory = formData.productCategory;
      }

      const response = await fetch('/api/mortech/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(`Rate limit exceeded. You have ${result.rateLimit?.remaining || 0} searches remaining. Limit resets at ${new Date(result.rateLimit?.resetAt).toLocaleString()}`);
          setRateLimit(result.rateLimit);
        } else {
          setError(result.error || 'Failed to fetch rates');
        }
        setRates([]);
        setLoading(false);
        return;
      }

      if (result.success && result.rates) {
        // Clear dev console and log executionPrice (Mortech ratesheet_price) for debugging
        if (typeof window !== 'undefined') {
          console.clear();
          console.log('🔍 Today\'s Rates - Mortech execution prices (ratesheet_price) for current search:', {
            searchParams: request,
            samples: result.rates.slice(0, 10).map((rate: any) => ({
              lenderName: rate.lenderName || rate.vendorName,
              loanProgram: rate.loanProgram || rate.productDesc,
              interestRate: rate.interestRate || rate.rate,
              executionPrice: rate.executionPrice,
              points: rate.points,
            })),
          });
        }

        const transformedRates: Rate[] = result.rates.map((rate: any) => {
          const feeItems: RateFeeItem[] = Array.isArray(rate.fees)
            ? rate.fees.map((f: any) => ({
                description: f.description,
                amount:
                  typeof f.amount === 'number'
                    ? f.amount
                    : typeof f.feeamount === 'number'
                      ? f.feeamount
                      : parseFloat(f.amount ?? f.feeamount ?? '0') || 0,
                section: f.section,
                paymentType: f.paymentType,
                prepaid: !!f.prepaid,
              }))
            : [];

          const totalFees = feeItems.reduce(
            (sum, f) => sum + (Number.isFinite(f.amount) ? f.amount : 0),
            0,
          );

          return {
            id: rate.id || rate.productId,
            lenderName: rate.lenderName || rate.vendorName,
            loanProgram: rate.loanProgram || rate.productDesc,
            loanType: rate.loanType || rate.termType,
            loanTerm: rate.loanTerm || rate.productTerm,
            interestRate: rate.interestRate || rate.rate,
            apr: rate.apr,
            monthlyPayment: rate.monthlyPayment,
            fees: totalFees,
            points: rate.points || 0,
            credits: rate.credits || 0,
            lockPeriod: rate.lockPeriod || rate.lockTerm || 30,
            feeItems,
            // Preserve the original quote data for any future needs
            ...rate,
          };
        });

        setRates(transformedRates);
        setRateLimit(result.rateLimit || null);
      } else {
        setError('No rates returned from API');
        setRates([]);
      }
    } catch (err) {
      console.error('Error fetching rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
      setRates([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Handle opening select confirmation
  const handleSelectRateClick = useCallback((rate: Rate) => {
    // Attach current search parameters to the rate
    const rateWithSearchParams: Rate = {
      ...rate,
      searchParams: currentSearchParams || undefined,
    };
    setRateToSelect(rateWithSearchParams);
    setShowSelectConfirm(true);
  }, [currentSearchParams]);

  // Handle confirming rate selection
  const handleSelectRate = useCallback(async () => {
    if (!user?.id || !rateToSelect) return;

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Not authenticated',
        });
        setShowSelectConfirm(false);
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/officers/selected-rates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          rateData: rateToSelect,
          searchParams: rateToSelect.searchParams 
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Rate selected successfully',
        });
        // Refresh selected rates to update UI
        fetchSelectedRates();
        setShowSelectConfirm(false);
        setRateToSelect(null);
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to select rate',
        });
      }
    } catch (err) {
      console.error('Error selecting rate:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to select rate',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, rateToSelect, fetchSelectedRates, showNotification]);

  // Handle opening remove confirmation
  const handleRemoveRateClick = useCallback((selectedRate: SelectedRate) => {
    setRateToRemove(selectedRate);
    setShowRemoveConfirm(true);
  }, []);

  const handleViewDetailsClick = useCallback((rate: Rate) => {
    const rateWithSearchParams: Rate = {
      ...rate,
      searchParams: rate.searchParams ?? currentSearchParams ?? undefined,
    };
    setRateToView(rateWithSearchParams);
    setShowDetailsModal(true);
  }, [currentSearchParams]);

  // Handle confirming rate removal
  const handleRemoveRate = useCallback(async () => {
    if (!user?.id || !rateToRemove) return;

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Not authenticated',
        });
        setShowRemoveConfirm(false);
        setIsProcessing(false);
        return;
      }

      const response = await fetch(`/api/officers/selected-rates/${rateToRemove.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Rate removed successfully',
        });
        fetchSelectedRates();
        setShowRemoveConfirm(false);
        setRateToRemove(null);
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to remove rate',
        });
      }
    } catch (err) {
      console.error('Error removing rate:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove rate',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, rateToRemove, fetchSelectedRates, showNotification]);

  const handleSaveManualRate = useCallback(async () => {
    if (!user?.id) return;

    const requiredFields = [
      'lenderName',
      'loanProgram',
      'loanType',
      'loanTerm',
      'interestRate',
      'apr',
      'monthlyPayment',
      'fees',
      'points',
      'credits',
      'lockPeriod',
    ];

    for (const field of requiredFields) {
      if (!manualRateForm[field as keyof typeof manualRateForm]) {
        showNotification({
          type: 'error',
          title: 'Missing field',
          message: `Please fill ${field}`,
        });
        return;
      }
    }

    const toNumber = (value: string) => {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : NaN;
    };

    const ratePayload: Rate = {
      id: crypto.randomUUID(),
      lenderName: manualRateForm.lenderName.trim(),
      loanProgram: manualRateForm.loanProgram.trim(),
      loanType: manualRateForm.loanType.trim(),
      loanTerm: Number(manualRateForm.loanTerm),
      interestRate: toNumber(manualRateForm.interestRate),
      apr: toNumber(manualRateForm.apr),
      executionPrice: manualRateForm.executionPrice ? toNumber(manualRateForm.executionPrice) : undefined,
      monthlyPayment: toNumber(manualRateForm.monthlyPayment),
      fees: toNumber(manualRateForm.fees),
      points: toNumber(manualRateForm.points),
      credits: toNumber(manualRateForm.credits),
      lockPeriod: Number(manualRateForm.lockPeriod),
      feeItems: manualFeeItems,
    };

    if (!Number.isFinite(ratePayload.loanTerm) || !Number.isFinite(ratePayload.lockPeriod)) {
      showNotification({
        type: 'error',
        title: 'Invalid number',
        message: 'Loan term and lock period must be valid numbers',
      });
      return;
    }

    const numericFields: Array<[string, number | undefined]> = [
      ['interestRate', ratePayload.interestRate],
      ['apr', ratePayload.apr],
      ['monthlyPayment', ratePayload.monthlyPayment],
      ['fees', ratePayload.fees],
      ['points', ratePayload.points],
      ['credits', ratePayload.credits],
    ];
    for (const [label, value] of numericFields) {
      if (!Number.isFinite(value)) {
        showNotification({
          type: 'error',
          title: 'Invalid number',
          message: `${label} must be a valid number`,
        });
        return;
      }
    }

    setIsSavingManualRate(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Not authenticated',
        });
        return;
      }

      const response = await fetch('/api/officers/manual-rates', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rateData: ratePayload }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showNotification({
          type: 'success',
          title: 'Saved',
          message: 'Manual rate added successfully',
        });
        setManualRateForm({
          lenderName: '',
          loanProgram: '',
          loanType: '',
          loanTerm: '',
          interestRate: '',
          apr: '',
          executionPrice: '',
          monthlyPayment: '',
          fees: '',
          points: '',
          credits: '',
          lockPeriod: '',
        });
        setManualFeeItems([]);
        setShowManualRateModal(false);
        fetchManualRates();
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to save manual rate',
        });
      }
    } catch (err) {
      console.error('Error saving manual rate:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save manual rate',
      });
    } finally {
      setIsSavingManualRate(false);
    }
  }, [fetchManualRates, manualFeeItems, manualRateForm, showNotification, user?.id]);

  const handleDeleteManualRate = useCallback(async (rateId: string) => {
    if (!user?.id) return;
    const confirmed = window.confirm('Delete this manual rate?');
    if (!confirmed) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Not authenticated',
        });
        return;
      }

      const response = await fetch('/api/officers/manual-rates', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: rateId }),
      });

      if (response.ok) {
        fetchManualRates();
      } else {
        const result = await response.json();
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to delete manual rate',
        });
      }
    } catch (err) {
      console.error('Error deleting manual rate:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete manual rate',
      });
    }
  }, [fetchManualRates, showNotification, user?.id]);

  // Check if a rate is already selected
  const isRateSelected = useCallback((rate: Rate): boolean => {
    if (!selectedRates.length) return false;
    
    // Compare multiple fields to uniquely identify a rate
    // since multiple rates can have the same productId
    return selectedRates.some((selectedRate) => {
      const selected = selectedRate.rateData;
      if (!selected) return false;
      
      // Match by ID first, then verify with other unique fields
      const idMatch = selected.id === rate.id || selected.productId === rate.id;
      if (!idMatch) return false;
      
      // Verify it's the same rate by comparing unique characteristics
      return (
        Math.abs((selected.interestRate || 0) - (rate.interestRate || 0)) < 0.001 &&
        Math.abs((selected.apr || 0) - (rate.apr || 0)) < 0.001 &&
        Math.abs((selected.monthlyPayment || 0) - (rate.monthlyPayment || 0)) < 0.01
      );
    });
  }, [selectedRates]);

  // Transform rates to RateResults format
  const transformRatesToRateResults = (rates: Rate[]) => {
    return rates.map(rate => ({
      id: rate.id,
      lenderName: rate.lenderName,
      loanProgram: rate.loanProgram,
      loanType: rate.loanType,
      loanTerm: rate.loanTerm,
      interestRate: rate.interestRate,
      apr: rate.apr,
      monthlyPayment: rate.monthlyPayment,
      fees: rate.fees,
      points: rate.points,
      credits: rate.credits,
      lockPeriod: rate.lockPeriod
    }));
  };

  if (authLoading) {
    return (
      <RouteGuard allowedRoles={['employee']}>
        <DashboardLayout>
          <DashboardLoadingState />
        </DashboardLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['employee']}>
      <DashboardLayout
        showBreadcrumb={true}
        breadcrumbVariant="default"
        breadcrumbSize="md"
        customBreadcrumbItems={[
          {
            label: 'Dashboard',
            href: '/officers/dashboard',
            icon: 'home' as keyof typeof icons
          },
          {
            label: "Today's Rates",
            href: '/officers/todays-rates',
            icon: 'trendingUp' as keyof typeof icons
          }
        ]}
      >
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-[#005b7c] mb-2">
              Today's Rates Management
            </h1>
            <p className="text-gray-600">
              {hasMortechSubscription
                ? 'Search for rates and select which ones to display on your public profile'
                : 'Add manual rates to display on your public profile'}
            </p>
          </div>

          {/* Tabs - use app greenish on officers dashboard (template colors only on public profile & customizer) */}
          <div 
            className="toggle-switch relative inline-flex p-1 mb-4"
            style={{
              backgroundColor: '#e5e7eb',
              borderRadius: `${templateLayout.borderRadius}px`,
              width: 'fit-content'
            }}
          >
            {hasMortechSubscription && (
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`relative z-10 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === 'search' ? 'text-white' : 'text-gray-600'
                }`}
                style={{
                  borderRadius: `${templateLayout.borderRadius}px`,
                  backgroundColor: activeTab === 'search' ? '#005b7c' : 'transparent'
                }}
              >
                Search Rates
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('selected')}
              className={`relative z-10 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === 'selected' ? 'text-white' : 'text-gray-600'
              }`}
              style={{
                borderRadius: `${templateLayout.borderRadius}px`,
                backgroundColor: activeTab === 'selected' ? '#005b7c' : 'transparent'
              }}
            >
              {hasMortechSubscription ? 'Selected Rates' : 'Manual Rates'}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'search' && hasMortechSubscription && (
            <div className="space-y-6">

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    {React.createElement(icons.error, { size: 20, className: "text-red-500 mr-2" })}
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {/* Search Form */}
              <SpotlightCard variant="default" className="p-6 pb-24">
                <MortgageSearchForm
                  onSearch={handleSearchFormUpdate}
                  loading={loading}
                  template={selectedTemplate as 'template1' | 'template2'}
                  isPublic={false}
                  useAppTheme={true}
                  initialProductCategoryOptions={initialProductCategoryOptions}
                />
              </SpotlightCard>

              {/* Loading Skeleton */}
              {loading && rates.length === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((index) => (
                      <SpotlightCard key={index} variant="default" className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="h-3 w-20 mb-2 bg-gray-200 rounded animate-pulse" />
                              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div>
                              <div className="h-3 w-20 mb-2 bg-gray-200 rounded animate-pulse" />
                              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div>
                              <div className="h-3 w-16 mb-2 bg-gray-200 rounded animate-pulse" />
                              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div>
                              <div className="h-3 w-24 mb-2 bg-gray-200 rounded animate-pulse" />
                              <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
                            </div>
                          </div>
                          <div className="w-full md:w-auto">
                            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>
                </div>
              )}

              {/* Rate Results with Select Buttons */}
              {!loading && rates.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
                  <div className="space-y-4">
                    {rates.map((rate, index) => (
                      <SpotlightCard key={`${rate.id}-${index}-${rate.interestRate}-${rate.apr}`} variant="default" className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Loan Program</p>
                              <p className="text-sm font-medium dark:text-gray-900">{rate.loanProgram}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Interest Rate</p>
                              <p className="text-sm font-medium dark:text-gray-900">{rate.interestRate.toFixed(3)}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">APR</p>
                              <p className="text-sm font-medium dark:text-gray-900">{rate.apr.toFixed(3)}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">P&I</p>
                              <p className="text-sm font-medium dark:text-gray-900">${rate.monthlyPayment.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 sm:min-w-0">
                            <Button
                              variant={"primary"}
                              onClick={() => handleSelectRateClick(rate)}
                              disabled={isRateSelected(rate)}
                              className="w-full sm:w-auto sm:min-w-[160px]"
                            >
                              {isRateSelected(rate) ? 'Already Selected' : 'Select Rate'}
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => handleViewDetailsClick(rate)}
                              className="w-full sm:w-auto sm:min-w-[110px]"
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'selected' && (
            <div className="space-y-4">
              {!hasMortechSubscription && (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Manual Rates</h3>
                    <p className="text-sm text-gray-600">Add rates manually for your public profile.</p>
                  </div>
                  <Button variant="primary" onClick={() => setShowManualRateModal(true)}>
                    Add Rates
                  </Button>
                </div>
              )}

              {!hasMortechSubscription && loadingManualRates && (
                <SpotlightCard variant="default" className="p-6 text-center">
                  <p className="text-gray-500">Loading manual rates...</p>
                </SpotlightCard>
              )}

              {!hasMortechSubscription && !loadingManualRates && manualRates.length === 0 && (
                <SpotlightCard variant="default" className="p-8 text-center">
                  <p className="text-gray-500">No manual rates yet. Click “Add Rates” to create one.</p>
                </SpotlightCard>
              )}

              {!hasMortechSubscription && !loadingManualRates && manualRates.length > 0 && (
                <div className="space-y-4">
                  {manualRates.map((manualRate) => {
                    const rate = manualRate.rateData;
                    return (
                      <SpotlightCard key={manualRate.id} variant="default" className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div>
                                <p className="text-xs text-gray-500">Loan Program</p>
                                <p className="text-sm font-medium dark:text-gray-900">{rate.loanProgram}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Interest Rate</p>
                                <p className="text-sm font-medium dark:text-gray-900">{rate.interestRate.toFixed(3)}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">APR</p>
                                <p className="text-sm font-medium dark:text-gray-900">{rate.apr.toFixed(3)}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">P&I</p>
                                <p className="text-sm font-medium dark:text-gray-900">${rate.monthlyPayment.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 sm:min-w-0">
                            <Button
                              variant="secondary"
                              onClick={() => handleViewDetailsClick(rate as Rate)}
                              className="w-full sm:w-auto sm:min-w-[110px]"
                            >
                              Details
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleDeleteManualRate(manualRate.id)}
                              className="w-full sm:w-auto sm:min-w-[110px]"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </SpotlightCard>
                    );
                  })}
                </div>
              )}

              {/* Loading Skeleton for Selected Rates */}
              {hasMortechSubscription && loadingSelectedRates && (
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <SpotlightCard key={`skeleton-${index}`} variant="default" className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="h-3 w-20 mb-2 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                          </div>
                          <div>
                            <div className="h-3 w-20 mb-2 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                          </div>
                          <div>
                            <div className="h-3 w-16 mb-2 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                          </div>
                          <div>
                            <div className="h-3 w-24 mb-2 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="w-full md:w-auto">
                          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {hasMortechSubscription && !loadingSelectedRates && selectedRates.length === 0 && (
                <SpotlightCard variant="default" className="p-8 text-center">
                  <p className="text-gray-500">No rates selected yet. Search for rates and select them to display on your public profile.</p>
                </SpotlightCard>
              )}

              {/* Selected Rates List */}
              {hasMortechSubscription && !loadingSelectedRates && selectedRates.length > 0 && (
                <div className="space-y-4">
                  {selectedRates.map((selectedRate) => {
                    const rate = selectedRate.rateData;
                    const searchParams = rate.searchParams;
                    const formatCurrency = (amount: number) => {
                      return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(amount);
                    };
                    return (
                      <SpotlightCard key={selectedRate.id} variant="default" className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div>
                                <p className="text-xs text-gray-500">Loan Program</p>
                                <p className="text-sm font-medium dark:text-gray-900">{rate.loanProgram}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Interest Rate</p>
                                <p className="text-sm font-medium dark:text-gray-900">{rate.interestRate.toFixed(3)}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">APR</p>
                                <p className="text-sm font-medium dark:text-gray-900">{rate.apr.toFixed(3)}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">P&I</p>
                                <p className="text-sm font-medium dark:text-gray-900">${rate.monthlyPayment.toLocaleString()}</p>
                              </div>
                            </div>
                            {/* Search Parameters */}
                            {searchParams && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                  {searchParams.loanPurpose === 'Purchase' && searchParams.purchasePrice !== undefined && (
                                    <div>
                                      <span className="text-gray-500">Purchase Price: </span>
                                      <span className="font-medium text-gray-700">
                                        {formatCurrency(searchParams.purchasePrice)}
                                      </span>
                                    </div>
                                  )}
                                  {searchParams.loanPurpose === 'Purchase' && searchParams.downPayment !== undefined && (
                                    <div>
                                      <span className="text-gray-500">Down Payment: </span>
                                      <span className="font-medium text-gray-700">
                                        {formatCurrency(searchParams.downPayment)}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-gray-500">Loan Amount: </span>
                                    <span className="font-medium text-gray-700">
                                      {formatCurrency(searchParams.loanAmount)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Credit Score: </span>
                                    <span className="font-medium text-gray-700">
                                      {searchParams.creditScore}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 sm:min-w-0">
                            <Button
                              variant="secondary"
                              onClick={() => handleViewDetailsClick(rate as Rate)}
                              className="w-full sm:w-auto sm:min-w-[110px]"
                            >
                              Details
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleRemoveRateClick(selectedRate)}
                              className="w-full sm:w-auto sm:min-w-[110px]"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </SpotlightCard>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Manual Rate Modal */}
      <Modal
        isOpen={showManualRateModal}
        onClose={() => {
          if (!isSavingManualRate) {
            setShowManualRateModal(false);
          }
        }}
        title="Add Manual Rate"
        className="max-w-4xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Lender Name</label>
              <input
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                value={manualRateForm.lenderName}
                onChange={updateManualField('lenderName')}
                placeholder="Lender"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Loan Program</label>
              <input
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                value={manualRateForm.loanProgram}
                onChange={updateManualField('loanProgram')}
                placeholder="30 Year Fixed"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Loan Type</label>
              <input
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                value={manualRateForm.loanType}
                onChange={updateManualField('loanType')}
                placeholder="Conventional"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Loan Term (years)</label>
              <input
                type="number"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                value={manualRateForm.loanTerm}
                onChange={updateManualField('loanTerm')}
                placeholder="30"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Interest Rate (%)</label>
              <input
                type="number"
                step="0.001"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                value={manualRateForm.interestRate}
                onChange={updateManualField('interestRate')}
                placeholder="6.125"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">APR (%)</label>
              <input
                type="number"
                step="0.001"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                value={manualRateForm.apr}
                onChange={updateManualField('apr')}
                placeholder="6.250"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Execution Price</label>
              <input
                type="number"
                step="0.001"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                value={manualRateForm.executionPrice}
                onChange={updateManualField('executionPrice')}
                placeholder="100.000"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Monthly Payment (P&I)</label>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                value={manualRateForm.monthlyPayment}
                onChange={updateManualField('monthlyPayment')}
                placeholder="2150"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Total Fees</label>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                value={manualRateForm.fees}
                onChange={updateManualField('fees')}
                placeholder="2200"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Points</label>
              <input
                type="number"
                step="0.001"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                value={manualRateForm.points}
                onChange={updateManualField('points')}
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Credits</label>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                value={manualRateForm.credits}
                onChange={updateManualField('credits')}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Lock Period (days)</label>
              <input
                type="number"
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                value={manualRateForm.lockPeriod}
                onChange={updateManualField('lockPeriod')}
                placeholder="30"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Itemized Fees</h4>
              <Button variant="secondary" onClick={addFeeItem}>
                Add Fee Item
              </Button>
            </div>
            {manualFeeItems.length === 0 && (
              <p className="text-sm text-gray-500">No fee items added.</p>
            )}
            {manualFeeItems.map((fee, index) => (
              <div key={`fee-${index}`} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-600">Description</label>
                  <input
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                    value={fee.description}
                    onChange={(e) => updateFeeItem(index, 'description', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Section</label>
                  <input
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                    value={fee.section}
                    onChange={(e) => updateFeeItem(index, 'section', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Payment Type</label>
                  <input
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                    value={fee.paymentType}
                    onChange={(e) => updateFeeItem(index, 'paymentType', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
                    value={fee.amount}
                    onChange={(e) => updateFeeItem(index, 'amount', e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">Prepaid</label>
                  <input
                    type="checkbox"
                    checked={fee.prepaid}
                    onChange={(e) => updateFeeItem(index, 'prepaid', e.target.checked)}
                  />
                  <Button variant="danger" onClick={() => removeFeeItem(index)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowManualRateModal(false)} disabled={isSavingManualRate}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveManualRate} disabled={isSavingManualRate}>
              {isSavingManualRate ? 'Saving...' : 'Save Rate'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Select Rate Confirmation Modal */}
      <Modal
        isOpen={showSelectConfirm}
        onClose={() => {
          if (!isProcessing) {
            setShowSelectConfirm(false);
            setRateToSelect(null);
          }
        }}
        title="Confirm Rate Selection"
      >
        {rateToSelect && (
          <div className="space-y-4">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01bcc6] mb-4"></div>
                <p className="text-gray-600">Selecting rate...</p>
              </div>
            ) : (
              <>
                <p className="text-gray-700">
                  Are you sure you want to select this rate for display on your public profile?
                </p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Loan Program:</span>
                    <span className="text-sm font-medium">{rateToSelect.loanProgram}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Interest Rate:</span>
                    <span className="text-sm font-medium">{rateToSelect.interestRate.toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">APR:</span>
                    <span className="text-sm font-medium">{rateToSelect.apr.toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">P&I:</span>
                    <span className="text-sm font-medium">${rateToSelect.monthlyPayment.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="primary"
                    onClick={handleSelectRate}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowSelectConfirm(false);
                      setRateToSelect(null);
                    }}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Remove Rate Confirmation Modal */}
      <Modal
        isOpen={showRemoveConfirm}
        onClose={() => {
          if (!isProcessing) {
            setShowRemoveConfirm(false);
            setRateToRemove(null);
          }
        }}
        title="Confirm Rate Removal"
      >
        {rateToRemove && (
          <div className="space-y-4">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01bcc6] mb-4"></div>
                <p className="text-gray-600">Removing rate...</p>
              </div>
            ) : (
              <>
                <p className="text-gray-700">
                  Are you sure you want to remove this rate from your selected rates? This will remove it from your public profile.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Loan Program:</span>
                    <span className="text-sm font-medium">{rateToRemove.rateData.loanProgram}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Interest Rate:</span>
                    <span className="text-sm font-medium">{rateToRemove.rateData.interestRate.toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">APR:</span>
                    <span className="text-sm font-medium">{rateToRemove.rateData.apr.toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">P&I:</span>
                    <span className="text-sm font-medium">${rateToRemove.rateData.monthlyPayment.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="danger"
                    onClick={handleRemoveRate}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    Remove
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowRemoveConfirm(false);
                      setRateToRemove(null);
                    }}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Rate Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setRateToView(null);
        }}
        title="Rate Details"
        className="max-w-3xl"
      >
        {rateToView && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Lender</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.lenderName}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Loan Program</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.loanProgram}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Loan Type</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.loanType}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Loan Term</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.loanTerm} years</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Lock Period</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.lockPeriod} days</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-3">Financial Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Interest Rate</span>
                    <span className="font-semibold text-right" style={{ color: templateColors.primary }}>
                      {rateToView.interestRate.toFixed(3)}%
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">APR</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.apr.toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">P&I</span>
                    <span className="font-semibold text-right">{formatCurrency(rateToView.monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Fees</span>
                    <span className="font-medium text-gray-900 text-right">{formatCurrency(rateToView.fees)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Points</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.points.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Credits</span>
                    <span className="font-medium text-gray-900 text-right">{formatCurrency(rateToView.credits)}</span>
                  </div>
                </div>
              </div>
            </div>

            {rateToView.feeItems && rateToView.feeItems.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-base font-semibold text-gray-900 mb-3">Itemized Fees</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 pr-4 text-left text-gray-600 font-medium">Description</th>
                        <th className="py-2 px-4 text-left text-gray-600 font-medium">Section</th>
                        <th className="py-2 px-4 text-left text-gray-600 font-medium">Payment</th>
                        <th className="py-2 pl-4 text-right text-gray-600 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rateToView.feeItems.map((fee, idx) => (
                        <tr key={`${fee.description}-${idx}`} className="border-b border-gray-100">
                          <td className="py-1.5 pr-4 text-gray-900">{fee.description}</td>
                          <td className="py-1.5 px-4 text-gray-700">{fee.section}</td>
                          <td className="py-1.5 px-4 text-gray-700">{fee.paymentType}</td>
                          <td className="py-1.5 pl-4 text-right text-gray-900">
                            {formatCurrency(fee.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
              </div>
            )}

            {rateToView.searchParams && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-base font-semibold text-gray-900 mb-3">Search Parameters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Purpose</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.searchParams.loanPurpose}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Credit Score</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.searchParams.creditScore}</span>
                  </div>
                  {rateToView.searchParams.purchasePrice !== undefined && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Purchase Price</span>
                      <span className="font-medium text-gray-900 text-right">
                        {formatCurrency(rateToView.searchParams.purchasePrice)}
                      </span>
                    </div>
                  )}
                  {rateToView.searchParams.downPayment !== undefined && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Down Payment</span>
                      <span className="font-medium text-gray-900 text-right">
                        {formatCurrency(rateToView.searchParams.downPayment)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Loan Amount</span>
                    <span className="font-medium text-gray-900 text-right">
                      {formatCurrency(rateToView.searchParams.loanAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setRateToView(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </RouteGuard>
  );
}

