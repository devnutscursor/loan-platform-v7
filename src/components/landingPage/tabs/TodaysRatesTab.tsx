'use client';

import React, { useState, useEffect } from 'react';
import { typography } from '@/theme/theme';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { icons } from '@/components/ui/Icon';
import RateResults from '@/components/landingPage/RateResults';

interface TodaysRatesTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  isPublic?: boolean;
  publicTemplateData?: any;
  userId?: string;
  companyId?: string;
}

interface Rate {
  id: string;
  loanType: string;
  rate: number;
  apr: number;
  points: number;
  monthlyPayment: number;
  lastUpdated: string;
  category?: 'featured' | '30yr-fixed' | '20yr-fixed' | '15yr-fixed' | 'arm';
}

/**
 * TodaysRatesTab - Clean, simple component that fetches and displays current mortgage rates
 * NO caching, NO complex logic, just fetch and display based on market defaults
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
  
  const [rates, setRates] = useState<Rate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Loading...');

  // Simple, user-editable filters (mirrors Get My Custom Rate)
  const [filters, setFilters] = useState({
    zipCode: '75024',
    propertyValue: '500000',
    loanAmount: '400000',
    creditScore: '740',
    propertyType: 'Single Family',
    occupancy: 'Primary',
    loanPurpose: 'Purchase',
    loanTerm: '30',
    waiveEscrow: false,
    militaryVeteran: false,
    lockDays: '',
    secondMortgageAmount: ''
  });

  // Simple fetch function - no caching, just fresh data
  const fetchTodaysRates = async () => {
    setIsLoading(true);
    setError(null);
    setValidationMessage(null);
    
    try {
      // Validate: Loan cannot exceed property value
      const pv = parseInt(filters.propertyValue || '0', 10);
      const la = parseInt(filters.loanAmount || '0', 10);
      if (pv > 0 && la > pv) {
        setValidationMessage('⚠️ Loan amount cannot be more than the property value. Please adjust your loan amount.');
        setIsLoading(false);
        return;
      }

      // Build request from filters (match test script format)
      const marketDefaults: any = {
        propertyZip: filters.zipCode,
        appraisedvalue: pv,
        loan_amount: la,
        fico: parseInt(filters.creditScore || '740', 10),
        loanpurpose: (filters.loanPurpose as 'Purchase' | 'Refinance') || 'Purchase',
        proptype: filters.propertyType || 'Single Family',
        occupancy: filters.occupancy || 'Primary',
        loanProduct1: `${filters.loanTerm} year fixed`
      };

      // Optional params
      if (filters.waiveEscrow === true) marketDefaults.waiveEscrow = true;
      if (filters.militaryVeteran === true) marketDefaults.militaryVeteran = true;
      if (filters.lockDays && filters.lockDays !== '30') marketDefaults.lockDays = filters.lockDays;
      const sm = parseInt(filters.secondMortgageAmount || '0', 10);
      if (!isNaN(sm) && sm > 0) marketDefaults.secondMortgageAmount = sm;

      console.log('🔍 Fetching today\'s rates with market defaults:', marketDefaults);

      const response = await fetch('/api/mortech/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(marketDefaults),
      });

      const result = await response.json();
      console.log('📊 Mortech API Response:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch rates');
      }

      // Transform Mortech rates to our display format
      if (result.rates && Array.isArray(result.rates)) {
        // Only include rates updated today (based on quote.lastUpdate)
        const isToday = (dateStr: string | undefined) => {
          if (!dateStr) return true; // if not provided, don't exclude
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return true; // if unparsable, don't exclude
          const now = new Date();
          return (
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate()
          );
        };

        const todaysRates = result.rates.filter((r: any) => isToday(r.lastUpdate));

        const transformedRates: Rate[] = todaysRates.slice(0, 6).map((rate: any, index: number) => ({
          id: rate.id || `rate-${index}`,
          loanType: rate.productName || rate.loanProgram || '30 Year Fixed',
          rate: rate.interestRate || 6.0,
          apr: rate.apr || 6.1,
          points: rate.points || 0,
          monthlyPayment: rate.monthlyPayment || 2000,
          lastUpdated: rate.lastUpdate || new Date().toLocaleString(),
          category: index === 0 ? 'featured' : '30yr-fixed'
        }));

        setRates(transformedRates);
        // Prefer latest quote's lastUpdate if available
        const mostRecent = transformedRates
          .map(r => new Date(r.lastUpdated))
          .filter(d => !isNaN(d.getTime()))
          .sort((a, b) => b.getTime() - a.getTime())[0];
        setLastUpdated(mostRecent ? mostRecent.toLocaleString() : new Date().toLocaleString());
        console.log('✅ Rates loaded successfully:', transformedRates.length);
      } else {
        throw new Error('No rates returned from API');
      }
    } catch (err) {
      console.error('❌ Error fetching rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
      setRates([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchTodaysRates();
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 
          className="text-3xl font-bold mb-2"
      style={{ 
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text 
          }}
        >
          Today's Mortgage Rates
        </h2>
        <p 
          className="text-lg"
        style={{ 
            fontSize: typography.fontSize.lg,
            color: colors.textSecondary 
          }}
        >
          Current rates based on market conditions
          <br />
          {/* <span className="text-sm">
            Assuming: $500k home, 20% down, 740 credit score, Primary residence
          </span> */}
        </p>
        <p className="text-sm mt-2" style={{ color: colors.textSecondary }}>
          Last updated: {lastUpdated}
        </p>
      </div>

      {/* Filters (simple inline form) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          value={filters.zipCode}
          onChange={e => setFilters(v => ({ ...v, zipCode: e.target.value }))}
          placeholder="ZIP Code"
          className="border rounded px-3 py-2"
        />
        <input
          value={filters.propertyValue}
          onChange={e => {
            setFilters(v => ({ ...v, propertyValue: e.target.value }));
            setValidationMessage(null); // Clear validation when user changes value
          }}
          placeholder="Property Value"
          className="border rounded px-3 py-2"
        />
        <input
          value={filters.loanAmount}
          onChange={e => {
            setFilters(v => ({ ...v, loanAmount: e.target.value }));
            setValidationMessage(null); // Clear validation when user changes value
          }}
          placeholder="Loan Amount"
          className="border rounded px-3 py-2"
        />
        <input
          value={filters.creditScore}
          onChange={e => setFilters(v => ({ ...v, creditScore: e.target.value }))}
          placeholder="Credit Score"
          className="border rounded px-3 py-2"
        />
        <select
          value={filters.propertyType}
          onChange={e => setFilters(v => ({ ...v, propertyType: e.target.value }))}
          className="border rounded px-3 py-2 bg-white"
          style={{ backgroundColor: '#ffffff' }}
        >
          <option>Single Family</option>
          <option>Condo</option>
          <option>Townhouse</option>
          <option>Multi-Family</option>
        </select>
        <select
          value={filters.occupancy}
          onChange={e => setFilters(v => ({ ...v, occupancy: e.target.value }))}
          className="border rounded px-3 py-2 bg-white"
          style={{ backgroundColor: '#ffffff' }}
        >
          <option>Primary</option>
          <option>Secondary</option>
          <option>Investment</option>
        </select>
        <select
          value={filters.loanPurpose}
          onChange={e => setFilters(v => ({ ...v, loanPurpose: e.target.value }))}
          className="border rounded px-3 py-2 bg-white"
          style={{ backgroundColor: '#ffffff' }}
        >
          <option>Purchase</option>
          <option>Refinance</option>
        </select>
        <select
          value={filters.loanTerm}
          onChange={e => setFilters(v => ({ ...v, loanTerm: e.target.value }))}
          className="border rounded px-3 py-2 bg-white"
          style={{ backgroundColor: '#ffffff' }}
        >
          <option value="30">30</option>
          <option value="20">20</option>
          <option value="15">15</option>
          <option value="10">10</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => fetchTodaysRates()}
          disabled={isLoading}
          style={{
            backgroundColor: colors.primary,
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 600,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
          className="transition-all hover:opacity-90"
        >
          {isLoading ? 'Loading...' : 'Refresh Rates'}
        </button>
      </div>

      {/* Validation Message (Alert/Warning) */}
      {validationMessage && (
        <div
          style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '16px',
            color: '#92400e'
          }}
        >
          <p className="font-semibold">⚠️ Notice</p>
          <p className="text-sm">{validationMessage}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '16px',
            color: '#991b1b'
          }}
        >
          <p className="font-semibold">Error loading rates</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Rates Display */}
      {!error && (
      <RateResults
          products={rates.map(r => ({
            id: r.id,
            lenderName: 'Market Lender',
            loanProgram: 'Conventional',
            loanType: 'Fixed',
            loanTerm: 30,
            interestRate: r.rate,
            apr: r.apr,
            monthlyPayment: r.monthlyPayment,
            fees: 0,
            points: r.points,
            credits: 0,
            lockPeriod: 30
          }))}
        loading={isLoading}
        template={selectedTemplate}
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />
      )}

      {/* Disclaimer */}
      <div 
        className="text-xs text-center p-4 rounded-lg mt-6"
        style={{ 
          backgroundColor: colors.background,
          border: `1px solid ${colors.border}`,
          color: colors.textSecondary 
        }}
      >
        <p>
          * Rates shown are for illustrative purposes and may not reflect your actual rate. 
          Your rate will depend on your specific circumstances including credit score, loan amount, 
          property type, and other factors. Contact us for a personalized rate quote.
        </p>
      </div>
    </div>
  );
}
