'use client';

import React, { useState, lazy, Suspense, useEffect, useCallback } from 'react';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { icons } from '@/components/ui/Icon';

// Lazy load heavy components
const MortgageRateComparison = lazy(() => import('./mortgage/MortgageRateComparison'));

// Import lightweight tab components
import {
  TodaysRatesTab,
  DocumentChecklistTab,
  ApplyNowTab,
  MyHomeValueTab,
  FindMyHomeTab,
  LearningCenterTab,
  NeighborhoodReportsTab,
  CalculatorsTab,
  ScheduleCallTab
} from './tabs';
import LoanFinderWidget from './LoanFinderWidget';

export type TabId = 
  | 'todays-rates'
  | 'get-custom-rate'
  | 'document-checklist'
  | 'apply-now'
  | 'my-home-value'
  | 'find-my-home'
  | 'learning-center'
  | 'neighborhood-reports'
  | 'calculators'
  | 'schedule-call';

// Loading component for heavy tabs
const TabLoadingSkeleton = React.memo(({ selectedTemplate }: { selectedTemplate: 'template1' | 'template2' }) => {
  return (
    <div className={`bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 min-h-[600px] flex flex-col gap-4`}>
      <div className={`h-8 bg-gray-200 rounded-lg animate-pulse`} />
      <div className={`h-24 bg-gray-200 rounded-lg animate-pulse`} />
      <div className={`h-16 bg-gray-200 rounded-lg animate-pulse`} />
      <div className={`h-12 bg-gray-200 rounded-lg animate-pulse`} />
    </div>
  );
});

TabLoadingSkeleton.displayName = 'TabLoadingSkeleton';

interface Tab {
  id: TabId;
  label: string;
  icon: keyof typeof import('@/components/ui/Icon').icons;
  description: string;
}

interface LandingPageTabsProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  // Template customization data for instant updates
  templateCustomization?: {
    bodyModifications?: {
      enabledTabs?: string[];
      activeTab?: string;
    };
  };
  // Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
  // User context props for lead submission
  userId?: string;
  companyId?: string;
  hasMortechSubscription?: boolean;
  // Layout props
  hideTabNavigation?: boolean; // Hide the tab navigation (for sidebar layout)
  // Force mobile view (for customizer mobile preview)
  forceMobileView?: boolean;
  /** Preloaded Product Category options (SSR). Pass from server when available. */
  initialProductCategoryOptions?: { value: string; label: string }[];
  /** Preloaded Today's Rates rows (SSR). */
  initialSelectedRates?: import('@/lib/mortech/mapRatesToDisplayProducts').SelectedRateRow[];
}

const tabs: Tab[] = [
  {
    id: 'todays-rates',
    label: "Today's Rates",
    icon: 'rates',
    description: 'Current mortgage rates and market trends'
  },
  {
    id: 'get-custom-rate',
    label: 'Get My Custom Rate',
    icon: 'custom',
    description: 'Get personalized rate quotes'
  },
  {
    id: 'document-checklist',
    label: 'Document Checklist',
    icon: 'apply',
    description: 'Required documents for your loan'
  },
  {
    id: 'apply-now',
    label: 'Apply Now',
    icon: 'applyNow',
    description: 'Start your loan application'
  },
  {
    id: 'my-home-value',
    label: 'My Home Value',
    icon: 'home',
    description: 'Estimate your property value'
  },
  {
    id: 'find-my-home',
    label: 'Find My Home',
    icon: 'home',
    description: 'Search for properties'
  },
  {
    id: 'schedule-call',
    label: 'Schedule a Call',
    icon: 'calendar',
    description: 'Book a call on your calendar'
  },
  {
    id: 'learning-center',
    label: 'Learning Center',
    icon: 'about',
    description: 'Educational resources and guides'
  },
  {
    id: 'neighborhood-reports',
    label: 'Neighborhood Reports',
    icon: 'location',
    description: 'Neighborhood insights and market trends'
  },
  {
    id: 'calculators',
    label: 'Calculators',
    icon: 'calculator',
    description: 'Mortgage and loan calculators'
  }
];

export default function LandingPageTabs({
  activeTab,
  onTabChange,
  selectedTemplate,
  className = '',
  templateCustomization,
  // Public mode props
  isPublic = false,
  publicTemplateData,
  // User context props
  userId,
  companyId,
  hasMortechSubscription,
  // Layout props
  hideTabNavigation = false,
  // Force mobile view
  forceMobileView = false,
  initialProductCategoryOptions,
  initialSelectedRates,
}: LandingPageTabsProps) {
  const { getTemplateSync } = useEfficientTemplates();
  
  // Template data fetching - support both public and auth modes
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(selectedTemplate);

  // Get enabled tabs from customization or use all tabs
  // Check both camelCase and snake_case, and also check templateData
  const bodyModsForEnabledTabs = templateCustomization?.bodyModifications ||
                                  templateData?.template?.bodyModifications ||
                                  templateData?.template?.body_modifications ||
                                  {};
  const enabledTabs = bodyModsForEnabledTabs?.enabledTabs || bodyModsForEnabledTabs?.enabled_tabs || tabs.map(tab => tab.id);
  // Hide "Get My Custom Rate" for non–Mortech companies (public profile)
  const filteredTabs = tabs
    .filter(tab => enabledTabs.includes(tab.id))
    .filter(tab => !(tab.id === 'get-custom-rate' && hasMortechSubscription === false));
  const navigationTabs = filteredTabs.filter(tab => tab.id !== 'apply-now');
  
  // Get active tab - use template customization's activeTab on initial load
  // But allow activeTab prop to override when explicitly set (for customizer preview control)
  // Check both camelCase and snake_case formats
  const bodyMods = templateCustomization?.bodyModifications || 
                   templateData?.template?.bodyModifications ||
                   templateData?.template?.body_modifications ||
                   {};
  
  const templateActiveTab = bodyMods?.activeTab;
  
  // Use template's activeTab if available, otherwise use the prop
  // The prop will be set by parent components (customizer or PublicProfileContent) 
  // which already handle initialization from template customization
  const effectiveActiveTab = activeTab || templateActiveTab;

  // Instant tab + content switch; parent sync without deferred transition
  // Optimistic tab for instant UI; cleared when parent prop catches up
  const [optimisticTab, setOptimisticTab] = useState<TabId | null>(null);
  const displayTab = optimisticTab ?? effectiveActiveTab;

  const [mountedTabs, setMountedTabs] = useState<Set<TabId>>(() => new Set([effectiveActiveTab]));
  if (!mountedTabs.has(displayTab)) {
    const next = new Set(mountedTabs);
    next.add(displayTab);
    setMountedTabs(next);
  }

  useEffect(() => {
    setOptimisticTab(null);
  }, [effectiveActiveTab]);

  const handleTabClick = useCallback((tabId: TabId) => {
    if (tabId === displayTab) return;
    setOptimisticTab(tabId);
    onTabChange(tabId);
  }, [displayTab, onTabChange]);

  const isTodaysRatesTab = displayTab === 'todays-rates';

  
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
  
  const content = templateData?.template?.content || {
    headline: 'Mortgage Solutions',
    subheadline: 'Find the perfect loan for your needs',
    ctaText: 'Get Started',
    ctaSecondary: 'Learn More'
  };
  
  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 }
  };
  
  const classes = templateData?.template?.classes || {
    button: {
      primary: 'px-6 py-3 font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 font-medium transition-all duration-200 border border-gray-300'
    },
    card: {
      container: 'bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200'
    },
    navigation: {
      container: 'flex flex-wrap gap-2 p-4',
      tab: {
        base: 'px-4 py-2 font-medium transition-all duration-200 cursor-pointer',
        inactive: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
        active: 'text-white shadow-md',
        hover: 'hover:bg-opacity-10'
      }
    }
  };
  
  const renderTabContent = (tabId: TabId) => {
    switch (tabId) {
      case 'todays-rates':
        return <TodaysRatesTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
          userId={userId}
          companyId={companyId}
          hasMortechSubscription={hasMortechSubscription}
          initialSelectedRates={initialSelectedRates}
        />;
      
      case 'get-custom-rate':
        // Non–Mortech companies: do not show this tab (fallback to Today's Rates)
        if (hasMortechSubscription === false) {
          return (
            <TodaysRatesTab
              selectedTemplate={selectedTemplate}
              isPublic={isPublic}
              publicTemplateData={publicTemplateData}
              userId={userId}
              companyId={companyId}
              hasMortechSubscription={hasMortechSubscription}
              initialSelectedRates={initialSelectedRates}
            />
          );
        }
        return (
          <Suspense fallback={<TabLoadingSkeleton selectedTemplate={selectedTemplate} />}>
            <MortgageRateComparison 
              showHeader={false} 
              showFooter={false}
              className="bg-transparent"
              template={selectedTemplate}
              isPublic={isPublic}
              publicTemplateData={publicTemplateData}
              userId={userId}
              companyId={companyId}
              initialProductCategoryOptions={initialProductCategoryOptions}
              onNavigateToTodaysRates={() => handleTabClick('todays-rates')}
            />
          </Suspense>
        );
      
      case 'document-checklist':
        return <DocumentChecklistTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />;
      
      case 'apply-now':
        return <ApplyNowTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />;
      
      case 'my-home-value':
        return <MyHomeValueTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />;
      
      case 'find-my-home':
        return <FindMyHomeTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />;
      
      case 'schedule-call':
        return <ScheduleCallTab
          selectedTemplate={selectedTemplate}
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />;
      
      case 'learning-center':
        return <LearningCenterTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
          userId={userId}
        />;
      
      case 'neighborhood-reports':
        return <NeighborhoodReportsTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />;
      
      case 'calculators':
        return <CalculatorsTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />;
      
      default:
        return <TodaysRatesTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
          userId={userId}
          companyId={companyId}
          hasMortechSubscription={hasMortechSubscription}
          initialSelectedRates={initialSelectedRates}
        />;
    }
  };

  return (
    <div 
      className={`${className}`}
      style={{ 
        fontFamily: typography.fontFamily
      }}
    >
      {/* Modern Tab Navigation - Only show if not hidden */}
      {!hideTabNavigation && (
        <div className="relative">
        {/* Enhanced background using template colors */}
        <div 
          className={`absolute inset-0 shadow-inner w-full mx-auto`}
          style={{
            background: `linear-gradient(to right, ${colors.primary}10, ${colors.primary}05, ${colors.primary}10)`,
            paddingLeft: '1rem',
            paddingRight: '1rem',
            borderRadius: `${layout.borderRadius}px`,
          }}
        />
        
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5 max-w-7xl mx-auto" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '20px 20px',
            color: colors.border,
            paddingLeft: '1rem',
            paddingRight: '1rem',
            borderRadius: `${layout.borderRadius}px`,
          }}
        />
        
        {/* Scrollable Tab Container */}
        <div className="relative">
          {/* Scrollable Tab Navigation */}
          <div className="relative w-full mx-auto px-4 flex justify-center">
            <nav 
              className="overflow-x-auto overflow-y-hidden scrollbar-rounded gap-2 @sm:gap-3"
              style={{ 
                display: 'flex',
                flexWrap: 'nowrap',
                alignItems: 'center',
                WebkitOverflowScrolling: 'touch',
                minHeight: '70px'
              }}
            >
            {navigationTabs.map((tab) => {
              const isActive = displayTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onPointerDown={(e) => {
                    if (e.pointerType === 'mouse' && e.button !== 0) return;
                    if (e.pointerType === 'touch') {
                      e.preventDefault();
                      handleTabClick(tab.id);
                    }
                  }}
                  onClick={() => handleTabClick(tab.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTabClick(tab.id);
                    }
                  }}
                  className={`
                    relative flex-shrink-0 flex items-center justify-center space-x-1.5 @sm:space-x-3 px-2 @sm:px-4 py-3 rounded-xl
                    border shadow-sm
                    md:hover:shadow-lg
                    group font-medium whitespace-nowrap touch-manipulation select-none
                  `}
                  title={tab.description}
                  style={{
                    borderRadius: `${layout.borderRadius}px`,
                    backgroundColor: isActive ? colors.primary : colors.background,
                    color: isActive ? colors.background : colors.text,
                    borderColor: isActive ? colors.primary : colors.border,
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    fontWeight: typography.fontWeight.medium,
                    boxShadow: isActive ? `0 4px 12px ${colors.primary}30` : '0 2px 4px rgba(0,0,0,0.1)',
                    margin: `${layout.padding.small}px 0`
                  }}
                >
                  {/* Enhanced active indicator */}
                  {isActive && (
                    <>
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: colors.primary, boxShadow: `0 0 20px ${colors.primary}50` }} />
                    </>
                  )}
                  
                  {/* Icon with glow effect */}
                  <div className={`relative ${
                    isActive ? 'drop-shadow-lg' : ''
                  }`}>
                    {React.createElement(icons[tab.icon], { 
                      size: undefined,
                      color: isActive ? colors.background : colors.primary,
                      className: `${isActive ? 'drop-shadow-sm' : 'transition-colors duration-200'} w-3 h-3 @[20rem]:w-4 @[20rem]:h-4 @[48rem]:w-5 @[48rem]:h-5`
                    })}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full opacity-20 blur-sm" style={{ backgroundColor: colors.primary }} />
                    )}
                  </div>
                  
                  {/* Label */}
                  <span 
                    className="text-xs @sm:text-sm font-medium whitespace-nowrap transition-all duration-200 drop-shadow-sm"
                    style={{
                      color: isActive ? colors.background : colors.textSecondary,
                      fontWeight: typography.fontWeight.medium
                    }}
                  >
                    {tab.label}
                  </span>
                  
                  {/* Hover effect overlay */}
                  <div 
                    className="absolute inset-0 rounded-xl transition-opacity duration-200 opacity-0 hover:opacity-100"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary}20, ${colors.secondary}20)`
                    }}
                  />
                  
                  {/* Ripple effect on click */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 rounded-full opacity-0 scale-0 transition-all duration-500 ease-out" 
                    style={{
                      backgroundColor: colors.primary,
                      transform: 'scale(0)',
                      opacity: 0,
                    }}
                    onAnimationEnd={(e) => {
                      e.currentTarget.style.transform = 'scale(0)';
                      e.currentTarget.style.opacity = '0';
                    }}
                    />
                  </div>
                  
                </button>
              );
            })}
          </nav>
          </div>
        </div>
        
        
        </div>
      )}

      {/* Tab Content */}
      <div
        className={`w-full mx-auto ${
          forceMobileView
            ? ''
            : isTodaysRatesTab
              ? 'md:min-w-[800px] md:overflow-x-auto lg:ml-0 lg:mx-0 lg:w-full lg:max-w-none'
              : 'md:min-w-[800px] md:max-w-7xl md:overflow-x-auto'
        }`}
      >
        <div
          className={`bg-white md:shadow-xl ${
            forceMobileView || selectedTemplate === 'template2' ? '' : 'md:overflow-x-auto'
          } ${hideTabNavigation ? 'rounded-2xl' : 'rounded-b-2xl'}`}
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderRadius: hideTabNavigation
              ? `${layout.borderRadius}px`
              : `0 0 ${layout.borderRadius}px ${layout.borderRadius}px`,

            minHeight: 'auto',
            // Large box-shadow over this tall wrapper is repainted during scroll
            // on iOS WebKit; apply it only on desktop (md+) via the className.
          }}
        >
          <div 
            className="p-4"
            style={{ 
              padding: `${isTodaysRatesTab ? layout.padding.small : layout.padding.medium}px`
            }}
          >
            <div className="space-y-8">
              {Array.from(mountedTabs).map((tabId) => {
                const isActive = tabId === displayTab;
                const isTodayTab = tabId === 'todays-rates';

                return (
                  <div
                    key={tabId}
                    hidden={!isActive}
                    className={isActive ? undefined : 'hidden'}
                    style={isActive ? undefined : { contentVisibility: 'hidden' }}
                  >
                    {isTodayTab ? (
                      <div className="flex flex-col lg:flex-row gap-6 items-start">
                        <div className="w-full lg:w-[20%] lg:shrink-0">
                          <LoanFinderWidget
                            colors={colors}
                            borderRadiusPx={layout.borderRadius}
                            fontFamily={typography.fontFamily}
                          />
                        </div>
                        <div className="w-full lg:w-[80%]">{renderTabContent(tabId)}</div>
                      </div>
                    ) : (
                      renderTabContent(tabId)
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
