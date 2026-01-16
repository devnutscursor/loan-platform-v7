'use client';

import React, { useState, useEffect } from 'react';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import Icon from '@/components/ui/Icon';

interface MyHomeValueTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  // NEW: Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
}

export default function MyHomeValueTab({
  selectedTemplate,
  className = '',
  // NEW: Public mode props
  isPublic = false,
  publicTemplateData
}: MyHomeValueTabProps) {
  const { user } = useAuth();
  const { getTemplateSync } = useEfficientTemplates();
  
  // Template data fetching - support both public and auth modes
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(selectedTemplate);

  
  // Comprehensive template data usage
  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#01bcc6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  
  const typography = templateData?.template?.typography || {
    fontFamily: 'Inter',
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  };
  
  // Helper function to get font size
  const getFontSize = (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl') => {
    if (typeof typography.fontSize === 'object') {
      return typography.fontSize[size];
    }
    // Fallback sizes if fontSize is a number
    const fallbackSizes = {
      xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24
    };
    return fallbackSizes[size];
  };
  
  const content = templateData?.template?.content || {
    headline: 'My Home Value',
    subheadline: 'Get an instant estimate of your home\'s current market value',
    ctaText: 'Get Home Value',
    ctaSecondary: 'Advanced Search'
  };
  
  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 }
  };
  
  const defaultClasses = {
    button: {
      primary: selectedTemplate === 'template2' 
        ? 'px-6 py-3 font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white'
        : 'px-6 py-3 font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 font-medium transition-all duration-200 border border-gray-300',
      outline: selectedTemplate === 'template2'
        ? 'border-2 px-6 py-3 font-medium transition-all duration-200'
        : 'border-2 px-6 py-3 font-medium transition-all duration-200',
      ghost: selectedTemplate === 'template2'
        ? 'px-4 py-2 font-medium transition-all duration-200'
        : 'px-4 py-2 font-medium transition-all duration-200'
    },
    card: {
      container: 'bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200',
      header: 'px-6 py-4 border-b border-gray-200',
      body: 'px-6 py-4',
      footer: 'px-6 py-4 border-t border-gray-200 bg-gray-50'
    },
    heading: {
      h1: 'text-3xl font-bold text-gray-900 mb-4',
      h2: 'text-2xl font-bold text-gray-900 mb-3',
      h3: 'text-xl font-semibold text-gray-900 mb-2',
      h4: 'text-lg font-semibold text-gray-900 mb-2',
      h5: 'text-base font-semibold text-gray-900 mb-2',
      h6: 'text-sm font-semibold text-gray-900 mb-1'
    },
    body: {
      large: 'text-lg text-gray-700 leading-relaxed',
      base: 'text-base text-gray-700 leading-relaxed',
      small: 'text-sm text-gray-600 leading-relaxed',
      xs: 'text-xs text-gray-500 leading-normal'
    },
    icon: {
      primary: selectedTemplate === 'template2' 
        ? 'w-12 h-12 flex items-center justify-center mb-4'
        : 'w-12 h-12 flex items-center justify-center mb-4',
      secondary: 'w-10 h-10 bg-gray-100 flex items-center justify-center mb-3',
      small: selectedTemplate === 'template2'
        ? 'w-8 h-8 flex items-center justify-center'
        : 'w-8 h-8 flex items-center justify-center'
    },
    input: {
      base: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01bcc6] focus:border-transparent',
      error: 'w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
    }
  };
  const templateClasses = templateData?.template?.classes;
  const safeTemplateClasses = templateClasses && typeof templateClasses === 'object' ? templateClasses : {};
  const classes = {
    ...defaultClasses,
    ...safeTemplateClasses,
button: { 
      ...defaultClasses.button, 
      ...(safeTemplateClasses?.button || {}) 
    },
    card: { 
      ...defaultClasses.card, 
      ...(safeTemplateClasses?.card || {}) 
    },
    heading: { 
      ...defaultClasses.heading, 
      ...(safeTemplateClasses?.heading || {}) 
    },
    body: { 
      ...defaultClasses.body, 
      ...(safeTemplateClasses?.body || {}) 
    },
    icon: { 
      ...defaultClasses.icon, 
      ...(safeTemplateClasses?.icon || {}) 
    },
    input: { 
      ...defaultClasses.input, 
      ...(safeTemplateClasses?.input || {}) 
    }
  };
  // CloudCMA Widget URL - read from template bodyModifications or use fallback
  const fallbackUrl = 'http://app.cloudcma.com/api_widget/8b8c909dd5012044c05bc689000879ee/show?post_url=https://app.cloudcma.com&source_url=ua';
  const cloudCmaWidgetUrl = templateData?.template?.bodyModifications?.homeValueWidgetUrl || fallbackUrl;
  
  // Check if URL is valid (not empty, null, or undefined)
  const hasValidUrl = cloudCmaWidgetUrl && 
    cloudCmaWidgetUrl.trim() !== '' && 
    (cloudCmaWidgetUrl.startsWith('http://') || cloudCmaWidgetUrl.startsWith('https://'));
  
  // Loading state for iframe
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  
  // Reset loading state when URL changes
  useEffect(() => {
    if (hasValidUrl) {
      setIsIframeLoading(true);
    } else {
      setIsIframeLoading(false);
    }
  }, [cloudCmaWidgetUrl, hasValidUrl]);
  
  const handleIframeLoad = () => {
    setIsIframeLoading(false);
  };
  
  const handleIframeError = () => {
    setIsIframeLoading(false);
  };

  return (
    <div 
      className={`w-full ${className}`}
      style={{ fontFamily: typography.fontFamily }}
    >

      {/* CloudCMA Widget Iframe */}
      <div 
        className="w-full mt-6 relative"
        style={{ 
          minHeight: '800px',
          borderRadius: `${layout.borderRadius}px`,
          overflow: 'hidden',
          backgroundColor: colors.background,
          border: `1px solid ${colors.border}`
        }}
      >
        {/* No URL Provided Message */}
        {!hasValidUrl && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{
              backgroundColor: colors.background,
              borderRadius: `${layout.borderRadius}px`
            }}
          >
            <div className="text-center px-6">
              <div 
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full"
                style={{ 
                  backgroundColor: `${colors.primary}10`,
                  color: colors.primary
                }}
              >
                <Icon name="home" size={32} color={colors.primary} />
              </div>
              <h3 
                style={{ 
                  color: colors.text,
                  fontSize: getFontSize('xl'),
                  fontWeight: typography.fontWeight.semibold,
                  fontFamily: typography.fontFamily,
                  marginBottom: '8px'
                }}
              >
                Home Value Estimator Not Available
              </h3>
              <p 
                style={{ 
                  color: colors.textSecondary,
                  fontSize: getFontSize('base'),
                  fontFamily: typography.fontFamily,
                  lineHeight: '1.6'
                }}
              >
                The loan officer has not provided a home value estimator link. Please contact them directly for assistance with home valuation.
              </p>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {hasValidUrl && isIframeLoading && (
          <div 
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{
              backgroundColor: colors.background,
              borderRadius: `${layout.borderRadius}px`
            }}
          >
            <div className="text-center">
              <div 
                className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                style={{ borderColor: colors.primary }}
              ></div>
              <p 
                style={{ 
                  color: colors.textSecondary,
                  fontSize: getFontSize('base'),
                  fontFamily: typography.fontFamily
                }}
              >
                Loading home value estimator...
              </p>
            </div>
          </div>
        )}
        
        {hasValidUrl && (
          <iframe
            src={cloudCmaWidgetUrl}
            title="Home Value Estimator"
            className="w-full h-full border-0"
            style={{
              minHeight: '800px',
              width: '100%',
              display: 'block',
              opacity: isIframeLoading ? 0 : 1,
              transition: 'opacity 0.3s ease-in-out'
            }}
            allow="clipboard-read; clipboard-write"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </div>

      {/* Global styles for iframe to ensure proper rendering */}
      <style jsx global>{`
        iframe[title="Home Value Estimator"] {
          width: 100% !important;
          max-width: 100% !important;
          min-height: 800px;
        }
        
        /* Ensure iframe is responsive */
        @media (max-width: 768px) {
          iframe[title="Home Value Estimator"] {
            min-height: 600px;
          }
        }
      `}</style>
    </div>
  );
}