'use client';

import { useState, useRef, lazy, Suspense, useEffect } from 'react';
import Icon, { icons } from '@/components/ui/Icon';
import type { TabId } from '@/components/landingPage/LandingPageTabs';
import LandingPageTabs from '@/components/landingPage/LandingPageTabs';
import type { SelectedRateRow } from '@/lib/mortech/mapRatesToDisplayProducts';
import SynclyFooter from '../ui/SynclyFooter';

// Lazy load hero only — tabs eager-loaded so Today's Rates paints immediately with SSR data
const UnifiedHeroSection = lazy(() => import('@/components/landingPage/UnifiedHeroSection'));

interface PublicProfileContentProps {
  profileData: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      nmlsNumber?: string;
      avatar?: string;
    };
    company: {
      id: string;
      name: string;
      logo?: string;
      website?: string;
      address?: any;
      phone?: string;
      email?: string;
      license_number?: string;
      company_nmls_number?: string;
      has_mortech_subscription?: boolean;
      company_social_media?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
      };
    };
    template?: any;
  };
  templateData: {
    template: any;
    pageSettings: any;
    metadata: {
      templateSlug: string;
      isCustomized: boolean;
      isPublished: boolean;
    };
  } | null;
  initialActiveTab?: TabId;
  onTabChange?: (tabId: TabId) => void;
  isPreview?: boolean;
  companyName?: string;
  forceMobileViewport?: boolean; // Force mobile viewport simulation
  /** Preloaded Product Category options (SSR). */
  initialProductCategoryOptions?: { value: string; label: string }[];
  /** Preloaded Today's Rates (SSR). */
  initialSelectedRates?: SelectedRateRow[];
}

// Skeleton Loading Component
const SkeletonLoader = () => (
  <div style={{
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <div style={{
      height: '80px',
      backgroundColor: '#f3f4f6',
      borderBottom: '1px solid #e5e7eb'
    }} />
    <div style={{
      height: '300px',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '200px',
        height: '200px',
        backgroundColor: '#e5e7eb',
        borderRadius: '50%'
      }} />
    </div>
    <div style={{
      padding: '2rem',
      backgroundColor: '#ffffff'
    }}>
      <div style={{
        height: '20px',
        backgroundColor: '#e5e7eb',
        marginBottom: '1rem',
        borderRadius: '4px'
      }} />
      <div style={{
        height: '20px',
        backgroundColor: '#e5e7eb',
        marginBottom: '1rem',
        borderRadius: '4px',
        width: '60%'
      }} />
    </div>
  </div>
);

export default function PublicProfileContent({
  profileData,
  templateData,
  initialActiveTab = 'todays-rates',
  onTabChange,
  isPreview = false,
  companyName,
  forceMobileViewport = false,
  initialProductCategoryOptions,
  initialSelectedRates,
}: PublicProfileContentProps) {
  // Get active tab from template customization if available, otherwise use initialActiveTab
  const bodyMods = profileData?.template?.bodyModifications || 
                   profileData?.template?.body_modifications ||
                   templateData?.template?.bodyModifications ||
                   templateData?.template?.body_modifications ||
                   {};

  const templateActiveTab = bodyMods?.activeTab || bodyMods?.active_tab;
  // Handle both camelCase and snake_case for enabledTabs
  const enabledTabs = bodyMods?.enabledTabs || bodyMods?.enabled_tabs || ['todays-rates', 'get-custom-rate', 'document-checklist', 'my-home-value', 'find-my-home', 'schedule-call', 'learning-center', 'neighborhood-reports', 'calculators'];
  
  // Use template's activeTab if available and enabled, otherwise use initialActiveTab
  const initialTab = (templateActiveTab && enabledTabs.includes(templateActiveTab)) 
    ? templateActiveTab 
    : initialActiveTab;

  const [activeTab, setActiveTab] = useState<TabId>(initialTab as TabId);
  const tabsSectionRef = useRef<HTMLDivElement | null>(null);

  // Update activeTab when template data loads (for public profile view only, not in preview mode)
  useEffect(() => {
    // Skip in preview mode - customizer manages tab state via onTabChange
    if (isPreview) return;
    
    // Only run if templateData is available
    if (!templateData) return;
    
    const bodyMods = profileData?.template?.bodyModifications || 
                     profileData?.template?.body_modifications ||
                     templateData?.template?.bodyModifications ||
                     templateData?.template?.body_modifications ||
                     {};

    const templateActiveTab = bodyMods?.activeTab || bodyMods?.active_tab;
    // Handle both camelCase and snake_case for enabledTabs
    const enabledTabsFromEffect = bodyMods?.enabledTabs || bodyMods?.enabled_tabs || ['todays-rates', 'get-custom-rate', 'document-checklist', 'my-home-value', 'find-my-home', 'schedule-call', 'learning-center', 'neighborhood-reports', 'calculators'];
    
    // Debug logging
    console.log('🔍 PublicProfileContent: Enabled tabs check:', {
      bodyMods,
      enabledTabsFromEffect,
      enabledTabs,
      templateActiveTab,
      profileDataTemplate: profileData?.template,
      templateDataTemplate: templateData?.template
    });
    
    // Only update if we have a template activeTab and it's enabled, and it's different from current
    if (templateActiveTab && enabledTabsFromEffect.includes(templateActiveTab) && templateActiveTab !== activeTab) {
      setActiveTab(templateActiveTab as TabId);
    }
  }, [templateData, profileData?.template, isPreview, enabledTabs]);

  // When company has no Mortech subscription, switch away from Get Custom Rate tab
  useEffect(() => {
    if (profileData?.company?.has_mortech_subscription === false && activeTab === 'get-custom-rate') {
      setActiveTab('todays-rates');
    }
  }, [profileData?.company?.has_mortech_subscription, activeTab]);


  // Get the selected template from the fetched data
  const selectedTemplate = templateData?.template?.slug === 'template2' ? 'template2' : 'template1';

  // Tab change handler
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const scrollTabsIntoView = () => {
    if (tabsSectionRef.current) {
      tabsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleHeroApplyNow = () => {
    handleTabChange('apply-now');
    scrollTabsIntoView();
  };

  const handleHeroGetRates = () => {
    handleTabChange('todays-rates');
    scrollTabsIntoView();
  };

  // Memoize user information
  const officerInfo = {
    officerName: `${profileData?.user.firstName || ''} ${profileData?.user.lastName || ''}`,
    phone: profileData?.user.phone || null,
    email: profileData?.user.email || 'user@example.com',
  };

  if (!templateData) {
    return <SkeletonLoader />;
  }

  return (
    <div className={`min-h-screen bg-white ${forceMobileViewport ? 'mobile-viewport-simulator overflow-auto' : ''}`}>
      {/* Scroll bar styling with template border radius */}
      <style jsx global>{`
        .public-profile-container {
          container-type: inline-size;
          container-name: profile;
          /* iOS WebKit defers painting of content inside a tall container-type
             element until a scroll forces a repaint (content "loads as you
             scroll"). Promoting it to its own compositing layer makes WebKit
             paint the full contained subtree eagerly. */
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }

        /* Hide scrollbars but keep functionality */
        ::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          background: transparent;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: transparent;
        }
        
        /* Firefox */
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        /* Force mobile viewport simulation for customizer preview - Use container queries */
        .mobile-viewport-simulator {
          max-width: 375px !important;
          width: 375px !important;
        }
        
        /* Override all responsive breakpoints when in mobile viewport simulator */
        .mobile-viewport-simulator .md\\:px-4 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
        .mobile-viewport-simulator .md\\:py-4 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
        .mobile-viewport-simulator .md\\:px-6 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
        .mobile-viewport-simulator .md\\:py-6 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
        .mobile-viewport-simulator .md\\:p-3 { padding: 0.5rem !important; }
        .mobile-viewport-simulator .md\\:py-8 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
        .mobile-viewport-simulator .md\\:text-sm { font-size: 0.75rem !important; }
        .mobile-viewport-simulator .lg\\:flex-row { flex-direction: column !important; }
        .mobile-viewport-simulator .lg\\:w-64 { width: 100% !important; }
        .mobile-viewport-simulator .lg\\:gap-6 { gap: 1rem !important; }
        .mobile-viewport-simulator .xl\\:grid { display: flex !important; flex-direction: column !important; }
        .mobile-viewport-simulator .xl\\:grid-cols-4 { grid-template-columns: none !important; }
        .mobile-viewport-simulator .xl\\:col-span-3 { grid-column: auto !important; width: 100% !important; }
        .mobile-viewport-simulator .xl\\:col-span-1 { grid-column: auto !important; width: 100% !important; }
        .mobile-viewport-simulator .xl\\:sticky { position: static !important; }
        
        /* Ensure mobile responsiveness.
           NOTE: this used to set overflow-x/y: auto and
           -webkit-overflow-scrolling: touch, turning the whole profile into a
           nested momentum-scroll container. On iOS WebKit that defers painting
           of off-screen content, so the rate cards only rendered as you
           scrolled. Letting the document scroll instead fixes that. */
        @media (max-width: 768px) {
          .public-profile-container {
            width: 100%;
            max-width: 100vw;
          }
          
          /*
           * Prevent horizontal overflow without a universal selector.
           * A wildcard rule under a container-type element forces WebKit (iOS
           * Safari and Chrome) to re-resolve max-width for every node on each
           * layout pass, causing the rate cards to paint in one by one.
           * box-sizing border-box is already applied globally by Tailwind
           * preflight, so it is not repeated here.
           */
          .public-profile-container img,
          .public-profile-container svg,
          .public-profile-container video,
          .public-profile-container canvas,
          .public-profile-container table,
          .public-profile-container pre,
          .public-profile-container iframe,
          .public-profile-container input,
          .public-profile-container select,
          .public-profile-container textarea {
            max-width: 100%;
          }

          /* Let long unbroken text wrap instead of forcing overflow */
          .public-profile-container {
            overflow-wrap: break-word;
            word-break: break-word;
          }
        }
        
        /* Ensure content doesn't overflow in mobile preview */
        .mobile-preview-content {
          width: 100%;
          overflow-x: auto;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
      
      {/* Unified Template Rendering - PUBLIC MODE */}
      {/* Main Content Area (container that wraps hero, content, footer) */}
        <div className={`w-full min-w-0 public-profile-container`}>
          <div
            className="w-full"
            style={{
              minWidth: '300px'
            }}
          >
            {/* Hero Section - rounded top corners.
                Wrapped in its OWN Suspense so the lazy hero chunk does not
                block the SSR'd tabs/rate cards below from rendering. */}
            <div
              className="overflow-hidden"
            >
              <Suspense fallback={<div style={{ minHeight: '300px' }} />}>
                <UnifiedHeroSection
                isPublic={true}
                publicUserData={{
                  name: officerInfo.officerName,
                  email: officerInfo.email,
                  phone: officerInfo.phone || undefined,
                  nmlsNumber: profileData.user.nmlsNumber,
                  avatar: profileData.user.avatar
                }}
                publicTemplateData={templateData}
                template={selectedTemplate}
                templateCustomization={profileData.template}
                companyData={{
                  id: profileData.company.id,
                  name: profileData.company.name,
                  logo: profileData.company.logo,
                  phone: profileData.company.phone,
                  email: profileData.company.email,
                  address: profileData.company.address,
                  website: profileData.company.website,
                  license_number: profileData.company.license_number,
                  company_nmls_number: profileData.company.company_nmls_number,
                  company_social_media: profileData.company.company_social_media
                }}
                forceMobileView={forceMobileViewport}
                onApplyNowRequest={handleHeroApplyNow}
                onGetRates={handleHeroGetRates}
              />
              </Suspense>
            </div>

            {/* Content Area - reduced padding and visible side borders */}
            <div
              className={`p-2 border-x w-full ${forceMobileViewport ? '' : '@[48rem]:p-3'}`}
              style={{ 
                borderColor: templateData?.template?.colors?.border || '#e5e7eb',
                minWidth: '300px'
              }}
            >
              {(() => {
                // Get layout configuration
                const layoutConfig = templateData?.template?.layoutConfig;
                const isSidebarLayout = layoutConfig?.mainContentLayout?.type === 'sidebar';
                
                if (isSidebarLayout) {
                  // Sidebar Layout (Template2) - Stack vertically on mobile, horizontal on large screens
                  return (
                    <div className={`flex flex-col gap-4 w-full ${forceMobileViewport ? '' : '@[64rem]:flex-row @[64rem]:gap-6'}`}>
                      {/* Left Sidebar - Tabs List */}
                      <div className={`w-full overflow-x-auto ${forceMobileViewport ? '' : '@[64rem]:w-64 @[64rem]:flex-shrink-0'}`}>
                        <div className={forceMobileViewport ? '' : 'sticky top-6 @[64rem]:top-8'}>
                          <div 
                            className="rounded-lg shadow-sm border p-4"
                            style={{
                              backgroundColor: templateData?.template?.colors?.background || '#ffffff',
                              borderColor: templateData?.template?.colors?.border || '#e5e7eb',
                              borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`
                            }}
                          >
                            <h3 
                              className="text-lg font-semibold mb-4"
                              style={{
                                color: templateData?.template?.colors?.text || '#111827',
                                fontFamily: (templateData?.template?.typography?.fontFamily && (templateData?.template?.typography?.fontFamily.body || templateData?.template?.typography?.fontFamily)) || undefined
                              }}
                            >
                              Navigation
                            </h3>
                            <nav className="space-y-1">
                              {(() => {
                                // Define all available tabs (excluding apply-now from navigation)
                                const allTabs = [
                                  { id: 'todays-rates', label: "Today's Rates", icon: 'rates' },
                                  { id: 'get-custom-rate', label: 'Get My Custom Rate', icon: 'custom' },
                                  { id: 'document-checklist', label: 'Document Checklist', icon: 'document' },
                                  { id: 'my-home-value', label: 'My Home Value', icon: 'home' },
                                  { id: 'find-my-home', label: 'Find My Home', icon: 'home' },
                                  { id: 'schedule-call', label: 'Schedule a Call', icon: 'calendar' },
                                  { id: 'learning-center', label: 'Learning Center', icon: 'about' },
                                  { id: 'neighborhood-reports', label: 'Neighborhood Reports', icon: 'location' }
                                ];

                                // Filter to only show enabled tabs; hide Get Custom Rate for non–Mortech companies
                                const hideGetCustomRate = profileData?.company?.has_mortech_subscription === false;
                                const navigationTabs = allTabs.filter(
                                  tab => enabledTabs.includes(tab.id) && !(tab.id === 'get-custom-rate' && hideGetCustomRate)
                                );

                                return navigationTabs.map((tab) => (
                                <button
                                  key={tab.id}
                                  onClick={() => handleTabChange(tab.id as TabId)}
                                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                                    activeTab === tab.id
                                      ? 'shadow-sm'
                                      : 'hover:bg-gray-50'
                                  }`}
                                  style={{
                                    backgroundColor: activeTab === tab.id 
                                      ? (selectedTemplate === 'template2' 
                                          ? templateData?.template?.colors?.primary || '#3b82f6'
                                          : `${templateData?.template?.colors?.primary || '#3b82f6'}25`)
                                      : 'transparent',
                                    color: activeTab === tab.id 
                                      ? (selectedTemplate === 'template2' 
                                          ? templateData?.template?.colors?.background || '#ffffff'
                                          : templateData?.template?.colors?.primary || '#3b82f6')
                                      : templateData?.template?.colors?.textSecondary || '#6b7280',
                                    border: activeTab === tab.id 
                                      ? (selectedTemplate === 'template2' 
                                          ? `1px solid ${templateData?.template?.colors?.primary || '#3b82f6'}`
                                          : `1px solid ${templateData?.template?.colors?.primary || '#3b82f6'}50`)
                                      : '1px solid transparent',
                                    borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`,
                                    fontFamily: (templateData?.template?.typography?.fontFamily && (templateData?.template?.typography?.fontFamily.body || templateData?.template?.typography?.fontFamily)) || undefined
                                  }}
                                >
                                  <Icon 
                                    name={tab.icon as keyof typeof icons} 
                                    className={`w-3 h-3 @[20rem]:w-4 @[20rem]:h-4 @[48rem]:w-5 @[48rem]:h-5 mr-3`}
                                    color={activeTab === tab.id 
                                      ? (selectedTemplate === 'template2' 
                                          ? templateData?.template?.colors?.background || '#ffffff'
                                          : templateData?.template?.colors?.primary || '#3b82f6')
                                      : templateData?.template?.colors?.textSecondary || '#6b7280'
                                    }
                                  />
                                  {tab.label}
                                </button>
                                ));
                              })()}
                            </nav>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Content Area - Selected Tab Details */}
                      <div className="flex-1 min-w-0 w-full" ref={tabsSectionRef}>
                        <LandingPageTabs
                          isPublic={true}
                          publicTemplateData={templateData}
                          activeTab={activeTab}
                          onTabChange={handleTabChange}
                          selectedTemplate={selectedTemplate}
                          templateCustomization={profileData.template}
                          userId={profileData.user.id}
                          companyId={profileData.company.id}
                          hasMortechSubscription={profileData.company.has_mortech_subscription}
                          hideTabNavigation={true}
                          forceMobileView={forceMobileViewport}
                          initialProductCategoryOptions={initialProductCategoryOptions}
                          initialSelectedRates={initialSelectedRates}
                        />
                      </div>
                    </div>
                  );
                } else {
                  const gridLayoutClasses = forceMobileViewport
                    ? ''
                    : selectedTemplate === 'template2'
                      ? '@[48rem]:gap-6'
                      : '@[48rem]:gap-6';
                  // Grid Layout (Template1) - Responsive: Flex column on mobile, full width on desktop
                  return (
                    <div className={`flex flex-col gap-4 w-full ${gridLayoutClasses}`}>
                      <div className={`w-full`} ref={tabsSectionRef}>
                        <LandingPageTabs
                          isPublic={true}
                          publicTemplateData={templateData}
                          activeTab={activeTab}
                          onTabChange={handleTabChange}
                          selectedTemplate={selectedTemplate}
                          templateCustomization={profileData.template}
                          userId={profileData.user.id}
                          companyId={profileData.company.id}
                        hasMortechSubscription={profileData.company.has_mortech_subscription}
                          forceMobileView={forceMobileViewport}
                          initialProductCategoryOptions={initialProductCategoryOptions}
                          initialSelectedRates={initialSelectedRates}
                        />
                      </div>
                    </div>
                  );
                }
              })()}
            </div>

            <div className="relative z-10">
              <SynclyFooter 
                backgroundColor={templateData?.template?.colors?.primary || '#1e3a5f'}
                textColor={templateData?.template?.footerModifications?.textColor || '#ffffff'}
                companyName={templateData?.template?.footerModifications?.companyName || 'RateCaddy'}
                tagline={templateData?.template?.footerModifications?.tagline || 'By Syncly360 CRM'}
                copyrightText={templateData?.template?.footerModifications?.copyrightText || '© RateCaddy, Powered by Syncly360 2026, All Rights Reserved'}
              />
            </div>
          </div>
        </div>
    </div>
  );
}

