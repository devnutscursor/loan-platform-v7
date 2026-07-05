'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';

interface ScheduleCallTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  isPublic?: boolean;
  publicTemplateData?: any;
  /** When false (keep-alive hidden tab), defer iframe until user opens this tab. */
  isActive?: boolean;
}

export default function ScheduleCallTab({
  selectedTemplate,
  className = '',
  isPublic = false,
  publicTemplateData,
  isActive = true,
}: ScheduleCallTabProps) {
  const { getTemplateSync } = useEfficientTemplates();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const templateData = isPublic && publicTemplateData
    ? publicTemplateData
    : getTemplateSync(selectedTemplate);

  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#01bcc6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
  };

  const typography = templateData?.template?.typography || {
    fontFamily: 'Inter',
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  };

  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 },
  };

  const defaultClasses = {
    heading: {
      h2: 'text-2xl font-bold text-gray-900 mb-3',
    },
    body: {
      base: 'text-base text-gray-700 leading-relaxed',
    },
  };

  const templateClasses = templateData?.template?.classes;
  const safeTemplateClasses = templateClasses && typeof templateClasses === 'object' ? templateClasses : {};
  const classes = {
    ...defaultClasses,
    ...safeTemplateClasses,
    heading: {
      ...defaultClasses.heading,
      ...(safeTemplateClasses?.heading || {}),
    },
    body: {
      ...defaultClasses.body,
      ...(safeTemplateClasses?.body || {}),
    },
  };

  const bodyMods =
    templateData?.template?.bodyModifications ||
    templateData?.template?.body_modifications ||
    {};

  const defaultScheduleCallWidgetUrl = 'https://app.theloanstar.com/widget/booking/4qMtgrD6DzYAIrSwxV4L';
  const rawScheduleCallWidgetUrl =
    bodyMods.scheduleCallWidgetUrl ??
    bodyMods.schedule_call_widget_url ??
    '';
  const scheduleCallWidgetUrl = String(rawScheduleCallWidgetUrl).trim() || defaultScheduleCallWidgetUrl;
  const scheduleCallHeader =
    bodyMods.scheduleCallHeader ?? bodyMods.schedule_call_header ?? '';
  const scheduleCallBody =
    bodyMods.scheduleCallBody ?? bodyMods.schedule_call_body ?? '';

  const hasValidCustomUrl =
    scheduleCallWidgetUrl.trim() !== '' &&
    (scheduleCallWidgetUrl.startsWith('http://') || scheduleCallWidgetUrl.startsWith('https://'));

  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [shouldMountIframe, setShouldMountIframe] = useState(isActive);

  useEffect(() => {
    if (isActive) setShouldMountIframe(true);
  }, [isActive]);

  useEffect(() => {
    if (shouldMountIframe) setWidgetLoaded(false);
  }, [scheduleCallWidgetUrl, shouldMountIframe]);

  useEffect(() => {
    if (!hasValidCustomUrl || typeof document === 'undefined') return;
    if (!scheduleCallWidgetUrl.includes('theloanstar.com')) return;
    if (document.querySelector('script[src="https://app.theloanstar.com/js/form_embed.js"]')) return;

    const script = document.createElement('script');
    script.src = 'https://app.theloanstar.com/js/form_embed.js';
    script.type = 'text/javascript';
    document.body.appendChild(script);
  }, [hasValidCustomUrl, scheduleCallWidgetUrl]);

  useEffect(() => {
    if (!shouldMountIframe || !hasValidCustomUrl) return;

    const iframe = iframeRef.current;
    const markLoaded = () => setWidgetLoaded(true);

    if (iframe) {
      iframe.addEventListener('load', markLoaded);
    }

    const timeout = setTimeout(markLoaded, 3000);

    return () => {
      if (iframe) iframe.removeEventListener('load', markLoaded);
      clearTimeout(timeout);
    };
  }, [shouldMountIframe, hasValidCustomUrl, scheduleCallWidgetUrl]);

  if (!hasValidCustomUrl) {
    return (
      <div
        className={`w-full ${className}`}
        style={{ fontFamily: typography.fontFamily }}
      >
        <div
          className="w-full mt-6 p-6 border rounded-lg bg-gray-50 text-sm text-gray-600"
          style={{
            borderColor: colors.border,
            borderRadius: `${layout.borderRadius}px`,
          }}
        >
          Please configure a valid Schedule Call widget URL in the customizer to display your calendar.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full ${className}`}
      style={{ fontFamily: typography.fontFamily }}
    >
      {(scheduleCallHeader || scheduleCallBody) && (
        <div className="w-full mb-4 space-y-2">
          {scheduleCallHeader && (
            <h2
              className={classes.heading.h2}
              style={{ color: colors.text, fontFamily: typography.fontFamily }}
            >
              {scheduleCallHeader}
            </h2>
          )}
          {scheduleCallBody && (
            <p
              className={classes.body.base}
              style={{ color: colors.textSecondary, fontFamily: typography.fontFamily }}
            >
              {scheduleCallBody}
            </p>
          )}
        </div>
      )}

      <div
        className="w-full relative overflow-hidden max-md:overflow-y-auto max-md:min-h-[780px] h-[860px]"
        style={{ backgroundColor: colors.background }}
      >
        {!widgetLoaded && (
          <div
            className="flex items-center justify-center absolute inset-0"
            style={{ zIndex: 1, backgroundColor: colors.background }}
          >
            <div className="text-center">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
                style={{ borderColor: colors.primary }}
              />
              <p style={{ color: colors.textSecondary }}>Loading calendar...</p>
            </div>
          </div>
        )}

        {shouldMountIframe && (
          <iframe
            ref={iframeRef}
            src={scheduleCallWidgetUrl}
            title="Schedule a Call Widget"
            className="w-full border-0 block max-md:mt-0 max-md:h-[880px] md:-mt-[70px] md:h-[930px]"
            style={{
              width: '100%',
              border: 'none',
              opacity: widgetLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              pointerEvents: widgetLoaded ? 'auto' : 'none',
            }}
            scrolling="auto"
            onLoad={() => setWidgetLoaded(true)}
            onError={() => setWidgetLoaded(true)}
          />
        )}
      </div>
    </div>
  );
}
