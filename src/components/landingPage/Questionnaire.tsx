'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import { typography, colors, spacing, borderRadius, shadows, getTemplateStyles } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';

// Memoized step map to prevent recreation on every render
const STEP_MAP: Record<string, number> = {
  'landing': 0,
  'purchase-credit-score': 1,
  'refinance-veteran': 1,
  'purchase-down-payment-low': 2,
  'purchase-down-payment-mid': 2,
  'purchase-military': 2,
  'purchase-rural': 3,
  'purchase-construction': 3,
  'purchase-selling-home': 3,
  'refinance-veteran-purpose': 2,
  'refinance-non-veteran-purpose': 2,
  'refinance-veteran-equity': 3,
  'refinance-non-veteran-equity': 3,
  'refinance-lower-rate': 3,
};

interface QuestionnaireProps {
  template?: 'template1' | 'template2';
}

function Questionnaire({ template = 'template1' }: QuestionnaireProps) {
  const templateStyles = getTemplateStyles(template);
  const [currentStep, setCurrentStep] = useState('landing');
  const [stepHistory, setStepHistory] = useState<string[]>(['landing']);
  const [isFinalized, setIsFinalized] = useState(false);

  // Memoized handlers to prevent unnecessary re-renders
  const handleStepChange = useCallback((step: string) => {
    setStepHistory(prev => [...prev, step]);
    setCurrentStep(step);
  }, []);

  const handleBack = useCallback(() => {
    if (stepHistory.length > 1) {
      const newHistory = stepHistory.slice(0, -1);
      setStepHistory(newHistory);
      setCurrentStep(newHistory[newHistory.length - 1]);
      setIsFinalized(false); // Reset finalized state when going back
    }
  }, [stepHistory]);

  const handleFinalize = useCallback(() => {
    setIsFinalized(true);
    // You can add additional logic here like analytics tracking, etc.
    console.log('Questionnaire finalized!', {
      currentStep,
      stepHistory,
      finalRecommendation: currentStep
    });
  }, [currentStep, stepHistory]);

  // Memoized calculations
  const stepNumber = useMemo(() => {
    return STEP_MAP[currentStep] || 0;
  }, [currentStep]);

  const totalSteps = useMemo(() => {
    if (currentStep.includes('purchase-')) return 4;
    if (currentStep.includes('refinance-')) return 4;
    return 1;
  }, [currentStep]);

  // Memoized progress indicator visibility
  const showProgress = useMemo(() => {
    return currentStep !== 'landing' && 
           !currentStep.includes('-loan') && 
           !currentStep.includes('heloc') && 
           !currentStep.includes('refinance') && 
           !currentStep.includes('streamline') && 
           !currentStep.includes('irrrl');
  }, [currentStep]);

  // Memoized check if user is on a result page
  const isOnResultPage = useMemo(() => {
    return currentStep.includes('-loan') || 
           currentStep.includes('heloc') || 
           currentStep.includes('refinance') || 
           currentStep.includes('streamline') || 
           currentStep.includes('irrrl');
  }, [currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 'landing':
        return (
          <div style={{ 
            backgroundColor: colors.white, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text.primary, 
              marginBottom: spacing.sm 
            }}>
              Select Your Loan Purpose
            </h3>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.text.secondary, 
              marginBottom: spacing.lg 
            }}>
              Choose the option that best describes your situation
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('purchase-credit-score')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm,
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: templateStyles.primary.color,
                  color: colors.white,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <icons.homePurchase size={20} />
                Home Purchase
              </button>
              <button 
                onClick={() => handleStepChange('refinance-veteran')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm,
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: templateStyles.primary.color,
                  color: colors.white,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <icons.homeRefinance size={20} />
                Home Refinance
              </button>
            </div>
          </div>
        );

      case 'purchase-credit-score':
        return (
          <div style={{ 
            backgroundColor: colors.white, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text.primary, 
              marginBottom: spacing.sm 
            }}>
              What&apos;s Your Credit Score?
            </h3>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.text.secondary, 
              marginBottom: spacing.lg 
            }}>
              Your credit score helps determine which loan options are available to you
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('fha-loan')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm,
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: templateStyles.primary.color,
                  color: colors.white,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <icons.rates size={20} />
                Below 580
              </button>
              <button 
                onClick={() => handleStepChange('purchase-down-payment-low')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm,
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: templateStyles.primary.color,
                  color: colors.white,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <icons.calculators size={20} />
                580-619
              </button>
              <button 
                onClick={() => handleStepChange('purchase-down-payment-mid')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm,
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: templateStyles.primary.color,
                  color: colors.white,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <icons.trendingUp size={20} />
                620-639
              </button>
              <button 
                onClick={() => handleStepChange('purchase-military')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm,
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: templateStyles.primary.color,
                  color: colors.white,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <icons.star size={20} />
                640 or higher
              </button>
            </div>
          </div>
        );

      case 'purchase-down-payment-low':
        return (
          <div style={{ 
            backgroundColor: colors.white, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text.primary, 
              marginBottom: spacing.sm 
            }}>
              How Much Can You Put Down?
            </h3>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.text.secondary, 
              marginBottom: spacing.lg 
            }}>
              Your down payment amount affects your loan options and monthly payments
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('fha-loan')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm,
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: templateStyles.primary.color,
                  color: colors.white,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <icons.calculators size={20} />
                Less than 3.5%
              </button>
              <button 
                onClick={() => handleStepChange('dpa-loan')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm,
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: templateStyles.primary.color,
                  color: colors.white,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <icons.calculators size={20} />
                3.5% or more
              </button>
            </div>
          </div>
        );

      case 'purchase-down-payment-mid':
        return (
          <div style={{ 
            backgroundColor: colors.white, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text.primary, 
              marginBottom: spacing.lg 
            }}>
              How Much Can You Put Down?
            </h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('dpa-loan')}
                style={{ 
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: templateStyles.primary.color,
                  color: colors.white,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Less than 3%
              </button>
              <button 
                onClick={() => handleStepChange('fha-loan')}
                style={{ 
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: templateStyles.primary.color,
                  color: colors.white,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                3-5%
              </button>
              <button 
                onClick={() => handleStepChange('conventional-loan')}
                style={{ 
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: templateStyles.primary.color,
                  color: colors.white,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                5% or more
              </button>
            </div>
          </div>
        );

      case 'purchase-military':
        return (
          <div style={{ 
            backgroundColor: colors.white, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text.primary, 
              marginBottom: spacing.sm 
            }}>
              Are You a Veteran or Active Military?
            </h3>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.text.secondary, 
              marginBottom: spacing.lg 
            }}>
              VA loans offer excellent benefits including no down payment requirements
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('va-loan')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm,
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: templateStyles.primary.color,
                  color: colors.white,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <icons.star size={20} />
                Yes
              </button>
              <button 
                onClick={() => handleStepChange('purchase-rural')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm,
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: templateStyles.primary.color,
                  color: colors.white,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <icons.cancel size={20} />
                No
              </button>
            </div>
          </div>
        );

      case 'purchase-rural':
        return (
          <div className="score-card">
            <h3>Is the Property in a Rural Area?</h3>
            <button 
              onClick={() => handleStepChange('usda-loan')}
              className="button"
            >
              Yes
            </button>
            <button 
              onClick={() => handleStepChange('purchase-construction')}
              className="button"
            >
              No
            </button>
          </div>
        );

      case 'purchase-construction':
        return (
          <div className="score-card">
            <h3>Do You Need to Finance Construction?</h3>
            <button 
              onClick={() => handleStepChange('construction-loan')}
              className="button"
            >
              Yes
            </button>
            <button 
              onClick={() => handleStepChange('purchase-selling-home')}
              className="button"
            >
              No
            </button>
          </div>
        );

      case 'purchase-selling-home':
        return (
          <div className="score-card">
            <h3>Are You Selling Your Current Home?</h3>
            <button 
              onClick={() => handleStepChange('bridge-loan')}
              className="button"
            >
              Yes
            </button>
            <button 
              onClick={() => handleStepChange('conventional-loan')}
              className="button"
            >
              No
            </button>
          </div>
        );

      case 'refinance-veteran':
        return (
          <div className="score-card">
            <h3>Are You a Veteran?</h3>
            <p>Veterans have access to special refinance programs with great benefits</p>
            <div className="button-grid">
              <button 
                onClick={() => handleStepChange('refinance-veteran-purpose')}
                className="button"
                style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}
              >
                <icons.star size={20} />
                Yes
              </button>
              <button 
                onClick={() => handleStepChange('refinance-non-veteran-purpose')}
                className="button"
                style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}
              >
                <icons.cancel size={20} />
                No
              </button>
            </div>
          </div>
        );

      case 'refinance-veteran-purpose':
        return (
          <div className="score-card">
            <h3>What&apos;s Your Refinance Goal?</h3>
            <button 
              onClick={() => handleStepChange('refinance-veteran-equity')}
              className="button"
            >
              Access Equity
            </button>
            <button 
              onClick={() => handleStepChange('va-irrrl')}
              className="button"
            >
              Lower Rate
            </button>
          </div>
        );

      case 'refinance-veteran-equity':
        return (
          <div className="score-card">
            <h3>How Do You Want to Access Equity?</h3>
            <button 
              onClick={() => handleStepChange('heloc')}
              className="button"
            >
              Open Line of Credit
            </button>
            <button 
              onClick={() => handleStepChange('cash-out-refinance')}
              className="button"
            >
              Cash Out Equity
            </button>
          </div>
        );

      case 'refinance-non-veteran-purpose':
        return (
          <div className="score-card">
            <h3>What&apos;s Your Refinance Goal?</h3>
            <button 
              onClick={() => handleStepChange('refinance-non-veteran-equity')}
              className="button"
            >
              Access Equity
            </button>
            <button 
              onClick={() => handleStepChange('refinance-lower-rate')}
              className="button"
            >
              Lower Rate
            </button>
          </div>
        );

      case 'refinance-non-veteran-equity':
        return (
          <div className="score-card">
            <h3>How Do You Want to Access Equity?</h3>
            <button 
              onClick={() => handleStepChange('heloc')}
              className="button"
            >
              Open Line of Credit
            </button>
            <button 
              onClick={() => handleStepChange('cash-out-refinance')}
              className="button"
            >
              Cash Out Equity
            </button>
          </div>
        );

      case 'refinance-lower-rate':
        return (
          <div className="score-card">
            <h3>What&apos;s Your Current Loan Type?</h3>
            <button 
              onClick={() => handleStepChange('fha-streamline')}
              className="button"
            >
              FHA
            </button>
            <button 
              onClick={() => handleStepChange('usda-streamline')}
              className="button"
            >
              USDA
            </button>
            <button 
              onClick={() => handleStepChange('conventional-streamline')}
              className="button"
            >
              Conventional
            </button>
            <button 
              onClick={() => handleStepChange('rate-term-refinance')}
              className="button"
            >
              Other/Not Sure
            </button>
          </div>
        );

      // Result Cards
      case 'conventional-loan':
        return (
          <div className="score-card result">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <icons.target size={24} />
              Recommended: Conventional Loan
            </h3>
            <p>A conventional loan might be your best option. These loans often offer competitive rates and flexible terms.</p>
            <div className="button-grid">
              <Link href="/?loanType=Conventional" className="button" style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                <icons.applyNow size={20} />
                Get Started
              </Link>
            </div>
          </div>
        );

      case 'va-loan':
        return (
          <div className="score-card result">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <icons.target size={24} />
              Recommended: VA Loan
            </h3>
            <p>As a veteran or active military member, a VA loan could offer you excellent benefits, including no down payment options.</p>
            <div className="button-grid">
              <Link href="/?loanType=VA" className="button" style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                <icons.applyNow size={20} />
                Get Started
              </Link>
            </div>
          </div>
        );

      case 'fha-loan':
        return (
          <div className="score-card result">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <icons.target size={24} />
              Recommended: FHA Loan
            </h3>
            <p>An FHA loan might be ideal for you, offering lower down payment requirements and more flexible credit guidelines.</p>
            <div className="button-grid">
              <Link href="/?loanType=FHA" className="button" style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                <icons.applyNow size={20} />
                Get Started
              </Link>
            </div>
          </div>
        );

      case 'usda-loan':
        return (
          <div className="score-card result">
            <h3>Recommended: USDA Loan</h3>
            <p>For rural properties, a USDA loan could offer you favorable terms, including potentially no down payment.</p>
            <Link href="/?loanType=USDA" className="button">
              Get Started
            </Link>
          </div>
        );

      case 'dpa-loan':
        return (
          <div className="score-card result">
            <h3>Recommended: Down Payment Assistance (DPA) Loan</h3>
            <p>A DPA loan could help you with your down payment, making homeownership more accessible.</p>
            <Link href="/?loanType=Conventional&dpa=true" className="button">
              Get Started
            </Link>
          </div>
        );

      case 'construction-loan':
        return (
          <div className="score-card result">
            <h3>Recommended: Construction Loan</h3>
            <p>A construction loan can help you finance both the purchase of land and the construction of your new home.</p>
            <Link href="/?loanType=Conventional&construction=true" className="button">
              Get Started
            </Link>
          </div>
        );

      case 'bridge-loan':
        return (
          <div className="score-card result">
            <h3>Recommended: Bridge Loan</h3>
            <p>A bridge loan can help you manage the transition between selling your current home and buying a new one.</p>
            <Link href="/?loanType=Conventional&bridge=true" className="button">
              Get Started
            </Link>
          </div>
        );

      case 'heloc':
        return (
          <div className="score-card result">
            <h3>Recommended: Home Equity Line of Credit (HELOC)</h3>
            <p>A HELOC can provide you with flexible access to your home&apos;s equity for various purposes.</p>
            <Link href="/?loanType=HELOC" className="button">
              Get Started
            </Link>
          </div>
        );

      case 'cash-out-refinance':
        return (
          <div className="score-card result">
            <h3>Recommended: Cash-Out Refinance</h3>
            <p>A cash-out refinance can help you access your home&apos;s equity while potentially improving your loan terms.</p>
            <Link href="/?loanType=Conventional&cashOut=true" className="button">
              Get Started
            </Link>
          </div>
        );

      case 'rate-term-refinance':
        return (
          <div className="score-card result">
            <h3>Recommended: Rate and Term Refinance</h3>
            <p>A rate and term refinance could help you lower your interest rate or adjust your loan term to better suit your needs.</p>
            <Link href="/?loanType=Conventional&refinance=true" className="button">
              Get Started
            </Link>
          </div>
        );

      case 'va-irrrl':
        return (
          <div className="score-card result">
            <h3>Recommended: VA Interest Rate Reduction Refinance Loan (IRRRL)</h3>
            <p>The VA IRRRL program offers a streamlined way for VA loan holders to potentially lower their interest rate.</p>
            <Link href="/?loanType=VA&irrrl=true" className="button">
              Get Started
            </Link>
          </div>
        );

      case 'fha-streamline':
        return (
          <div className="score-card result">
            <h3>Recommended: FHA Streamline Refinance</h3>
            <p>An FHA Streamline Refinance can help you refinance your existing FHA loan with reduced documentation and potentially lower costs.</p>
            <Link href="/?loanType=FHA&streamline=true" className="button">
              Get Started
            </Link>
          </div>
        );

      case 'usda-streamline':
        return (
          <div className="score-card result">
            <h3>Recommended: USDA Streamline Refinance</h3>
            <p>A USDA Streamline Refinance offers a simplified process to potentially improve the terms of your existing USDA loan.</p>
            <Link href="/?loanType=USDA&streamline=true" className="button">
              Get Started
            </Link>
          </div>
        );

      case 'conventional-streamline':
        return (
          <div className="score-card result">
            <h3>Recommended: Conventional Streamline Refinance</h3>
            <p>A Conventional Streamline Refinance can help you refinance your existing conventional loan with a simplified process.</p>
            <Link href="/?loanType=Conventional&streamline=true" className="button">
              Get Started
            </Link>
          </div>
        );

      default:
        return (
          <div className="score-card">
            <h3>Select Your Loan Purpose</h3>
            <button 
              onClick={() => handleStepChange('purchase-credit-score')}
              className="button"
            >
              Home Purchase
            </button>
            <button 
              onClick={() => handleStepChange('refinance-veteran')}
              className="button"
            >
              Home Refinance
            </button>
          </div>
        );
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: borderRadius.lg,
      boxShadow: shadows.lg,
      padding: spacing[6]
    }}>
      <h2 style={{
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.gray[900],
        marginBottom: spacing[6],
        lineHeight: typography.lineHeight.tight
      }}>Find Your Ideal Loan</h2>
      
      {/* Progress Indicator */}
      {showProgress && (
        <div className="progress-indicator">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div 
              key={i} 
              className={`progress-dot ${i <= stepNumber ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
      
      {/* Step Counter */}
      {showProgress && (
        <div className="text-center mb-4">
          <span className="step-counter">
            Step {stepNumber + 1} of {totalSteps}
          </span>
        </div>
      )}
      
      {/* Back Button */}
      {currentStep !== 'landing' && (
        <div className="mb-6">
          <button 
            onClick={handleBack}
            className="back-button"
          >
            ← Back
          </button>
        </div>
      )}
      
      {renderStep()}
      
      {/* Finalized Button - Only show on result pages and when not already finalized */}
      {isOnResultPage && !isFinalized && (
        <div style={{ marginTop: spacing[8], textAlign: 'center' }}>
          <button 
            onClick={handleFinalize}
            style={{
              backgroundColor: colors.success[600],
              color: '#ffffff',
              padding: `${spacing[3]} ${spacing[8]}`,
              borderRadius: borderRadius.lg,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              border: 'none',
              cursor: 'pointer',
              boxShadow: shadows.lg,
              transition: 'all 0.2s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2]
            }}
          >
            <icons.success size={20} />
            Finalize My Choice
          </button>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.gray[600],
            marginTop: spacing[2]
          }}>
            Confirm your loan recommendation to proceed
          </p>
        </div>
      )}
      
      {/* Finalized Confirmation - Show when finalized */}
      {isFinalized && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <div className="text-green-600 text-4xl mb-4" style={{ display: 'flex', justifyContent: 'center' }}>
            <icons.success size={48} />
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Questionnaire Completed!
          </h3>
          <p className="text-green-700 mb-4">
            You&apos;ve successfully completed the loan finder questionnaire. 
            Your recommendation has been finalized.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/?loanType=Conventional" 
              className="text-white px-6 py-2 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: templateStyles.primary.color,
                color: templateStyles.primary.text,
                display: 'flex', 
                alignItems: 'center', 
                gap: spacing[2]
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = templateStyles.primary.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = templateStyles.primary.color;
              }}
            >
              <icons.applyNow size={20} />
              Get My Rates
            </Link>
            <button 
              onClick={() => {
                setIsFinalized(false);
                setCurrentStep('landing');
                setStepHistory(['landing']);
              }}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}
            >
              <icons.homeRefinance size={20} />
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(Questionnaire);
