'use client';

import React, { useState, lazy, Suspense } from 'react';
import { typography, colors, spacing, borderRadius, shadows } from '@/theme/theme';
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
  LearningCenterTab
} from './tabs';

export type TabId = 
  | 'todays-rates'
  | 'get-custom-rate'
  | 'document-checklist'
  | 'apply-now'
  | 'my-home-value'
  | 'find-my-home'
  | 'learning-center';

// Loading component for heavy tabs
const TabLoadingSkeleton = React.memo(() => (
  <div style={{
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.lg,
    boxShadow: shadows.lg,
    padding: spacing[8],
    minHeight: '600px',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[4]
  }}>
    <div style={{
      height: spacing[8],
      backgroundColor: colors.gray[200],
      borderRadius: borderRadius.md,
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }} />
    <div style={{
      height: spacing[24],
      backgroundColor: colors.gray[200],
      borderRadius: borderRadius.md,
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }} />
    <div style={{
      height: spacing[24],
      backgroundColor: colors.gray[200],
      borderRadius: borderRadius.md,
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    }} />
  </div>
));

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
    id: 'learning-center',
    label: 'Learning Center',
    icon: 'about',
    description: 'Educational resources and guides'
  }
];

export default function LandingPageTabs({
  activeTab,
  onTabChange,
  selectedTemplate,
  className = ''
}: LandingPageTabsProps) {
  const getTabStyles = (tabId: TabId, isActive: boolean) => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      padding: `${spacing[2]} ${spacing[4]}`,
      borderRadius: borderRadius.md,
      transition: 'all 0.2s ease-in-out',
      border: 'none',
      cursor: 'pointer',
    };
    
    if (selectedTemplate === 'template1') {
      return {
        ...baseStyles,
        backgroundColor: isActive ? colors.primary[50] : 'transparent',
        color: isActive ? colors.primary[600] : colors.gray[700],
        border: isActive ? `2px solid ${colors.primary[200]}` : 'none',
      };
    } else {
      return {
        ...baseStyles,
        backgroundColor: isActive ? colors.darkPurple[50] : 'transparent',
        color: isActive ? colors.darkPurple[600] : colors.gray[700],
        border: isActive ? `2px solid ${colors.darkPurple[200]}` : 'none',
      };
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'todays-rates':
        return <TodaysRatesTab selectedTemplate={selectedTemplate} />;
      
      case 'get-custom-rate':
        return (
          <Suspense fallback={<TabLoadingSkeleton />}>
            <MortgageRateComparison 
              showHeader={false} 
              showFooter={false}
              className="bg-transparent"
              template={selectedTemplate}
            />
          </Suspense>
        );
      
      case 'document-checklist':
        return <DocumentChecklistTab selectedTemplate={selectedTemplate} />;
      
      case 'apply-now':
        return <ApplyNowTab selectedTemplate={selectedTemplate} />;
      
      case 'my-home-value':
        return <MyHomeValueTab selectedTemplate={selectedTemplate} />;
      
      case 'find-my-home':
        return <FindMyHomeTab selectedTemplate={selectedTemplate} />;
      
      case 'learning-center':
        return <LearningCenterTab selectedTemplate={selectedTemplate} />;
      
      default:
        return <TodaysRatesTab selectedTemplate={selectedTemplate} />;
    }
  };

  return (
    <div style={{ width: '100%' }} className={className}>
      {/* Tab Navigation */}
      <div style={{ marginBottom: spacing[8] }}>
        <div style={{ 
          borderBottom: `1px solid ${colors.gray[200]}`,
          marginBottom: `-1px`
        }}>
          <nav style={{ 
            display: 'flex',
            gap: spacing[8],
            overflowX: 'auto'
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                style={getTabStyles(tab.id, activeTab === tab.id)}
                title={tab.description}
              >
                {React.createElement(icons[tab.icon], { size: 20 })}
                <span style={{ 
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  whiteSpace: 'nowrap'
                }}>
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '600px' }}>
        {renderTabContent()}
      </div>
    </div>
  );
}
