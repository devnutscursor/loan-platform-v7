'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MortgageSearchForm from '@/components/landingPage/MortgageSearchForm';
import RateResults from '@/components/landingPage/RateResults';
import { Button } from '@/components/ui/Button';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { icons } from '@/components/ui/Icon';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import SynclyFooter from '@/components/ui/SynclyFooter';

/**
 * Mortgage Rate Comparison Component
 * Restored questionnaire/landing page UI (from old version) with Mortech API logic
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
}

const MortgageRateComparison = React.memo(function MortgageRateComparison({ 
  showHeader = true, 
  showFooter = true, 
  className = "",
  template = 'template1',
  isPublic = false,
  publicTemplateData,
  userId,
  companyId
}: MortgageRateComparisonProps) {
  const searchParams = useSearchParams();
  const { user } = useAuth(); // Check if current visitor is authenticated
  const [products, setProducts] = useState<RateProduct[]>([]);
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState('landing');
  const [stepHistory, setStepHistory] = useState<string[]>(['landing']);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [questionnaireFormData, setQuestionnaireFormData] = useState<Partial<SearchFormData> | undefined>(undefined);
  const [pendingAutoSearchData, setPendingAutoSearchData] = useState<SearchFormData | null>(null);
  const [loanAmount, setLoanAmount] = useState<number | undefined>(undefined);
  const [downPayment, setDownPayment] = useState<number | undefined>(undefined);
  
  // Email verification state (for unauthenticated users)
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('mortech_verified_email');
    }
    return null;
  });
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailVerificationStep, setEmailVerificationStep] = useState<'email' | 'verify' | 'verified'>('email');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  
  // Sync verifiedEmail with sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('mortech_verified_email');
      if (stored && stored !== verifiedEmail) {
        setVerifiedEmail(stored);
        setEmail(stored);
        setEmailVerificationStep('verified');
      }
    }
  }, []); // Run once on mount

  // Update emailVerificationStep when verifiedEmail changes
  useEffect(() => {
    if (verifiedEmail) {
      setEmailVerificationStep('verified');
      setEmail(verifiedEmail);
    }
  }, [verifiedEmail]);

  // Debug logging for email verification
  useEffect(() => {
    console.log('🔍 MortgageRateComparison Debug:', {
      isPublic,
      hasUser: !!user,
      verifiedEmail,
      showEmailVerification,
      emailVerificationStep
    });
  }, [isPublic, user, verifiedEmail, showEmailVerification, emailVerificationStep]);

  // Get template-specific styles and content
  const { getTemplateSync } = useEfficientTemplates();
  const templateData = isPublic && publicTemplateData ? publicTemplateData : getTemplateSync(template);
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

  // Questionnaire navigation functions
  const handleQuestionnaireStepChange = (step: string, answer?: any) => {
    if (answer) {
      const newAnswers = { ...questionnaireAnswers, [currentStep]: answer };
      setQuestionnaireAnswers(newAnswers);
    }
    setStepHistory(prev => [...prev, step]);
    setCurrentStep(step);
  };

  const handleQuestionnaireBack = () => {
    // If email verification is showing, hide it and return to questionnaire
    if (showEmailVerification) {
      setShowEmailVerification(false);
      setEmailVerificationStep('email');
      setName('');
      setPhone('');
      setEmail('');
      setOtpCode('');
      setNameError(null);
      setPhoneError(null);
      setEmailError(null);
      setOtpError(null);
      return;
    }
    
    // Otherwise, go back in questionnaire step history
    if (stepHistory.length > 1) {
      const newHistory = stepHistory.slice(0, -1);
      setStepHistory(newHistory);
      setCurrentStep(newHistory[newHistory.length - 1]);
    }
  };

  const handleQuestionnaireComplete = async (finalAnswer: any) => {
    const allAnswers = { ...questionnaireAnswers, [currentStep]: finalAnswer };
    setQuestionnaireAnswers(allAnswers);
    
    // For public profile pages, require email verification before proceeding
    // Skip email verification for authenticated loan officers (they use mortech_api_calls tracking)
    // isPublic means it's a public profile page
    // !verifiedEmail means email hasn't been verified yet
    // !user means user is not authenticated (email verification only needed for unauthenticated users)
    console.log('🔍 Email verification check:', {
      isPublic,
      user: !!user,
      verifiedEmail,
      shouldShow: isPublic && !verifiedEmail && !user
    });
    
    if (isPublic && !verifiedEmail && !user) {
      console.log('✅ Showing email verification step');
      setShowEmailVerification(true);
      return;
    }
    
    // Generate form data from questionnaire answers
    const formData = await autoSearchFromQuestionnaire(allAnswers);
    
    setPendingAutoSearchData(formData);
    
    // Hide questionnaire and show search form with pre-filled values
    setShowQuestionnaire(false);
    setShowLanding(false);
  };
  
  // Create lead function
  const createLead = async () => {
    // Get userId and companyId
    let leadUserId: string | undefined;
    let leadCompanyId: string | undefined;

    if (isPublic && publicTemplateData?.profileData) {
      leadUserId = publicTemplateData.profileData.user.id;
      leadCompanyId = publicTemplateData.profileData.company.id;
    } else if (userId && companyId) {
      leadUserId = userId;
      leadCompanyId = companyId;
    }

    if (!leadUserId || !leadCompanyId) {
      console.warn('Missing user or company information for lead creation');
      return;
    }

    // Split name into firstName and lastName
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName,
          lastName,
          email: email.trim(),
          phone: phone.trim(),
          userId: leadUserId,
          companyId: leadCompanyId,
          source: 'email_verification',
          loanDetails: {
            productId: '',
            lenderName: '',
            loanProgram: '',
            loanType: '',
            loanTerm: 0,
            interestRate: 0,
            apr: 0,
            monthlyPayment: 0,
            fees: 0,
            points: 0,
            credits: 0,
            lockPeriod: 0,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create lead:', errorText);
        return;
      }

      const result = await response.json();
      if (result.success) {
        console.log('Lead created successfully');
      }
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  // Email verification handlers
  const handleSendOTP = async () => {
    setNameError(null);
    setPhoneError(null);
    setEmailError(null);
    
    // Validate name
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

    // Validate phone
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      return;
    }
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setIsSendingOTP(true);
    try {
      const response = await fetch('/api/mortech/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      
      const result = await response.json();
      if (response.ok && result.success) {
        setEmailVerificationStep('verify');
      } else {
        setEmailError(result.message || 'Failed to send verification code');
      }
    } catch (error) {
      setEmailError('Network error. Please try again.');
    } finally {
      setIsSendingOTP(false);
    }
  };
  
  const handleVerifyOTP = async () => {
    setOtpError(null);
    
    if (!otpCode.trim() || otpCode.length !== 6) {
      setOtpError('Please enter a 6-digit verification code');
      return;
    }
    
    setIsVerifyingOTP(true);
    try {
      const response = await fetch('/api/mortech/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          code: otpCode.trim() 
        }),
      });
      
      const result = await response.json();
      if (response.ok && result.success && result.verified) {
        setVerifiedEmail(email.trim());
        setEmailVerificationStep('verified');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('mortech_verified_email', email.trim());
        }
        
        // Create lead after successful verification
        setIsCreatingLead(true);
        await createLead();
        setIsCreatingLead(false);
        
        // Proceed with questionnaire completion
        setShowEmailVerification(false);
        const allAnswers = { ...questionnaireAnswers };
        const formData = await autoSearchFromQuestionnaire(allAnswers);
        setPendingAutoSearchData(formData);
        setShowQuestionnaire(false);
        setShowLanding(false);
      } else {
        setOtpError(result.message || 'Invalid verification code');
      }
    } catch (error) {
      setOtpError('Network error. Please try again.');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  // Map credit score from form to numeric value for Mortech
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

  // Map property type from form to Mortech format
  const mapPropertyTypeToMortech = (type: string): string => {
    const mapping: Record<string, string> = {
      'SingleFamily': 'Single Family',
      'Condo': 'Condo',
      'Townhouse': 'Townhouse',
      'MultiFamily': 'Multi-Family'
    };
    return mapping[type] || 'Single Family';
  };

  // Map occupancy from form to Mortech format
  const mapOccupancyToMortech = (occ: string): string => {
    const mapping: Record<string, string> = {
      'PrimaryResidence': 'Primary',
      'Secondary': 'Secondary',
      'Investment': 'Investment'
    };
    return mapping[occ] || 'Primary';
  };

  // Map questionnaire credit score to form dropdown value
  const mapCreditScoreToDropdown = (creditScore: string): string => {
    // Map questionnaire values to exact dropdown values
    if (creditScore === 'Below 580') return 'Below 580';
    if (creditScore === '580-619') return '580-619';
    if (creditScore === '620-639') return '620-639';
    if (creditScore === '640+') return '640-659'; // Map 640+ to closest range
    if (creditScore === '640-679') return '660-679'; // Map 640-679 to middle range
    if (creditScore === '680-719') return '700-719'; // Map 680-719 to middle range
    if (creditScore === '720+') return '720-739'; // Map 720+ to closest range
    if (creditScore === '640-659') return '640-659';
    if (creditScore === '660-679') return '660-679';
    if (creditScore === '680-699') return '680-699';
    if (creditScore === '700-719') return '700-719';
    if (creditScore === '720-739') return '720-739';
    if (creditScore === '740-759') return '740-759';
    if (creditScore === '760-779') return '760-779';
    if (creditScore === '780-799') return '780-799';
    if (creditScore === '800+') return '800+';
    // Default fallback
    return creditScore || '740-759';
  };

  // Auto-search based on questionnaire answers
  const autoSearchFromQuestionnaire = async (answers: Record<string, any>): Promise<SearchFormData> => {
    // Extract values from questionnaire answers
    let loanType = 'Conventional';
    let creditScore = '740-759';
    let loanPurpose = 'Purchase';
    let vaFirstTimeUse = false;
    let downPaymentPercent: string | undefined = undefined;
    
    Object.values(answers).forEach((answer: any) => {
      if (answer && typeof answer === 'object') {
        if (answer.loanType) loanType = answer.loanType;
        if (answer.creditScore) creditScore = answer.creditScore;
        if (answer.loanPurpose) loanPurpose = answer.loanPurpose;
        if (answer.vaFirstTimeUse !== undefined) vaFirstTimeUse = answer.vaFirstTimeUse;
        if (answer.downPaymentPercent) downPaymentPercent = answer.downPaymentPercent;
      }
    });
    
    // Map credit score to exact dropdown value
    const mappedCreditScore = mapCreditScoreToDropdown(creditScore);
    
    // Default sales price
    const defaultSalesPrice = 225000;
    
    // Calculate down payment amount from percentage if provided
    let downPayment: string | undefined = undefined;
    if (downPaymentPercent && loanPurpose === 'Purchase') {
      const percent = parseFloat(downPaymentPercent);
      const amount = (defaultSalesPrice * percent) / 100;
      downPayment = amount.toFixed(0);
    }
    
    console.log('📝 Questionnaire mapping:', {
      original: creditScore,
      mapped: mappedCreditScore,
      loanPurpose,
      loanType,
      downPaymentPercent,
      downPayment
    });
    
    // Create form data from questionnaire - map to form fields
    const formDataPartial: Partial<SearchFormData> = {
      zipCode: '75024',
      salesPrice: loanPurpose === 'Purchase' ? defaultSalesPrice.toString() : undefined,
      downPayment: downPayment || (loanPurpose === 'Purchase' ? '75000' : undefined),
      downPaymentPercent: downPaymentPercent || (loanPurpose === 'Purchase' ? '33.33' : undefined),
      creditScore: mappedCreditScore, // Use mapped value
      propertyType: 'SingleFamily',
      occupancy: 'PrimaryResidence',
      loanType: loanType,
      loanTerm: '30',
      loanPurpose: loanPurpose,
      // For refinance: only loan amount, no home value or cash out
      mortgageBalance: loanPurpose === 'Refinance' ? '360000' : undefined,
      vaFirstTimeUse: vaFirstTimeUse,
      militaryVeteran: loanType === 'VA',
      // Keep other defaults
      eligibleForLowerRate: false,
      firstName: 'test',
      lastName: 'test1',
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
      waiveEscrow: false,
      lockDays: '',
      secondMortgageAmount: '',
      amortizationTypes: ["Fixed", "ARM"],
      armFixedTerms: ["ThreeYear", "FiveYear", "SevenYear", "TenYear"],
      loanTerms: ["ThirtyYear", "TwentyYear", "TwentyFiveYear", "FifteenYear", "TenYear"]
    };

    // Store questionnaire form data to pass to MortgageSearchForm
    setQuestionnaireFormData(formDataPartial);

    // Create full form data for search
    const formData: SearchFormData = {
      zipCode: formDataPartial.zipCode || '75024',
      salesPrice: formDataPartial.salesPrice || '225000',
      downPayment: formDataPartial.downPayment || '75000',
      downPaymentPercent: formDataPartial.downPaymentPercent || '33.33',
      creditScore: formDataPartial.creditScore || '740-759',
      propertyType: formDataPartial.propertyType || 'SingleFamily',
      occupancy: formDataPartial.occupancy || 'PrimaryResidence',
      loanType: formDataPartial.loanType || 'Conventional',
      loanTerm: formDataPartial.loanTerm || '30',
      eligibleForLowerRate: formDataPartial.eligibleForLowerRate || false,
      loanPurpose: formDataPartial.loanPurpose || 'Purchase',
      homeValue: formDataPartial.homeValue || '450000',
      mortgageBalance: formDataPartial.mortgageBalance || '360000',
      cashOut: formDataPartial.cashOut || '0',
      ltv: formDataPartial.ltv || '80.00',
      firstName: formDataPartial.firstName || 'test',
      lastName: formDataPartial.lastName || 'test1',
      vaFirstTimeUse: formDataPartial.vaFirstTimeUse || false,
      firstTimeHomeBuyer: formDataPartial.firstTimeHomeBuyer || false,
      monthsReserves: formDataPartial.monthsReserves || 24,
      selfEmployed: formDataPartial.selfEmployed || true,
      waiveEscrows: formDataPartial.waiveEscrows || false,
      county: formDataPartial.county || 'Collin',
      state: formDataPartial.state || 'TX',
      numberOfStories: formDataPartial.numberOfStories || 1,
      numberOfUnits: formDataPartial.numberOfUnits || 'OneUnit',
      lienType: formDataPartial.lienType || 'First',
      borrowerPaidMI: formDataPartial.borrowerPaidMI || 'Yes',
      baseLoanAmount: formDataPartial.baseLoanAmount || 150000,
      loanLevelDebtToIncomeRatio: formDataPartial.loanLevelDebtToIncomeRatio || 18,
      totalMonthlyQualifyingIncome: formDataPartial.totalMonthlyQualifyingIncome || 9000,
      waiveEscrow: formDataPartial.waiveEscrow || false,
      militaryVeteran: formDataPartial.militaryVeteran || false,
      lockDays: formDataPartial.lockDays || '',
      secondMortgageAmount: formDataPartial.secondMortgageAmount || '',
      amortizationTypes: formDataPartial.amortizationTypes || ["Fixed", "ARM"],
      armFixedTerms: formDataPartial.armFixedTerms || ["ThreeYear", "FiveYear", "SevenYear", "TenYear"],
      loanTerms: formDataPartial.loanTerms || ["ThirtyYear", "TwentyYear", "TwentyFiveYear", "FifteenYear", "TenYear"]
    };

    return formData;
  };

  // Handle search - transform form data to Mortech API format
  const handleSearch = async (formData: SearchFormData, email?: string) => {
    setLoading(true);
    setError(null);
    setValidationMessage(null);
    
    try {
      let propertyValue: number;
      
      let calculatedLoanAmount: number;
      let calculatedDownPayment: number | undefined;
      
      if (formData.loanPurpose === 'Refinance') {
        // For refinance: loan amount = mortgage balance (no cash out field)
        const mortgageBalance = parseFloat(formData.mortgageBalance || '0');
        calculatedLoanAmount = mortgageBalance;
        calculatedDownPayment = undefined; // No down payment for refinance
        // Property value = loan amount (used for API, but not shown in form)
        propertyValue = calculatedLoanAmount;
        
        // Validation for refinance
        if (mortgageBalance <= 0) {
          setValidationMessage('⚠️ Please enter a valid loan amount.');
          setLoading(false);
          return;
        }
      } else {
        // For purchase: loan amount = sales price - down payment
        const salesPrice = parseFloat(formData.salesPrice || '0');
        calculatedDownPayment = parseFloat(formData.downPayment || '0');
        calculatedLoanAmount = salesPrice - calculatedDownPayment;
        propertyValue = salesPrice;
        
        // Validation for purchase
        if (salesPrice > 0 && calculatedLoanAmount > salesPrice) {
          setValidationMessage('⚠️ Loan amount cannot be more than the property value. Please adjust your down payment or purchase price.');
          setLoading(false);
          return;
        }
        if (salesPrice <= 0) {
          setValidationMessage('⚠️ Please enter a valid property value.');
          setLoading(false);
          return;
        }
        if (calculatedDownPayment < 0) {
          setValidationMessage('⚠️ Down payment cannot be negative.');
          setLoading(false);
          return;
        }
      }
      
      // Store loan amount and down payment for lead capture
      setLoanAmount(calculatedLoanAmount);
      setDownPayment(calculatedDownPayment);

      // Build Mortech API request
      const request: any = {
        propertyZip: formData.zipCode || '75024',
        appraisedvalue: propertyValue,
        loan_amount: calculatedLoanAmount,
        fico: mapCreditScore(formData.creditScore),
        loanpurpose: formData.loanPurpose as 'Purchase' | 'Refinance',
        proptype: mapPropertyTypeToMortech(formData.propertyType),
        occupancy: mapOccupancyToMortech(formData.occupancy),
        loanProduct1: normalizeLoanTerm(formData.loanTerm || '30')
      };
      
      // Validate required fields
      if (!request.propertyZip || request.propertyZip.trim() === '') {
        setValidationMessage('⚠️ Please enter a valid ZIP code.');
        setLoading(false);
        return;
      }
      if (request.appraisedvalue <= 0) {
        setValidationMessage('⚠️ Please enter a valid property value.');
        setLoading(false);
        return;
      }
      if (request.loan_amount <= 0) {
        setValidationMessage('⚠️ Please enter a valid loan amount.');
        setLoading(false);
        return;
      }

      // Optional fields - only include if explicitly set
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

      console.log('📤 Sending request to Mortech API:', request);

      // Build headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Get auth token if user is authenticated
      let authToken: string | null = null;
      if (user) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          authToken = session?.access_token || null;
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }
        } catch (error) {
          console.warn('⚠️ Failed to get auth token:', error);
        }
      }
      
      // Include email if provided (for unauthenticated users or testing)
      const requestBody = email ? { ...request, email } : request;

      const response = await fetch('/api/mortech/search', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log('📥 Received response from Mortech API:', result);

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
        setRawData(result.rates);
        console.log('✅ Rates loaded:', transformed.length);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!pendingAutoSearchData || !questionnaireFormData) {
      return;
    }

    // Pass verifiedEmail to handleSearch for unauthenticated users
    handleSearch(pendingAutoSearchData, verifiedEmail || undefined);
    setPendingAutoSearchData(null);
  }, [pendingAutoSearchData, questionnaireFormData, verifiedEmail, handleSearch]);

  // Get template content
  const getTemplateContent = () => {
    if (template === 'template1') {
      return {
        title: "Get Your Custom Rate",
        subtitle: "Personalized Mortgage Solutions",
        description: "Answer a few quick questions to get personalized loan recommendations and compare real-time rates from multiple lenders. Our intelligent questionnaire helps you find the ideal loan for your unique situation.",
        primaryButton: "Get My Custom Rate",
        secondaryButton: "Compare All Rates"
      };
    } else {
      return {
        title: "Get Your Custom Rate",
        subtitle: "Tailored Mortgage Solutions", 
        description: "Complete our smart questionnaire to receive personalized loan recommendations and compare real-time rates from multiple lenders. Find the perfect mortgage solution for your specific needs.",
        primaryButton: "Get My Custom Rate",
        secondaryButton: "View All Rates"
      };
    }
  };

  const getTemplateButtonStyles = (buttonType: 'primary' | 'secondary') => {
    if (buttonType === 'primary') {
      return {
        variant: 'primary' as const,
        className: 'flex items-center space-x-2 px-6 py-4 text-base font-medium transition-colors',
        style: { 
          backgroundColor: colors.primary,
          color: colors.background,
          borderRadius: `${layout.borderRadius}px`,
          border: 'none'
        }
      };
    } else {
      return {
        variant: 'secondary' as const,
        className: 'flex items-center space-x-2 px-6 py-4 text-base font-medium transition-colors',
        style: { 
          backgroundColor: colors.primary,
          color: colors.background,
          borderRadius: `${layout.borderRadius}px`,
          border: 'none'
        }
      };
    }
  };

  // Render questionnaire step
  const renderQuestionnaireStep = () => {
    switch (currentStep) {
      case 'landing':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">Select Your Loan Purpose</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Choose the option that best describes your situation</p>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-credit-score', { loanPurpose: 'Purchase' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.homePurchase, { size: 20, color: colors.background })}
                  <span>Home Purchase</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('refinance-veteran', { loanPurpose: 'Refinance' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.homeRefinance, { size: 20, color: colors.background })}
                  <span>Home Refinance</span>
                </div>
              </Button>
            </div>
          </div>
        );

      case 'purchase-credit-score':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">What's Your Credit Score?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Your credit score helps determine which loan options are available to you</p>
            <div className="grid grid-cols-2 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireStepChange('fha-loan', { creditScore: 'Below 580', loanType: 'FHA' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.rates, { size: 20, color: colors.background })}
                  <span>Below 580</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-down-payment-low', { creditScore: '580-619' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>580-619</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-down-payment-mid', { creditScore: '620-639' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.trendingUp, { size: 20, color: colors.background })}
                  <span>620-639</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-military', { creditScore: '640-679' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.star, { size: 20, color: colors.background })}
                  <span>640 to 679</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-military', { creditScore: '680-719' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.trendingUp, { size: 20, color: colors.background })}
                  <span>680 to 719</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-military', { creditScore: '720+' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.star, { size: 20, color: colors.background })}
                  <span>720 or higher</span>
                </div>
              </Button>
            </div>
          </div>
        );

      case 'purchase-military':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">Are You a Veteran or Active Military?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>VA loans offer excellent benefits including no down payment requirements</p>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'VA', vaFirstTimeUse: true })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.star, { size: 20, color: colors.background })}
                  <span>Yes</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-rural', { loanType: 'Conventional' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.cancel, { size: 20, color: colors.background })}
                  <span>No</span>
                </div>
              </Button>
            </div>
          </div>
        );

      case 'purchase-rural':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">Is the Property in a Rural Area?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>USDA loans are available for properties in eligible rural areas</p>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'USDA' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                {React.createElement(icons.check, { size: 20 })}
                <span>Yes</span>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                {React.createElement(icons.cancel, { size: 20 })}
                No
              </Button>
            </div>
          </div>
        );

      case 'purchase-down-payment-low':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">How Much Can You Put Down?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Your down payment amount affects your loan options and monthly payments</p>
            <div className="grid grid-cols-2 gap-2 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'FHA', downPaymentPercent: '3.5' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-1 @sm:space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>Less than 3.5%</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional', dpa: true, downPaymentPercent: '3.5' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-1 @sm:space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>3.5% or more</span>
                </div>
              </Button>
            </div>
          </div>
        );

      case 'purchase-down-payment-mid':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">How Much Can You Put Down?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Your down payment amount affects your loan options and monthly payments</p>
            <div className="grid grid-cols-2 @md:grid-cols-3 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional', dpa: true, downPaymentPercent: '3' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>Less than 3%</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'FHA', downPaymentPercent: '4' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>3-5%</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional', downPaymentPercent: '5' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base col-span-2 @md:col-span-1"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>5% or more</span>
                </div>
              </Button>
            </div>
          </div>
        );

      case 'refinance-veteran':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">Are You a Veteran?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Veterans have access to special refinance programs with great benefits</p>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireStepChange('refinance-veteran-purpose', { loanType: 'VA' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                {React.createElement(icons.star, { size: 20 })}
                Yes
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('refinance-non-veteran-purpose', { loanType: 'Conventional' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                {React.createElement(icons.cancel, { size: 20 })}
                No
              </Button>
            </div>
          </div>
        );

      case 'refinance-veteran-purpose':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">What's Your Refinance Goal?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Choose your primary refinance objective</p>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'VA', cashOut: true })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>Access Equity</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'VA', irrrl: true })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.rates, { size: 20, color: colors.background })}
                  <span>Lower Rate</span>
                </div>
              </Button>
            </div>
          </div>
        );

      case 'refinance-non-veteran-purpose':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">What's Your Refinance Goal?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Choose your primary refinance objective</p>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional', cashOut: true })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>Access Equity</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional', refinance: true })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.rates, { size: 20, color: colors.background })}
                  <span>Lower Rate</span>
                </div>
              </Button>
            </div>
          </div>
        );

      case 'fha-loan':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold mb-2 text-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: colors.text }}>
              {React.createElement(icons.target, { size: 24 })}
              Recommended: FHA Loan
            </h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.primary }}>An FHA loan might be ideal for you, offering lower down payment requirements and more flexible credit guidelines.</p>
            <div className="flex justify-center">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'FHA' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base px-8"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.custom, { size: 20, color: colors.background })}
                  <span>Get My Custom Rate</span>
                </div>
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-0 @sm:p-6 bg-white shadow-sm border border-gray-200 mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">Select Your Loan Purpose</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Choose the option that best describes your situation</p>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-credit-score', { loanPurpose: 'Purchase' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.homePurchase, { size: 20, color: colors.background })}
                  <span> Home Purchase</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('refinance-veteran', { loanPurpose: 'Refinance' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.homeRefinance, { size: 20, color: colors.background })}
                  <span> Home Refinance</span>
                </div>
              </Button>
            </div>
          </div>
        );
    }
  };

  // Handle URL parameters from loan finder
  useEffect(() => {
    const loanType = searchParams.get('loanType');
    if (loanType) {
      setShowLanding(false); // Show search form when coming from loan finder
    }
  }, [searchParams]);

  // Show landing page by default
  if (showLanding) {
    return (
      <div className="">
        {/* Header */}
        {showHeader && (
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl sm:max-w-full mx-auto px-3 sm:px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Mortgage Rate Comparison</h1>
                </div>
                <div className="text-xs sm:text-sm" style={{ color: colors.text }}>Powered by Mortech</div>
              </div>
            </div>
          </header>
        )}

        {/* Hero Section */}
        <main className="max-w-7xl sm:max-w-full mx-auto px-3 sm:px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-6">
              {getTemplateContent().title}
              <span style={{ color: colors.primary }}> Mortgage</span>
            </h1>
            <p className="text-base mb-8 w-[700px]  mx-auto" style={{ color: colors.text }}>
              {getTemplateContent().description}
            </p>
            
            <div className="flex flex-col @xl:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => {
                  setShowLanding(false);
                  setShowQuestionnaire(true);
                }}
                className="flex items-center justify-center space-x-2 px-4 py-3 @xl:px-8 @xl:py-4 text-sm @xl:text-lg font-semibold transition-colors shadow-lg w-full @xl:w-auto"
                style={{ 
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                {React.createElement(icons.target, { size: 20, color: colors.background })}
                <span className='text-sm @sm:text-base'>{getTemplateContent().primaryButton}</span>
              </button>
              <button 
                onClick={() => setShowLanding(false)}
                className="flex items-center justify-center space-x-2 px-[14px] py-[10px] @xl:px-[30px] @xl:py-[14px] text-sm @xl:text-lg font-semibold transition-colors border-2 w-full @xl:w-auto"
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.primary,
                  borderColor: colors.primary,
                  borderRadius: `${layout.borderRadius}px`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary + '10';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background;
                }}
              >
                {React.createElement(icons.rates, { size: 20, color: colors.primary })}
                <span className='text-sm @sm:text-base'>{getTemplateContent().secondaryButton}</span>
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        {showFooter && <SynclyFooter />}
      </div>
    );
  }

  // Show questionnaire section
  if (showQuestionnaire) {
    return (
      <div className={` bg-gray-50 ${className}`}>
        {/* Header */}
        {showHeader && (
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl sm:max-w-full mx-auto px-3 sm:px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center space-x-3 sm:space-x-6 flex-1 sm:flex-initial">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Get My Custom Rate</h1>
                  <button 
                    onClick={() => {
                      setShowQuestionnaire(false);
                      setShowLanding(true);
                    }}
                    className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: colors.background,
                      color: colors.primary,
                      border: `1px solid ${colors.primary}`,
                      borderRadius: `${layout.borderRadius}px`
                    }}
                  >
                    <span>← Back to Home</span>
                  </button>
                </div>
                <div className="text-xs sm:text-sm" style={{ color: colors.text }}>Powered by Mortech</div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="max-w-4xl sm:max-w-full mx-auto px-3 sm:px-4 py-8">
          <div className="max-w-3xl sm:max-w-full mx-auto">
            {/* Back Button */}
            {(currentStep !== 'landing' || showEmailVerification) && (
              <div className="mb-6">
                <Button 
                  onClick={handleQuestionnaireBack}
                  variant="ghost"
                  size="sm"
                  className="font-medium transition-colors duration-200 p-2 pr-4 border"
                  style={{ 
                    color: colors.primary,
                  }}
                >
                  <div className="flex items-center justify-center space-x-1">
                    {React.createElement(icons.chevronLeft, { size: 20, color: colors.primary })}
                    <span className='pb-0.5'>Back</span>
                  </div>
                </Button>
              </div>
            )}
            
            {/* Email Verification Step (for unauthenticated users) */}
            {showEmailVerification && (
              <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
                {emailVerificationStep === 'email' && (
                  <>
                    {/* Header Section */}
                    <div className="mb-8 text-center px-2">
                      <h2 className="text-xl @sm:text-2xl @md:text-3xl font-bold mb-4" style={{ color: colors.text }}>
                        View Your Personalized Mortgage Rates in Seconds!
                      </h2>
                      <p className="text-sm @sm:text-base leading-relaxed max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>
                        Enter your details to see real-time rates tailored specifically for your credit and location. No credit pull required. Takes less than 30 seconds.
                      </p>
                    </div>
                    
                  </>
                )}
                
                {emailVerificationStep === 'email' && (
                  <div className="space-y-4">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                        Name <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setNameError(null);
                        }}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-2 border rounded-lg"
                        style={{
                          borderColor: nameError ? 'red' : colors.border,
                          borderRadius: `${layout.borderRadius}px`,
                          outline: 'none'
                        }}
                      />
                      {nameError && (
                        <p className="mt-1 text-sm text-red-600">{nameError}</p>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                        Phone Number <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setPhoneError(null);
                        }}
                        placeholder="Enter your phone number"
                        className="w-full px-4 py-2 border rounded-lg"
                        style={{
                          borderColor: phoneError ? 'red' : colors.border,
                          borderRadius: `${layout.borderRadius}px`,
                          outline: 'none'
                        }}
                      />
                      {phoneError && (
                        <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                      )}
                    </div>

                    {/* Email Field with Send Code Button */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                        Email Address <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError(null);
                          }}
                          placeholder="your.email@example.com"
                          className="flex-1 px-4 py-2 border rounded-lg"
                          style={{
                            borderColor: emailError ? 'red' : colors.border,
                            borderRadius: `${layout.borderRadius}px`,
                            outline: 'none'
                          }}
                        />
                        <Button
                          onClick={handleSendOTP}
                          disabled={isSendingOTP || !name.trim() || !phone.trim() || !email.trim()}
                          {...getTemplateButtonStyles('secondary')}
                          className="h-10 @sm:h-12 px-4 py-2 whitespace-nowrap"
                        >
                          {isSendingOTP ? 'Sending...' : 'Send Code'}
                        </Button>
                      </div>
                      {emailError && (
                        <p className="mt-1 text-sm text-red-600">{emailError}</p>
                      )}
                    </div>

                    
                    {/* Additional Information */}
                    <div className="mt-5 p-4 rounded-lg" style={{ 
                      backgroundColor: `${colors.primary}08`,
                      border: `1px solid ${colors.primary}20`
                    }}>
                      <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
                        To protect your data and ensure accuracy, we'll send a secure verification code to your inbox. Verify your email on the next screen to instantly access your custom rates!
                      </p>
                    </div>
                  </div>
                )}
                
                {emailVerificationStep === 'verify' && (
                  <div className="space-y-4">
                    <p className="text-sm text-center" style={{ color: colors.text }}>
                      Verification code sent to <strong>{email}</strong>
                    </p>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                        Enter Verification Code
                      </label>
                      <div className="flex flex-col @lg:flex-row gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={otpCode}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setOtpCode(numericValue);
                            setOtpError(null);
                          }}
                          placeholder="000000"
                          maxLength={6}
                          className="flex-1 px-4 py-2 border rounded-lg text-center text-xl tracking-widest font-mono"
                          style={{
                            borderColor: otpError ? 'red' : colors.border,
                            borderRadius: `${layout.borderRadius}px`,
                            outline: 'none'
                          }}
                        />
                        <Button
                          onClick={handleVerifyOTP}
                          disabled={isVerifyingOTP || otpCode.length !== 6}
                          {...getTemplateButtonStyles('secondary')}
                          className="h-10 @sm:h-12 px-4 py-2"
                        >
                          {isVerifyingOTP ? 'Verifying...' : 'Verify'}
                        </Button>
                      </div>
                      {otpError && (
                        <p className="mt-2 text-sm text-red-600">{otpError}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEmailVerificationStep('email');
                          setOtpCode('');
                          setOtpError(null);
                        }}
                        className="mt-2 text-sm"
                        style={{ color: colors.primary }}
                      >
                        Change email address
                      </button>
                    </div>
                  </div>
                )}
                
                {emailVerificationStep === 'verified' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-green-800 font-medium">
                      ✓ Email verified: {email}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Questionnaire Content - Container Query Wrapper */}
            {!showEmailVerification && (
              <div style={{ containerType: 'inline-size' }}>
                {renderQuestionnaireStep()}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        {showFooter && <SynclyFooter />}
      </div>
    );
  }

  // Show search form and results
  return (
      <div className={` bg-gray-50 ${className}`}>
      {/* Header */}
      {showHeader && (
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl sm:max-w-full mx-auto px-3 sm:px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Mortgage Rate Comparison</h1>
                <button 
                  onClick={() => {
                    setShowQuestionnaire(true);
                    setShowLanding(false);
                  }}
                  className="text-[#01bcc6] hover:text-[#008eab] font-medium"
                >
                  Find Your Ideal Loan
                </button>
              </div>
              <div className="text-xs sm:text-sm" style={{ color: colors.text }}>
                Powered by Mortech
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-7xl sm:max-w-full mx-auto px-3 sm:px-4 py-8">
        {/* Search Form */}
        <MortgageSearchForm 
          onSearch={handleSearch} 
          loading={loading} 
          template={template}
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
          initialValues={questionnaireFormData}
          verifiedEmail={verifiedEmail || undefined}
        />

        {/* Validation Message */}
        {validationMessage && (
          <div
            style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: `${layout.borderRadius}px`,
              padding: '16px',
              color: '#92400e',
              marginTop: '16px'
            }}
          >
            <p className="font-semibold">⚠️ Notice</p>
            <p className="text-sm">{validationMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 mb-8" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-900">Error</h3>
                <div className="mt-2 text-sm text-red-800">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <RateResults 
          products={products} 
          loading={loading} 
          rawData={rawData} 
          template={template}
          isMockData={false}
          dataSource="mortech"
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
          userId={userId}
          companyId={companyId}
          loanAmount={loanAmount}
          downPayment={downPayment}
        />
      </main>

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

      {/* Footer */}
      {showFooter && <SynclyFooter />}
      </div>
  );
});

export default MortgageRateComparison;
