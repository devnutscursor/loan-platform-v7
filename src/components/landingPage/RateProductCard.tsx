'use client';

import React, { memo, useState } from 'react';
import { icons } from '@/components/ui/Icon';

interface RateProduct {
  id: string;
  lenderName: string;
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
  searchParams?: {
    purchasePrice?: number;
    downPayment?: number;
    loanAmount: number;
    creditScore: string;
    loanPurpose: 'Purchase' | 'Refinance';
  };
}

interface RateProductCardProps {
  product: RateProduct;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  layout: {
    borderRadius: number;
  };
  onGetStarted: (product: RateProduct) => void;
  onViewDetails: (product: RateProduct) => void;
  formatRate: (rate: number) => string;
  formatCurrency: (amount: number) => string;
  formatPoints: (points: number) => string;
  /** When true the card starts expanded (used for the first row). */
  defaultExpanded?: boolean;
}

function RateProductCard({
  product,
  colors,
  layout,
  onGetStarted,
  onViewDetails,
  formatRate,
  formatCurrency,
  formatPoints,
  defaultExpanded = false,
}: RateProductCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className="border p-3 transition-colors"
      style={{
        borderColor: colors.border,
        borderRadius: `${layout.borderRadius}px`,
      }}
    >
      {/* Header row — always visible, taps to expand/collapse */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <span className="text-base font-bold leading-tight" style={{ color: colors.primary }}>
          {product.loanProgram || `${product.loanTerm}-Year Fixed`}
        </span>
        <span className="flex items-center gap-2 flex-shrink-0">
          <span className="text-base font-bold whitespace-nowrap" style={{ color: colors.text }}>
            {formatRate(product.interestRate)}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.textSecondary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {/* Expanded content — only rendered when open */}
      {expanded && (
        <>
          {/* APR · P&I · points (muted summary) */}
          <div className="mt-2 text-xs" style={{ color: colors.textSecondary }}>
            APR {formatRate(product.apr)}
            <span className="mx-1.5">·</span>
            P&amp;I* {formatCurrency(product.monthlyPayment)}
            <span className="mx-1.5">·</span>
            {formatPoints(product.points)}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => onGetStarted(product)}
              className="flex items-center justify-center space-x-1.5 px-3 py-1.5 text-sm font-medium transition-colors flex-1"
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
              {React.createElement(icons.arrowRight, { size: 15, color: colors.background })}
              <span>Get Started</span>
            </button>
            <button
              onClick={() => onViewDetails(product)}
              className="flex items-center justify-center px-3 py-1.5 text-sm font-medium transition-colors flex-shrink-0"
              style={{
                backgroundColor: colors.background,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: `${layout.borderRadius}px`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background;
              }}
            >
              Details
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default memo(RateProductCard);
