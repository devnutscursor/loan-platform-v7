'use client';

import React, { useMemo, useState } from 'react';

type TemplateColors = {
  primary: string;
  secondary: string;
  background: string;
  text?: string;
  textSecondary?: string;
  border?: string;
};

interface LoanFinderWidgetProps {
  colors: TemplateColors;
  borderRadiusPx: number;
  fontFamily?: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex?.trim().startsWith('#') ? hex.trim() : `#${hex?.trim()}`;
  const match = /^#([0-9a-f]{6})$/i.exec(normalized);
  if (!match) return null;
  const value = match[1];
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

export default function LoanFinderWidget({
  colors,
  borderRadiusPx,
  fontFamily = 'Inter',
}: LoanFinderWidgetProps) {
  const [activeCardId, setActiveCardId] = useState<string>('landing-page');

  const resolved = useMemo(() => {
    const primaryRgb = hexToRgb(colors.primary) || { r: 236, g: 72, b: 153 };
    const secondaryRgb = hexToRgb(colors.secondary) || { r: 1, g: 188, b: 198 };

    return {
      primaryRgb,
      secondaryRgb,
      text: colors.text || colors.primary,
      textSecondary: colors.textSecondary || colors.primary,
      border: colors.border || colors.primary,
    };
  }, [colors]);

  const cssVars = useMemo(
    () =>
      ({
        ['--lf-bg' as any]: colors.background,
        ['--lf-primary' as any]: colors.primary,
        ['--lf-secondary' as any]: colors.secondary,
        ['--lf-text' as any]: resolved.text,
        ['--lf-text-secondary' as any]: resolved.textSecondary,
        ['--lf-border' as any]: resolved.border,
        ['--lf-primary-rgb' as any]: `${resolved.primaryRgb.r}, ${resolved.primaryRgb.g}, ${resolved.primaryRgb.b}`,
        ['--lf-secondary-rgb' as any]: `${resolved.secondaryRgb.r}, ${resolved.secondaryRgb.g}, ${resolved.secondaryRgb.b}`,
        ['--lf-radius' as any]: `${borderRadiusPx}px`,
      }) as React.CSSProperties,
    [borderRadiusPx, colors.background, colors.primary, colors.secondary, resolved.border, resolved.primaryRgb, resolved.secondaryRgb, resolved.text, resolved.textSecondary],
  );

  const onContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a') as HTMLAnchorElement | null;
    if (!anchor) return;

    const href = anchor.getAttribute('href') || '';
    const hasTargetBlank = anchor.getAttribute('target') === '_blank';

    // Only intercept internal section navigation (e.g. href="#purchase-credit-score")
    if (href.startsWith('#') && !hasTargetBlank) {
      e.preventDefault();
      const id = href.slice(1);
      setActiveCardId(id);
    }
  };

  return (
    <div className="loan-finder" style={{ ...cssVars, fontFamily }} onClick={onContainerClick}>
      <h2 className="lf-h2">Find Your Ideal Loan</h2>

      {/* Landing Page */}
      <div id="landing-page" className="score-card" style={{ display: activeCardId === 'landing-page' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Select Your Loan Purpose</h3>
        <a href="#purchase-credit-score" className="button" aria-label="Home Purchase">
          Home Purchase
        </a>
        <a href="#refinance-veteran" className="button" aria-label="Home Refinance">
          Home Refinance
        </a>
      </div>

      {/* Home Purchase – Credit Score */}
      <div id="purchase-credit-score" className="score-card" style={{ display: activeCardId === 'purchase-credit-score' ? 'block' : 'none' }}>
        <h3 className="lf-h3">What's Your Credit Score?</h3>
        <a href="#fha-loan" className="button">
          Below 580
        </a>
        <a href="#purchase-down-payment-low" className="button">
          580–619
        </a>
        <a href="#purchase-down-payment-mid" className="button">
          620–639
        </a>
        <a href="#purchase-military" className="button">
          640 or higher
        </a>
      </div>

      {/* Purchase – Down Payment (580–619) */}
      <div id="purchase-down-payment-low" className="score-card" style={{ display: activeCardId === 'purchase-down-payment-low' ? 'block' : 'none' }}>
        <h3 className="lf-h3">How Much Can You Put Down?</h3>
        <a href="#fha-loan" className="button">
          Less than 3.5%
        </a>
        <a href="#dpa-loan" className="button">
          3.5% or more
        </a>
      </div>

      {/* Purchase – Down Payment (620–639) */}
      <div id="purchase-down-payment-mid" className="score-card" style={{ display: activeCardId === 'purchase-down-payment-mid' ? 'block' : 'none' }}>
        <h3 className="lf-h3">How Much Can You Put Down?</h3>
        <a href="#dpa-loan" className="button">
          Less than 3%
        </a>
        <a href="#conventional-loan" className="button">
          3% or more
        </a>
      </div>

      {/* Purchase – Military Service */}
      <div id="purchase-military" className="score-card" style={{ display: activeCardId === 'purchase-military' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Are You a Veteran or Active Military?</h3>
        <a href="#va-loan" className="button">
          Yes
        </a>
        <a href="#purchase-rural" className="button">
          No
        </a>
      </div>

      {/* Purchase – Rural Area */}
      <div id="purchase-rural" className="score-card" style={{ display: activeCardId === 'purchase-rural' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Is the Property in a Rural Area?</h3>
        <a href="#usda-loan" className="button">
          Yes
        </a>
        <a href="#purchase-construction" className="button">
          No
        </a>
      </div>

      {/* Purchase – Construction Needed */}
      <div id="purchase-construction" className="score-card" style={{ display: activeCardId === 'purchase-construction' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Do You Need to Finance Construction?</h3>
        <a href="#construction-loan" className="button">
          Yes
        </a>
        <a href="#purchase-selling-home" className="button">
          No
        </a>
      </div>

      {/* Purchase – Selling Current Home */}
      <div id="purchase-selling-home" className="score-card" style={{ display: activeCardId === 'purchase-selling-home' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Are You Selling Your Current Home?</h3>
        <a href="#bridge-loan" className="button">
          Yes
        </a>
        <a href="#conventional-loan" className="button">
          No
        </a>
      </div>

      {/* Refinance – Veteran Status */}
      <div id="refinance-veteran" className="score-card" style={{ display: activeCardId === 'refinance-veteran' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Are You a Veteran?</h3>
        <a href="#refinance-veteran-purpose" className="button">
          Yes
        </a>
        <a href="#refinance-non-veteran-purpose" className="button">
          No
        </a>
      </div>

      {/* Refinance – Veteran Purpose */}
      <div id="refinance-veteran-purpose" className="score-card" style={{ display: activeCardId === 'refinance-veteran-purpose' ? 'block' : 'none' }}>
        <h3 className="lf-h3">What's Your Refinance Goal?</h3>
        <a href="#refinance-veteran-equity" className="button">
          Access Equity
        </a>
        <a href="#va-irrrl" className="button">
          Lower Rate
        </a>
      </div>

      {/* Refinance – Veteran Equity Options */}
      <div id="refinance-veteran-equity" className="score-card" style={{ display: activeCardId === 'refinance-veteran-equity' ? 'block' : 'none' }}>
        <h3 className="lf-h3">How Do You Want to Access Equity?</h3>
        <a href="#heloc" className="button">
          Open Line of Credit
        </a>
        <a href="#cash-out-refinance" className="button">
          Cash Out Equity
        </a>
      </div>

      {/* Refinance – Non-Veteran Purpose */}
      <div id="refinance-non-veteran-purpose" className="score-card" style={{ display: activeCardId === 'refinance-non-veteran-purpose' ? 'block' : 'none' }}>
        <h3 className="lf-h3">What's Your Refinance Goal?</h3>
        <a href="#refinance-non-veteran-equity" className="button">
          Access Equity
        </a>
        <a href="#refinance-lower-rate" className="button">
          Lower Rates
        </a>
      </div>

      {/* Refinance – Non-Veteran Equity Options */}
      <div id="refinance-non-veteran-equity" className="score-card" style={{ display: activeCardId === 'refinance-non-veteran-equity' ? 'block' : 'none' }}>
        <h3 className="lf-h3">How Do You Want to Access Equity?</h3>
        <a href="#heloc" className="button">
          Open Line of Credit
        </a>
        <a href="#cash-out-refinance" className="button">
          Cash Out Equity
        </a>
      </div>

      {/* Refinance – Lower Rate Options */}
      <div id="refinance-lower-rate" className="score-card" style={{ display: activeCardId === 'refinance-lower-rate' ? 'block' : 'none' }}>
        <h3 className="lf-h3">What's Your Current Loan Type?</h3>
        <a href="#fha-streamline" className="button">
          FHA
        </a>
        <a href="#usda-streamline" className="button">
          USDA
        </a>
        <a href="#conventional-streamline" className="button">
          Conventional
        </a>
        <a href="#rate-term-refinance" className="button">
          Other/Not Sure
        </a>
      </div>

      {/* Loan Result Cards */}
      <div id="conventional-loan" className="score-card result" style={{ display: activeCardId === 'conventional-loan' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Recommended: Conventional Loan</h3>
        <p>
          A conventional loan might be your best option. These loans offer competitive rates and flexible terms.
        </p>
        <button
          type="button"
          className="button"
          style={{ border: 'none' }}
          onClick={() => setActiveCardId('landing-page')}
          aria-label="Refresh questionnaire"
        >
          Refresh
        </button>
      </div>

      <div id="va-loan" className="score-card result" style={{ display: activeCardId === 'va-loan' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Recommended: VA Loan</h3>
        <p>
          As a veteran or active military member, a VA loan could offer you excellent benefits, including no down payment options.
        </p>
        <button
          type="button"
          className="button"
          style={{ border: 'none' }}
          onClick={() => setActiveCardId('landing-page')}
          aria-label="Refresh questionnaire"
        >
          Refresh
        </button>
      </div>

      <div id="fha-loan" className="score-card result" style={{ display: activeCardId === 'fha-loan' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Recommended: FHA Loan</h3>
        <p>
          An FHA loan might be ideal for you, offering lower down payment requirements and more flexible credit guidelines.
        </p>
        <button
          type="button"
          className="button"
          style={{ border: 'none' }}
          onClick={() => setActiveCardId('landing-page')}
          aria-label="Refresh questionnaire"
        >
          Refresh
        </button>
      </div>

      <div id="usda-loan" className="score-card result" style={{ display: activeCardId === 'usda-loan' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Recommended: USDA Loan</h3>
        <p>
          For rural properties, a USDA loan could offer you favorable terms, including potentially no down payment.
        </p>
        <button
          type="button"
          className="button"
          style={{ border: 'none' }}
          onClick={() => setActiveCardId('landing-page')}
          aria-label="Refresh questionnaire"
        >
          Refresh
        </button>
      </div>

      <div id="dpa-loan" className="score-card result" style={{ display: activeCardId === 'dpa-loan' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Recommended: Down Payment Assistance (DPA) Loan</h3>
        <p>
          A DPA loan could help you with your down payment, making homeownership more accessible.
        </p>
        <button
          type="button"
          className="button"
          style={{ border: 'none' }}
          onClick={() => setActiveCardId('landing-page')}
          aria-label="Refresh questionnaire"
        >
          Refresh
        </button>
      </div>

      <div id="construction-loan" className="score-card result" style={{ display: activeCardId === 'construction-loan' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Recommended: Construction Loan</h3>
        <p>
          A construction loan can help you finance both the purchase of land and the construction of your new home.
        </p>
        <button
          type="button"
          className="button"
          style={{ border: 'none' }}
          onClick={() => setActiveCardId('landing-page')}
          aria-label="Refresh questionnaire"
        >
          Refresh
        </button>
      </div>

      <div id="bridge-loan" className="score-card result" style={{ display: activeCardId === 'bridge-loan' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Recommended: Bridge Loan</h3>
        <p>
          A bridge loan can help you manage the transition between selling your current home and buying a new one.
        </p>
        <button
          type="button"
          className="button"
          style={{ border: 'none' }}
          onClick={() => setActiveCardId('landing-page')}
          aria-label="Refresh questionnaire"
        >
          Refresh
        </button>
      </div>

      <div id="heloc" className="score-card result" style={{ display: activeCardId === 'heloc' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Recommended: Home Equity Line of Credit (HELOC)</h3>
        <p>A HELOC can provide you with flexible access to your home's equity for various purposes.</p>
        <button
          type="button"
          className="button"
          style={{ border: 'none' }}
          onClick={() => setActiveCardId('landing-page')}
          aria-label="Refresh questionnaire"
        >
          Refresh
        </button>
      </div>

      <div id="cash-out-refinance" className="score-card result" style={{ display: activeCardId === 'cash-out-refinance' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Recommended: Cash-Out Refinance</h3>
        <p>
          A cash-out refinance can help you access your home's equity while potentially improving your loan terms.
        </p>
        <button
          type="button"
          className="button"
          style={{ border: 'none' }}
          onClick={() => setActiveCardId('landing-page')}
          aria-label="Refresh questionnaire"
        >
          Refresh
        </button>
      </div>

      <div id="rate-term-refinance" className="score-card result" style={{ display: activeCardId === 'rate-term-refinance' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Recommended: Rate and Term Refinance</h3>
        <p>
          A rate and term refinance could help you lower your interest rate or adjust your loan term to better suit your needs.
        </p>
        <button
          type="button"
          className="button"
          style={{ border: 'none' }}
          onClick={() => setActiveCardId('landing-page')}
          aria-label="Refresh questionnaire"
        >
          Refresh
        </button>
      </div>

      <div id="va-irrrl" className="score-card result" style={{ display: activeCardId === 'va-irrrl' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Recommended: VA Interest Rate Reduction Refinance Loan (IRRRL)</h3>
        <p>
          The VA IRRRL program offers a streamlined way for VA loan holders to potentially lower their interest rate.
        </p>
        <button
          type="button"
          className="button"
          style={{ border: 'none' }}
          onClick={() => setActiveCardId('landing-page')}
          aria-label="Refresh questionnaire"
        >
          Refresh
        </button>
      </div>

      <div id="fha-streamline" className="score-card result" style={{ display: activeCardId === 'fha-streamline' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Recommended: FHA Streamline Refinance</h3>
        <p>
          An FHA Streamline Refinance can help you refinance your existing FHA loan with reduced documentation and potentially lower costs.
        </p>
        <button
          type="button"
          className="button"
          style={{ border: 'none' }}
          onClick={() => setActiveCardId('landing-page')}
          aria-label="Refresh questionnaire"
        >
          Refresh
        </button>
      </div>

      <div id="usda-streamline" className="score-card result" style={{ display: activeCardId === 'usda-streamline' ? 'block' : 'none' }}>
        <h3 className="lf-h3">Recommended: USDA Streamline Refinance</h3>
        <p>
          A USDA Streamline Refinance offers a simplified process to potentially improve the terms of your existing USDA loan.
        </p>
        <button
          type="button"
          className="button"
          style={{ border: 'none' }}
          onClick={() => setActiveCardId('landing-page')}
          aria-label="Refresh questionnaire"
        >
          Refresh
        </button>
      </div>

      <div
        id="conventional-streamline"
        className="score-card result"
        style={{ display: activeCardId === 'conventional-streamline' ? 'block' : 'none' }}
      >
        <h3 className="lf-h3">Recommended: Conventional Streamline Refinance</h3>
        <p>
          A Conventional Streamline Refinance can help you refinance your existing conventional loan with a simplified process.
        </p>
        <button
          type="button"
          className="button"
          style={{ border: 'none' }}
          onClick={() => setActiveCardId('landing-page')}
          aria-label="Refresh questionnaire"
        >
          Refresh
        </button>
      </div>

      {/* Scoped styling */}
      <style jsx>{`
        .loan-finder {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 12px;
          background-color: var(--lf-bg);
          color: var(--lf-text);
        }

        .lf-h2 {
          font-size: 18px;
          font-weight: 700;
          color: var(--lf-primary);
          margin: 0 0 10px;
        }

        .lf-h3 {
          font-size: 14px;
          font-weight: 700;
          color: var(--lf-primary);
          margin: 0 0 10px;
        }

        .score-card {
          background-color: rgba(var(--lf-primary-rgb), 0.08);
          border-radius: var(--lf-radius);
          padding: 14px;
          margin-bottom: 12px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }

        .button {
          display: inline-block;
          background-color: var(--lf-primary);
          color: white;
          padding: 9px 14px;
          margin: 8px 6px;
          border-radius: 5px;
          text-decoration: none;
          border: none;
          transition: filter 0.25s, background-color 0.25s;
          font-weight: 700;
          font-size: 13px;
        }

        .button:hover {
          background-color: var(--lf-secondary);
          filter: brightness(1.05);
        }

        p {
          color: var(--lf-text);
          font-size: 13px;
          line-height: 1.35;
          margin: 6px 0 0;
        }

        .result {
          border: 2px solid var(--lf-primary);
        }
      `}</style>
    </div>
  );
}

