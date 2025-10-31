'use client';

import React, { useState } from 'react';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import RateResults from '@/components/landingPage/RateResults';

/**
 * Clean, Simple Mortgage Rate Comparison Component
 * User fills out form -> We send ONLY selected values to API -> Display results
 * NO caching, NO extra parameters, NO complexity
 */

interface MortgageRateComparisonProps {
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
  template?: 'template1' | 'template2';
  isPublic?: boolean;
  publicTemplateData?: any;
  userId?: string;
  companyId?: string;
}

interface RateProduct {
  id: string;
  lenderName: string;
  productName?: string;
  loanProgram: string;
  loanType: string;
  loanTerm: number;
  interestRate: number;
  apr: number;
  monthlyPayment: number;
  fees: number;
  points: number;
  credits: number;
  lockPeriod: number;
}

// Map property type from form to Mortech format
const mapPropertyType = (type: string): string => {
  const mapping: Record<string, string> = {
    'SingleFamily': 'Single Family',
    'Condo': 'Condo',
    'Townhouse': 'Townhouse',
    'MultiFamily': 'Multi-Family'
  };
  return mapping[type] || 'Single Family';
};

// Map occupancy from form to Mortech format
const mapOccupancy = (occ: string): string => {
  const mapping: Record<string, string> = {
    'Primary': 'Primary',
    'Secondary': 'Secondary',
    'Investment': 'Investment'
  };
  return mapping[occ] || 'Primary';
};

// Normalize loan term to Mortech format
const normalizeLoanTerm = (term: string): string => {
  if (!term) return '30 year fixed';
  if (term.includes('year fixed')) return term;
  return `${term} year fixed`;
};

export default function MortgageRateComparison({
  showHeader = true, 
  showFooter = true, 
  className = '',
  template = 'template1',
  isPublic = false,
  publicTemplateData,
  userId,
  companyId
}: MortgageRateComparisonProps) {
  const { getTemplateSync } = useEfficientTemplates();
  
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(template);
    
  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#01bcc6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };

  // Simple form state - only what Mortech API needs
  const [formData, setFormData] = useState({
    // Required fields
    zipCode: '75024',
    propertyValue: '500000',
    loanAmount: '400000',
    creditScore: '740',
    propertyType: 'Single Family',
    occupancy: 'Primary',
    loanPurpose: 'Purchase',
    loanTerm: '30',
    // Optional fields - only sent if user explicitly sets them
    waiveEscrow: false,
    militaryVeteran: false,
    lockDays: '',
    secondMortgageAmount: ''
  });

  const [products, setProducts] = useState<RateProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Handle form input changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation message when user changes property value or loan amount
    if (field === 'propertyValue' || field === 'loanAmount') {
      setValidationMessage(null);
    }
  };

  // Handle form submission - send ONLY selected values to API
  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setValidationMessage(null);
    
    try {
      // User-friendly validation
      const pv = parseInt(formData.propertyValue || '0', 10);
      const la = parseInt(formData.loanAmount || '0', 10);
      if (pv > 0 && la > pv) {
        setValidationMessage('⚠️ Loan amount cannot be more than the property value. Please adjust your loan amount.');
        setLoading(false);
        return;
      }

      // Build request with ONLY required fields + explicitly set optional fields
      // NO propertyState - test script proves it's not needed!
      const request: any = {
        // Required fields - always include
        propertyZip: formData.zipCode,
        appraisedvalue: pv,
        loan_amount: la,
        fico: parseInt(formData.creditScore),
        loanpurpose: formData.loanPurpose as 'Purchase' | 'Refinance',
        proptype: mapPropertyType(formData.propertyType),
        occupancy: mapOccupancy(formData.occupancy),
        loanProduct1: normalizeLoanTerm(formData.loanTerm)
      };

      // Optional fields - ONLY include if user set them
      if (formData.waiveEscrow === true) {
        request.waiveEscrow = true;
      }
      if (formData.militaryVeteran === true) {
        request.militaryVeteran = true;
      }
      if (formData.lockDays && formData.lockDays !== '30' && formData.lockDays !== '') {
        request.lockDays = formData.lockDays;
      }
      if (formData.secondMortgageAmount && formData.secondMortgageAmount !== '0' && formData.secondMortgageAmount !== '') {
        const amount = parseInt(formData.secondMortgageAmount);
        if (!isNaN(amount) && amount > 0) {
          request.secondMortgageAmount = amount;
        }
      }

      console.log('📤 Sending request to API:', request);

      const response = await fetch('/api/mortech/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      console.log('📥 Received response from API:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch rates');
      }

      // Transform results
      if (result.rates && Array.isArray(result.rates)) {
        const transformed: RateProduct[] = result.rates.map((rate: any, index: number) => ({
          id: rate.id || `rate-${index}`,
          lenderName: rate.lenderName || 'Lender',
          productName: rate.productName || 'Mortgage Product',
          loanProgram: rate.loanProgram || 'Conventional',
          loanType: rate.loanType || 'Fixed',
          loanTerm: parseInt(rate.loanTerm) || 30,
          interestRate: rate.interestRate || 0,
          apr: rate.apr || 0,
          monthlyPayment: rate.monthlyPayment || 0,
          fees: (rate.originationFee || 0) + (rate.upfrontFee || 0),
          points: rate.points || 0,
          credits: 0,
          lockPeriod: rate.lockTerm || 30
        }));

        setProducts(transformed);
        console.log('✅ Rates loaded:', transformed.length);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
    } finally {
      setLoading(false);
    }
  };

        return (
    <div className={`space-y-6 p-6 ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
            Get Your Custom Rate
          </h1>
          <p style={{ color: colors.textSecondary }}>
            Enter your information to see personalized mortgage rates
          </p>
                </div>
      )}

      {/* Simple Form */}
      <div className="bg-white rounded-lg shadow-lg p-6" style={{ borderColor: colors.border }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* ZIP Code */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
              ZIP Code *
            </label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              style={{ borderColor: colors.border }}
              placeholder="75024"
            />
                </div>

          {/* Property Value */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
              Property Value *
            </label>
            <input
              type="number"
              value={formData.propertyValue}
              onChange={(e) => handleChange('propertyValue', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              style={{ borderColor: colors.border }}
              placeholder="500000"
            />
                </div>

          {/* Loan Amount */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
              Loan Amount *
            </label>
            <input
              type="number"
              value={formData.loanAmount}
              onChange={(e) => handleChange('loanAmount', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              style={{ borderColor: colors.border }}
              placeholder="400000"
            />
            </div>

          {/* Credit Score */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
              Credit Score *
            </label>
            <select
              value={formData.creditScore}
              onChange={(e) => handleChange('creditScore', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white"
              style={{ borderColor: colors.border, backgroundColor: '#ffffff' }}
            >
              <option value="800">800+</option>
              <option value="780">780-799</option>
              <option value="760">760-779</option>
              <option value="740">740-759</option>
              <option value="720">720-739</option>
              <option value="700">700-719</option>
              <option value="680">680-699</option>
              <option value="660">660-679</option>
              <option value="640">640-659</option>
              <option value="620">620-639</option>
            </select>
                </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
              Property Type *
            </label>
            <select
              value={formData.propertyType}
              onChange={(e) => handleChange('propertyType', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white"
              style={{ borderColor: colors.border, backgroundColor: '#ffffff' }}
            >
              <option value="Single Family">Single Family</option>
              <option value="Condo">Condo</option>
              <option value="Townhouse">Townhouse</option>
              <option value="MultiFamily">Multi-Family</option>
            </select>
                </div>

          {/* Occupancy */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
              Occupancy *
            </label>
            <select
              value={formData.occupancy}
              onChange={(e) => handleChange('occupancy', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white"
              style={{ borderColor: colors.border, backgroundColor: '#ffffff' }}
            >
              <option value="Primary">Primary Residence</option>
              <option value="Secondary">Second Home</option>
              <option value="Investment">Investment Property</option>
            </select>
            </div>

          {/* Loan Purpose */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
              Loan Purpose *
            </label>
            <select
              value={formData.loanPurpose}
              onChange={(e) => handleChange('loanPurpose', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white"
              style={{ borderColor: colors.border, backgroundColor: '#ffffff' }}
            >
              <option value="Purchase">Purchase</option>
              <option value="Refinance">Refinance</option>
            </select>
                </div>

          {/* Loan Term */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
              Loan Term *
            </label>
            <select
              value={formData.loanTerm}
              onChange={(e) => handleChange('loanTerm', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white"
              style={{ borderColor: colors.border, backgroundColor: '#ffffff' }}
            >
              <option value="30">30 Year Fixed</option>
              <option value="25">25 Year Fixed</option>
              <option value="20">20 Year Fixed</option>
              <option value="15">15 Year Fixed</option>
              <option value="10">10 Year Fixed</option>
            </select>
                </div>
                </div>

        {/* Optional Fields */}
        <div className="mt-6 pt-6 border-t" style={{ borderColor: colors.border }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Additional Options (Optional)
            </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Waive Escrow */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="waiveEscrow"
                checked={formData.waiveEscrow}
                onChange={(e) => handleChange('waiveEscrow', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="waiveEscrow" className="text-sm" style={{ color: colors.text }}>
                Waive Escrow
              </label>
                </div>

            {/* Military Veteran */}
                <div className="flex items-center">
              <input
                type="checkbox"
                id="militaryVeteran"
                checked={formData.militaryVeteran}
                onChange={(e) => handleChange('militaryVeteran', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="militaryVeteran" className="text-sm" style={{ color: colors.text }}>
                Military Veteran
              </label>
                </div>

            {/* Lock Days */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Rate Lock Period
              </label>
              <select
                value={formData.lockDays}
                onChange={(e) => handleChange('lockDays', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-white"
                style={{ borderColor: colors.border, backgroundColor: '#ffffff' }}
              >
                <option value="">Default (30 days)</option>
                <option value="45">45 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>

            {/* Second Mortgage */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                2nd Mortgage Amount
              </label>
              <input
                type="number"
                value={formData.secondMortgageAmount}
                onChange={(e) => handleChange('secondMortgageAmount', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: colors.border }}
                placeholder="0"
                min="0"
              />
              </div>
            </div>
      </div>

        {/* Search Button */}
        <div className="mt-6">
                  <button 
            onClick={handleSearch}
            disabled={loading}
                    style={{
              backgroundColor: colors.primary,
              color: '#ffffff',
              padding: '12px 32px',
              borderRadius: '8px',
              fontWeight: 600,
              width: '100%',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            className="transition-all hover:opacity-90"
          >
            {loading ? 'Searching...' : 'Get My Rates'}
                  </button>
                </div>
              </div>

      {/* Validation Message (Alert/Warning) */}
      {validationMessage && (
        <div
                  style={{ 
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '16px',
            color: '#92400e',
            marginTop: '16px'
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
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
      {products.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
            Your Custom Rates ({products.length} options)
          </h2>
        <RateResults 
          products={products} 
          loading={loading} 
          template={template}
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />
        </div>
      )}

      {/* Footer */}
      {showFooter && (
        <div 
          className="text-xs text-center p-4 rounded-lg mt-6"
          style={{ 
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
            color: colors.textSecondary 
          }}
        >
          <p>
            * Rates are subject to change and may vary based on your specific circumstances. 
            Contact us for an official Loan Estimate.
          </p>
            </div>
      )}
    </div>
  );
}
