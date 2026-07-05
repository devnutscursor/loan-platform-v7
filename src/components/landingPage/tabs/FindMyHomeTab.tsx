'use client';

import React, { useState, useEffect } from 'react';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import Icon from '@/components/ui/Icon';
import { buildIdxWidgetIframeSrc } from '@/lib/idx/idxEmbedUrl';

const findMyHomeWidgetShellClass =
  'find-my-home-widget w-full min-w-0 max-w-full overflow-x-hidden';

function IdxWidgetIframe({
  src,
  loaded,
  onLoad,
}: {
  src: string;
  loaded: boolean;
  onLoad: () => void;
}) {
  return (
    <iframe
      src={src}
      title="IDX Property Search Widget"
      className="w-full border-0 flex-1 min-w-0 max-w-full"
      style={{
        width: '100%',
        border: 'none',
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: loaded ? 'auto' : 'none',
      }}
      onLoad={onLoad}
      onError={onLoad}
    />
  );
}

interface FindMyHomeTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  // NEW: Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
}

export default function FindMyHomeTab({
  selectedTemplate,
  className = '',
  // NEW: Public mode props
  isPublic = false,
  publicTemplateData
}: FindMyHomeTabProps) {
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
    headline: 'Find My Home',
    subheadline: 'Search for your perfect home with our advanced property finder',
    ctaText: 'Search Homes',
    ctaSecondary: 'Map View'
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
    },
    select: {
      base: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01bcc6] focus:border-transparent bg-white',
      error: 'w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white'
    },
    status: {
      success: 'text-green-600 bg-green-50 px-2 py-1 rounded text-sm',
      warning: 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-sm',
      error: 'text-red-600 bg-red-50 px-2 py-1 rounded text-sm',
      info: 'text-[#01bcc6] bg-[#01bcc6]/10 px-2 py-1 rounded text-sm'
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
    },
    select: { 
      ...defaultClasses.select, 
      ...(safeTemplateClasses?.select || {}) 
    },
    status: { 
      ...defaultClasses.status, 
      ...(safeTemplateClasses?.status || {}) 
    }
  };

  // Find My Home / Home AI Search: custom widget URL from customizer (e.g. LoanStar / IDX),
  // default to the IDX widget URL provided by the client (protocol-relative, no http/https prefix)
  const defaultFindMyHomeWidgetUrl = '//theloanstar.idxbroker.com/idx/widgets/117781';
  const findMyHomeWidgetUrl =
    templateData?.template?.bodyModifications?.findMyHomeWidgetUrl ?? defaultFindMyHomeWidgetUrl;
  const findMyHomeHeader = templateData?.template?.bodyModifications?.findMyHomeHeader ?? '';
  const findMyHomeBody = templateData?.template?.bodyModifications?.findMyHomeBody ?? '';
  const trimmedFindMyHomeUrl = (findMyHomeWidgetUrl || '').trim();
  const hasValidCustomUrl =
    trimmedFindMyHomeUrl !== '' &&
    (trimmedFindMyHomeUrl.startsWith('http://') ||
      trimmedFindMyHomeUrl.startsWith('https://') ||
      trimmedFindMyHomeUrl.startsWith('//'));

  // IDX widget script URLs load inside our same-origin iframe (/api/widgets/idx) so we
  // can apply mobile CSS/JS — parent-page shadow DOM manipulation is unreliable.
  const idxWidgetScriptMatch = trimmedFindMyHomeUrl.match(/\/idx\/widgets\/([^/?]+)/i);
  const isIdxWidgetScriptUrl = Boolean(idxWidgetScriptMatch);
  const idxWidgetId = idxWidgetScriptMatch ? idxWidgetScriptMatch[1] : null; // e.g. "117781"
  const idxEmbedIframeSrc =
    isIdxWidgetScriptUrl && idxWidgetId
      ? buildIdxWidgetIframeSrc(idxWidgetId, trimmedFindMyHomeUrl)
      : null;

  const [idxWidgetLoaded, setIdxWidgetLoaded] = useState(false);
  const [customIframeLoaded, setCustomIframeLoaded] = useState(false);

  // Load LoanStar form_embed.js when using a theloanstar.com booking widget URL (not for IDX script widgets)
  useEffect(() => {
    if (!hasValidCustomUrl || typeof document === 'undefined') return;
    const url = (findMyHomeWidgetUrl || '').trim();
    if (!url.includes('theloanstar.com') || /\/idx\/widgets\//i.test(url)) return;
    if (document.querySelector('script[src="https://app.theloanstar.com/js/form_embed.js"]')) return;
    const script = document.createElement('script');
    script.src = 'https://app.theloanstar.com/js/form_embed.js';
    script.type = 'text/javascript';
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [hasValidCustomUrl, findMyHomeWidgetUrl]);

  // Reset iframe loading when URL changes
  useEffect(() => {
    if (hasValidCustomUrl) setCustomIframeLoaded(false);
  }, [findMyHomeWidgetUrl, hasValidCustomUrl]);

  // Custom widget URL (e.g. LoanStar / IDX): show header/body + iframe
  if (hasValidCustomUrl) {
    return (
      <div
        className={`w-full ${className}`}
        style={{ fontFamily: typography.fontFamily }}
      >
        {(findMyHomeHeader || findMyHomeBody) && (
          <div className="w-full mb-4 space-y-2">
            {findMyHomeHeader && (
              <h2
                className={classes.heading.h2}
                style={{ color: colors.text, fontFamily: typography.fontFamily }}
              >
                {findMyHomeHeader}
              </h2>
            )}
            {findMyHomeBody && (
              <p
                className={classes.body.base}
                style={{ color: colors.textSecondary, fontFamily: typography.fontFamily }}
              >
                {findMyHomeBody}
              </p>
            )}
          </div>
        )}
        <div
          className={`${findMyHomeWidgetShellClass} mt-6 relative`}
          style={{
            height: 'calc(100vh - 40px)',
            minHeight: '1100px',
            borderRadius: `${layout.borderRadius}px`,
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Loading overlay while initial widget/script is loading */}
          {!customIframeLoaded && (
            <div
              className="flex items-center justify-center py-12 absolute inset-0"
              style={{ zIndex: 1, backgroundColor: colors.background }}
            >
              <div className="text-center">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
                  style={{ borderColor: colors.primary }}
                />
                <p style={{ color: colors.textSecondary }}>Loading widget...</p>
              </div>
            </div>
          )}
          {isIdxWidgetScriptUrl && idxEmbedIframeSrc ? (
            <IdxWidgetIframe
              src={idxEmbedIframeSrc}
              loaded={customIframeLoaded}
              onLoad={() => setCustomIframeLoaded(true)}
            />
          ) : (
            <iframe
              loading="lazy"
              src={trimmedFindMyHomeUrl}
              title="Home AI Search Widget"
              className="w-full border-0 flex-1 min-w-0 max-w-full"
              style={{
                width: '100%',
                border: 'none',
                opacity: customIframeLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
                pointerEvents: customIframeLoaded ? 'auto' : 'none',
              }}
              scrolling="yes"
              sandbox="allow-scripts allow-same-origin allow-forms"
              onLoad={() => setCustomIframeLoaded(true)}
              onError={() => setCustomIframeLoaded(true)}
            />
          )}
        </div>
      </div>
    );
  }

  // Default: IDX Widget Iframe
  return (
    <div
      className={`w-full ${className}`}
      style={{ fontFamily: typography.fontFamily }}
    >
      <div
        className={`${findMyHomeWidgetShellClass} mt-6 relative`}
        style={{
            height: 'calc(100vh - 40px)',
            minHeight: '1100px',
            borderRadius: `${layout.borderRadius}px`,
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
        {!idxWidgetLoaded && (
          <div className="flex items-center justify-center py-12 absolute inset-0" style={{ zIndex: 1, backgroundColor: colors.background }}>
            <div className="text-center">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
                style={{ borderColor: colors.primary }}
              />
              <p style={{ color: colors.textSecondary }}>Loading property search...</p>
            </div>
          </div>
        )}
        <IdxWidgetIframe
          src={buildIdxWidgetIframeSrc(idxWidgetId ?? '117781', defaultFindMyHomeWidgetUrl)}
          loaded={idxWidgetLoaded}
          onLoad={() => setIdxWidgetLoaded(true)}
        />
      </div>

      <style jsx global>{`
        .find-my-home-widget idx-ai-smart-search,
        .find-my-home-widget [id^="idx-ai-smart-search-"] {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          display: block !important;
          box-sizing: border-box !important;
        }
      `}</style>
    </div>
  );
}