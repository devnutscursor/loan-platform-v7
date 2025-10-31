'use client';

import { useState, useCallback, memo } from 'react';
import { spacing, borderRadius, shadows, typography, colors } from '@/theme/theme';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import Icon from '@/components/ui/Icon';

interface SearchFormData {
  zipCode: string;
  salesPrice: string;
  downPayment: string;
  downPaymentPercent: string;
  creditScore: string;
  propertyType: string;
  occupancy: string;
  loanType: string;
  loanTerm: string; // Added loan term field
  eligibleForLowerRate: boolean;
  loanPurpose: string;
  // Refinance-specific fields
  homeValue: string;
  mortgageBalance: string;
  cashOut: string;
  ltv: string;
  // Additional fields for Mortech API
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
  // Custom Rate Options (Additional Options)
  waiveEscrow: boolean;
  militaryVeteran: boolean;
  lockDays: string;
  secondMortgageAmount: string;
  // ARM Loan Configuration
  amortizationTypes: string[];
  armFixedTerms: string[];
  loanTerms: string[];
}

interface MortgageSearchFormProps {
  onSearch: (data: SearchFormData) => void;
  loading: boolean;
  template?: 'template1' | 'template2';
  // NEW: Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
}

function MortgageSearchForm({ 
  onSearch, 
  loading, 
  template = 'template1',
  // NEW: Public mode props
  isPublic = false,
  publicTemplateData
}: MortgageSearchFormProps) {
  const { getTemplateSync } = useEfficientTemplates();
  
  // Template data fetching - support both public and auth modes
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(template);
  const templateColors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#01bcc6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  
  // Get layout data for border radius
  const templateLayout = templateData?.template?.layout || {
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24 },
    spacing: 16
  };
  
  const [formData, setFormData] = useState<SearchFormData>({
    zipCode: '75024',
    salesPrice: '225000',
    downPayment: '75000',
    downPaymentPercent: '33.33',
    creditScore: '800+',
    propertyType: 'SingleFamily',
    occupancy: 'PrimaryResidence',
    loanType: 'Conventional',
    loanTerm: '30', // Added loan term
    eligibleForLowerRate: false,
    loanPurpose: 'Purchase',
    // Refinance-specific fields
    homeValue: '450000',
    mortgageBalance: '360000',
    cashOut: '0',
    ltv: '80.00',
    // Additional fields matching your exact request
    firstName: 'test',
    lastName: 'test1',
    vaFirstTimeUse: true,
    firstTimeHomeBuyer: false,
    monthsReserves: 24,
    selfEmployed: true,
    waiveEscrows: false,
    county: 'Collin',
    state: 'TX',
    numberOfStories: 1,
    numberOfUnits: 'OneUnit',
    lienType: 'First',
    borrowerPaidMI: 'Yes',
    baseLoanAmount: 150000,
    loanLevelDebtToIncomeRatio: 18,
    totalMonthlyQualifyingIncome: 9000,
    // Custom Rate Options (Additional Options)
    waiveEscrow: false,
    militaryVeteran: false,
    lockDays: '30',
    secondMortgageAmount: '0',
    // ARM Loan Configuration - Explicitly enforce ARM loans
    amortizationTypes: ["Fixed", "ARM"],
    armFixedTerms: ["ThreeYear", "FiveYear", "SevenYear", "TenYear"],
    loanTerms: ["ThirtyYear", "TwentyYear", "TwentyFiveYear", "FifteenYear", "TenYear"]
  });

  const [activeTab, setActiveTab] = useState<'purchase' | 'refinance'>('purchase');
  const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);

  const handleInputChange = (field: keyof SearchFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate down payment percentage for purchase
    if (field === 'salesPrice' || field === 'downPayment') {
      const price = field === 'salesPrice' ? parseFloat(value as string) : parseFloat(formData.salesPrice);
      const down = field === 'downPayment' ? parseFloat(value as string) : parseFloat(formData.downPayment);
      if (price > 0) {
        const percent = ((down / price) * 100).toFixed(1);
        setFormData(prev => ({
          ...prev,
          downPaymentPercent: percent
        }));
      }
    }

    // Auto-calculate LTV for refinance
    if (field === 'homeValue' || field === 'mortgageBalance') {
      const homeVal = field === 'homeValue' ? parseFloat(value as string) : parseFloat(formData.homeValue);
      const mortgageBal = field === 'mortgageBalance' ? parseFloat(value as string) : parseFloat(formData.mortgageBalance);
      if (homeVal > 0) {
        const ltv = ((mortgageBal / homeVal) * 100).toFixed(2);
        setFormData(prev => ({
          ...prev,
          ltv: ltv
        }));
      }
    }
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔄 MortgageSearchForm: Form submitted with data:', formData);
    console.log('🔄 MortgageSearchForm: Calling onSearch callback');
    onSearch(formData);
  }, [onSearch, formData]);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: `${templateLayout.borderRadius}px`,
      boxShadow: shadows.lg,
      padding: spacing[6],
      marginBottom: spacing[8]
    }}>
      {/* Sleek Toggle Switch */}
      <div 
        className="relative inline-flex p-1 mb-4"
        style={{
          backgroundColor: templateColors.border,
          borderRadius: `${templateLayout.borderRadius}px`
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('purchase')}
          className={`relative z-10 px-4 py-2 text-sm font-medium transition-all duration-200 ${
            activeTab === 'purchase' ? 'text-white' : 'text-gray-600'
          }`}
          style={{
            borderRadius: `${templateLayout.borderRadius}px`,
            backgroundColor: activeTab === 'purchase' ? templateColors.primary : 'transparent'
          }}
        >
          Purchase
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('refinance')}
          className={`relative z-10 px-4 py-2 text-sm font-medium transition-all duration-200 ${
            activeTab === 'refinance' ? 'text-white' : 'text-gray-600'
          }`}
          style={{
            borderRadius: `${templateLayout.borderRadius}px`,
            backgroundColor: activeTab === 'refinance' ? templateColors.primary : 'transparent'
          }}
        >
          Refinance
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
        {/* Row 1: ZIP Code, Price/Value, Down Payment, Credit Score */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: activeTab === 'purchase' 
            ? '1fr 2fr 2fr 1.5fr'  // ZIP | Purchase Price | Down Payment | Credit Score
            : '1fr 2fr 1.5fr 1fr',  // ZIP | Home Value | Mortgage Balance | Cash Out
          gap: spacing[4],
          alignItems: 'end'  // Align all fields to bottom to ensure same height
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray[700],
              marginBottom: spacing[2]
            }}>
              ZIP Code
            </label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                padding: `${spacing[2]} ${spacing[3]}`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: `${templateLayout.borderRadius}px`,
                fontSize: typography.fontSize.base,
                outline: 'none',
                transition: 'border-color 0.2s ease-in-out',
                boxSizing: 'border-box',
                color: templateColors.text,
                backgroundColor: templateColors.background
              }}
              placeholder="75024"
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray[700],
              marginBottom: spacing[2]
            }}>
              {activeTab === 'purchase' ? 'Purchase Price' : 'Home Value'}
            </label>
{activeTab === 'refinance' ? (
              <div style={{ display: 'flex', height: '40px' }}>
                <input
                  type="number"
                  value={formData.homeValue}
                  onChange={(e) => handleInputChange('homeValue', e.target.value)}
                  style={{
                    flex: 1,
                    padding: `${spacing[2]} ${spacing[3]}`,
                    border: `1px solid ${colors.gray[300]}`,
                    borderTopLeftRadius: `${templateLayout.borderRadius}px`,
                    borderBottomLeftRadius: `${templateLayout.borderRadius}px`,
                    borderRight: 'none',
                    fontSize: typography.fontSize.base,
                    outline: 'none',
                    transition: 'border-color 0.2s ease-in-out',
                    boxSizing: 'border-box',
                    color: templateColors.text,
                    backgroundColor: templateColors.background,
                    height: '100%'
                  }}
                  placeholder="450000"
                />
                 <div style={{ 
                   display: 'flex',
                   alignItems: 'center',
                   padding: `${spacing[2]} ${spacing[2]}`, 
                   backgroundColor: 'transparent', 
                   border: `1px solid ${colors.gray[300]}`, 
                   borderLeft: 'none',
                   borderTopRightRadius: `${templateLayout.borderRadius}px`,
                   borderBottomRightRadius: `${templateLayout.borderRadius}px`,
                   fontSize: typography.fontSize.xs, 
                   color: colors.gray[500],
                   minWidth: '70px',
                   justifyContent: 'center',
                   height: '100%',
                   boxSizing: 'border-box',
                   fontWeight: typography.fontWeight.normal
                 }}>
                   {formData.ltv}% LTV
                 </div>
              </div>
            ) : (
              <input
                type="number"
                value={formData.salesPrice}
                onChange={(e) => handleInputChange('salesPrice', e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: `${spacing[2]} ${spacing[3]}`,
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: `${templateLayout.borderRadius}px`,
                  fontSize: typography.fontSize.base,
                  outline: 'none',
                  transition: 'border-color 0.2s ease-in-out',
                  boxSizing: 'border-box',
                  color: templateColors.text,
                  backgroundColor: templateColors.background
                }}
                placeholder="225000"
              />
            )}
          </div>

          {/* Add Down Payment and Credit Score to Row 1 */}
          {activeTab === 'purchase' ? (
            <>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: typography.fontSize.sm, 
                  fontWeight: typography.fontWeight.medium, 
                  color: colors.gray[700], 
                  marginBottom: spacing[2]
                }}>
                  Down Payment
                </label>
                <div style={{ display: 'flex', height: '40px' }}>
                  <input
                    type="number"
                    value={formData.downPayment}
                    onChange={(e) => handleInputChange('downPayment', e.target.value)}
                    style={{ 
                      flex: 1,
                      padding: `${spacing[2]} ${spacing[3]}`,
                      border: `1px solid ${colors.gray[300]}`,
                      borderTopLeftRadius: `${templateLayout.borderRadius}px`,
                      borderBottomLeftRadius: `${templateLayout.borderRadius}px`,
                      borderRight: 'none',
                      outline: 'none',
                      fontSize: typography.fontSize.base,
                      color: templateColors.text,
                      backgroundColor: templateColors.background,
                      height: '100%',
                      boxSizing: 'border-box'
                    }}
                    placeholder="75000"
                  />
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    padding: `${spacing[2]} ${spacing[3]}`, 
                    backgroundColor: colors.gray[100], 
                    border: `1px solid ${colors.gray[300]}`, 
                    borderTopRightRadius: `${templateLayout.borderRadius}px`,
                    borderBottomRightRadius: `${templateLayout.borderRadius}px`,
                    fontSize: typography.fontSize.sm, 
                    color: colors.gray[600],
                    minWidth: '60px',
                    justifyContent: 'center',
                    height: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {formData.downPaymentPercent}%
                  </div>
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: typography.fontSize.sm, 
                  fontWeight: typography.fontWeight.medium, 
                  color: colors.gray[600], 
                  marginBottom: spacing.sm 
                }}>
                  Credit Score
                </label>
                <select
                  value={formData.creditScore}
                  onChange={(e) => handleInputChange('creditScore', e.target.value)}
                  style={{ 
                    width: '100%',
                    height: '40px',
                    padding: `${spacing[2]} ${spacing[3]}`,
                    border: `1px solid ${colors.gray[300]}`,
                    borderRadius: `${templateLayout.borderRadius}px`,
                    outline: 'none',
                    fontSize: typography.fontSize.base,
                    color: templateColors.text,
                    backgroundColor: templateColors.background,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="800+">800 or greater</option>
                  <option value="780-799">780 - 799</option>
                  <option value="760-779">760 - 779</option>
                  <option value="740-759">740 - 759</option>
                  <option value="720-739">720 - 739</option>
                  <option value="700-719">700 - 719</option>
                  <option value="680-699">680 - 699</option>
                  <option value="660-679">660 - 679</option>
                  <option value="640-659">640 - 659</option>
                  <option value="620-639">620 - 639</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: typography.fontSize.sm, 
                  fontWeight: typography.fontWeight.medium, 
                  color: colors.gray[600], 
                  marginBottom: spacing.sm 
                }}>
                  Mortgage Balance
                </label>
                <input
                  type="number"
                  value={formData.mortgageBalance}
                  onChange={(e) => handleInputChange('mortgageBalance', e.target.value)}
                  style={{ 
                    width: '100%',
                    height: '40px',
                    padding: `${spacing[2]} ${spacing[3]}`,
                    border: `1px solid ${colors.gray[300]}`,
                    borderRadius: `${templateLayout.borderRadius}px`,
                    outline: 'none',
                    fontSize: typography.fontSize.base,
                    color: templateColors.text,
                    backgroundColor: templateColors.background,
                    boxSizing: 'border-box'
                  }}
                  placeholder="360000"
                />
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: typography.fontSize.sm, 
                  fontWeight: typography.fontWeight.medium, 
                  color: colors.gray[600], 
                  marginBottom: spacing.sm 
                }}>
                  Cash Out
                </label>
                <input
                  type="number"
                  value={formData.cashOut}
                  onChange={(e) => handleInputChange('cashOut', e.target.value)}
                  style={{ 
                    width: '100%',
                    height: '40px',
                    padding: `${spacing[2]} ${spacing[3]}`,
                    border: `1px solid ${colors.gray[300]}`,
                    borderRadius: `${templateLayout.borderRadius}px`,
                    outline: 'none',
                    fontSize: typography.fontSize.base,
                    color: templateColors.text,
                    backgroundColor: templateColors.background,
                    boxSizing: 'border-box'
                  }}
                  placeholder="0"
                />
              </div>
            </>
          )}
        </div>

        {/* Row 2: Property Type, Residency Usage, Loan Term */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: spacing[4],
          alignItems: 'end'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: typography.fontSize.sm, 
              fontWeight: typography.fontWeight.medium, 
              color: colors.gray[600], 
              marginBottom: spacing.sm 
            }}>
              Property Type
            </label>
            <select
              value={formData.propertyType}
              onChange={(e) => handleInputChange('propertyType', e.target.value)}
              style={{ 
                width: '100%',
                height: '40px',
                padding: `${spacing[2]} ${spacing[3]}`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: `${templateLayout.borderRadius}px`,
                outline: 'none',
                fontSize: typography.fontSize.base,
                color: templateColors.text,
                backgroundColor: templateColors.background,
                boxSizing: 'border-box'
              }}
            >
              <option value="SingleFamily">Single Family</option>
              <option value="AttachedCondo">Attached Condo</option>
              <option value="DetachedCondo">Detached Condo</option>
              <option value="Townhouse">Townhome</option>
              <option value="2Unit">2 Unit</option>
              <option value="3Unit">3 Unit</option>
              <option value="4Unit">4 Unit</option>
              <option value="1Unit">1 Unit</option>
              <option value="Manufactured">Manufactured Home</option>
            </select>
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: typography.fontSize.sm, 
              fontWeight: typography.fontWeight.medium, 
              color: colors.gray[600], 
              marginBottom: spacing.sm 
            }}>
              Residency Usage
            </label>
            <select
              value={formData.occupancy}
              onChange={(e) => handleInputChange('occupancy', e.target.value)}
              style={{ 
                width: '100%',
                height: '40px',
                padding: `${spacing[2]} ${spacing[3]}`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: `${templateLayout.borderRadius}px`,
                outline: 'none',
                fontSize: typography.fontSize.base,
                color: templateColors.text,
                backgroundColor: templateColors.background,
                boxSizing: 'border-box'
              }}
            >
              <option value="PrimaryResidence">Primary</option>
              <option value="SecondHome">Secondary Home</option>
              <option value="Investment">Investment</option>
            </select>
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: typography.fontSize.sm, 
              fontWeight: typography.fontWeight.medium, 
              color: colors.gray[600], 
              marginBottom: spacing.sm 
            }}>
              Loan Term
            </label>
            <select
              value={formData.loanTerm}
              onChange={(e) => handleInputChange('loanTerm', e.target.value)}
              style={{ 
                width: '100%',
                height: '40px',
                padding: `${spacing[2]} ${spacing[3]}`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: `${templateLayout.borderRadius}px`,
                outline: 'none',
                fontSize: typography.fontSize.base,
                color: templateColors.text,
                backgroundColor: templateColors.background,
                boxSizing: 'border-box'
              }}
            >
              <option value="30">30 Year Fixed</option>
              <option value="25">25 Year Fixed</option>
              <option value="20">20 Year Fixed</option>
              <option value="15">15 Year Fixed</option>
              <option value="10">10 Year Fixed</option>
            </select>
          </div>
        </div>

        {/* Additional Options Section */}
        <div style={{ marginTop: spacing[4] }}>
          <button
            type="button"
            onClick={() => setShowAdditionalOptions(!showAdditionalOptions)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              background: 'none',
              border: 'none',
              color: templateColors.primary,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
              padding: 0
            }}
          >
            <span>{showAdditionalOptions ? '−' : '+'}</span>
            Additional Options
          </button>
          
          {showAdditionalOptions && (
            <div style={{ 
              marginTop: spacing[4],
              padding: spacing[4],
              border: `1px solid ${colors.gray[200]}`,
              borderRadius: `${templateLayout.borderRadius}px`,
              backgroundColor: colors.gray[50]
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr 1fr', 
                gap: spacing[4],
                alignItems: 'end'
              }}>
                {/* Waive Escrow */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: typography.fontSize.sm, 
                    fontWeight: typography.fontWeight.medium, 
                    color: colors.gray[700], 
                    marginBottom: spacing[2]
                  }}>
                    Waive Escrow
                  </label>
                  <select
                    value={formData.waiveEscrow ? 'Yes' : 'No'}
                    onChange={(e) => handleInputChange('waiveEscrow', e.target.value === 'Yes')}
                    style={{ 
                      width: '100%',
                      height: '40px',
                      padding: `${spacing[2]} ${spacing[3]}`,
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: `${templateLayout.borderRadius}px`,
                      outline: 'none',
                      fontSize: typography.fontSize.base,
                      color: templateColors.text,
                      backgroundColor: templateColors.background,
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                {/* Military/Veteran */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: typography.fontSize.sm, 
                    fontWeight: typography.fontWeight.medium, 
                    color: colors.gray[700], 
                    marginBottom: spacing[2]
                  }}>
                    Military/Veteran
                  </label>
                  <select
                    value={formData.militaryVeteran ? 'Yes' : 'No'}
                    onChange={(e) => handleInputChange('militaryVeteran', e.target.value === 'Yes')}
                    style={{ 
                      width: '100%',
                      height: '40px',
                      padding: `${spacing[2]} ${spacing[3]}`,
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: `${templateLayout.borderRadius}px`,
                      outline: 'none',
                      fontSize: typography.fontSize.base,
                      color: templateColors.text,
                      backgroundColor: templateColors.background,
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                {/* Lock Days */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: typography.fontSize.sm, 
                    fontWeight: typography.fontWeight.medium, 
                    color: colors.gray[700], 
                    marginBottom: spacing[2]
                  }}>
                    Lock Days
                  </label>
                  <select
                    value={formData.lockDays}
                    onChange={(e) => handleInputChange('lockDays', e.target.value)}
                    style={{ 
                      width: '100%',
                      height: '40px',
                      padding: `${spacing[2]} ${spacing[3]}`,
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: `${templateLayout.borderRadius}px`,
                      outline: 'none',
                      fontSize: typography.fontSize.base,
                      color: templateColors.text,
                      backgroundColor: templateColors.background,
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="30">30 days</option>
                    <option value="45">45 days</option>
                    <option value="60">60 days</option>
                  </select>
                </div>

                {/* Second Mortgage Amount */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: typography.fontSize.sm, 
                    fontWeight: typography.fontWeight.medium, 
                    color: colors.gray[700], 
                    marginBottom: spacing[2]
                  }}>
                    2nd Mortgage Amount
                  </label>
                  <input
                    type="number"
                    value={formData.secondMortgageAmount || '0'}
                    onChange={(e) => {
                      // Ensure we never send empty string - default to '0'
                      const value = e.target.value === '' ? '0' : e.target.value;
                      handleInputChange('secondMortgageAmount', value);
                    }}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: `${spacing[2]} ${spacing[3]}`,
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: `${templateLayout.borderRadius}px`,
                      fontSize: typography.fontSize.base,
                      outline: 'none',
                      transition: 'border-color 0.2s ease-in-out',
                      boxSizing: 'border-box',
                      color: templateColors.text,
                      backgroundColor: templateColors.background
                    }}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Eligible for Lower Rate and Update Button */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: activeTab === 'purchase' ? '1fr auto' : 'auto', 
          gap: spacing[4],
          alignItems: 'center',
          justifyContent: activeTab === 'refinance' ? 'flex-end' : 'normal'
        }}>
          {activeTab === 'purchase' && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="eligibleForLowerRate"
                checked={formData.eligibleForLowerRate}
                onChange={(e) => handleInputChange('eligibleForLowerRate', e.target.checked)}
                style={{ 
                  height: '1rem',
                  width: '1rem',
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: `${templateLayout.borderRadius}px`,
                  color: templateColors.primary,
                  accentColor: templateColors.primary
                }}
              />
              <label htmlFor="eligibleForLowerRate" style={{ 
                marginLeft: spacing.sm, 
                display: 'block', 
                fontSize: typography.fontSize.sm, 
                color: colors.text.secondary 
              }}>
                Eligible for lower rate
              </label>
            </div>
          )}
          
          {/* Update Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              height: '40px',
              backgroundColor: templateColors.primary,
              color: '#ffffff',
              padding: `0 ${spacing[6]}`,
              borderRadius: `${templateLayout.borderRadius}px`,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s ease-in-out',
              minWidth: '140px',
              boxSizing: 'border-box'
            }}
          >
            {loading ? 'Searching...' : 'Update Rates'}
          </button>
        </div>

        {/* Debug Info */}
        <div style={{ 
          paddingTop: spacing.md, 
          padding: spacing.md, 
          backgroundColor: colors.gray[50], 
          borderRadius: borderRadius.md 
        }}>
          <h4 style={{ 
            fontSize: typography.fontSize.sm, 
            fontWeight: typography.fontWeight.medium, 
              color: colors.gray[600],
            marginBottom: spacing.sm 
          }}>
            Current Form Values (Debug):
          </h4>
          <div style={{ 
            fontSize: typography.fontSize.xs, 
              color: colors.gray[600],
            display: 'flex', 
            flexDirection: 'column', 
            gap: spacing.xs 
          }}>
            <p><strong>Property:</strong> {formData.salesPrice} | {formData.zipCode} | {formData.county}, {formData.state}</p>
            <p><strong>Loan:</strong> {formData.baseLoanAmount} | {formData.loanTerm}yr | FICO: {formData.creditScore}</p>
            <p><strong>Borrower:</strong> {formData.firstName} {formData.lastName} | Self-employed: {formData.selfEmployed ? 'Yes' : 'No'}</p>
            <p><strong>Income:</strong> ${formData.totalMonthlyQualifyingIncome}/month | DTI: {formData.loanLevelDebtToIncomeRatio}%</p>
          </div>
        </div>

      </form>
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(MortgageSearchForm);
