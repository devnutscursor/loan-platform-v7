'use client';

import React from 'react';
import { colors, spacing, typography, borderRadius } from '@/theme/theme';

export interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

export function ActionButton({ 
  onClick, 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false 
}: ActionButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `text-white`;
      case 'secondary':
        return `text-gray-700`;
      case 'danger':
        return `text-white`;
      case 'link':
        return `bg-transparent`;
      default:
        return `text-white`;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const baseStyles = `inline-flex items-center justify-center font-medium focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()} ${getSizeStyles()}`;

  if (variant === 'link') {
    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={baseStyles}
        style={{ color: colors.primary[600] }}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={baseStyles}
      style={{
        borderRadius: borderRadius.lg as unknown as number,
        backgroundColor: variant === 'primary' ? colors.primary[600] : variant === 'secondary' ? colors.gray[100] : variant === 'danger' ? '#dc2626' : 'transparent',
      }}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
}
