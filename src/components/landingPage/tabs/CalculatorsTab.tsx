'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import Icon from '@/components/ui/Icon';

interface CalculatorsTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  // Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
}

export default function CalculatorsTab({
  selectedTemplate,
  className = '',
  isPublic = false,
  publicTemplateData
}: CalculatorsTabProps) {
  const { getTemplateSync } = useEfficientTemplates();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(900);

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
    fontSize: 16,
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  };

  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 }
  };

  // Handle postMessage from iframe for height adjustment
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify message origin for security
      if (event.data && event.data.type === 'SYNC_MCALC_HEIGHT') {
        const newHeight = parseInt(event.data.height, 10);
        if (!isNaN(newHeight) && newHeight > 100) {
          // Cap to reasonable height
          const cappedHeight = Math.min(newHeight, 4000);
          setIframeHeight(cappedHeight);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
              Mortgage Calculator
            </h2>
            <p className="text-base leading-relaxed" style={{ color: colors.textSecondary }}>
              Calculate your monthly mortgage payment, compare loan options, and explore different financing scenarios
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Iframe Container */}
      <div 
        className="w-full bg-white border rounded-lg overflow-hidden shadow-sm"
        style={{ 
          borderColor: colors.border,
          borderRadius: `${layout.borderRadius}px`
        }}
      >
        <iframe
          ref={iframeRef}
          src="/calculators/mortgage-calculator.html"
          title="Mortgage Calculator"
          className="w-full border-0"
          style={{
            height: `${iframeHeight}px`,
            minHeight: '600px',
            display: 'block'
          }}
          loading="lazy"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}

