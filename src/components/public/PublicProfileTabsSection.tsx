'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  memo,
} from 'react';
import Icon, { icons } from '@/components/ui/Icon';
import LandingPageTabs, { type TabId } from '@/components/landingPage/LandingPageTabs';
import type { SelectedRateRow } from '@/lib/mortech/mapRatesToDisplayProducts';

export type PublicProfileTabsHandle = {
  selectTab: (tabId: TabId) => void;
  scrollIntoView: () => void;
};

interface PublicProfileTabsSectionProps {
  profileData: PublicProfileContentProps['profileData'];
  templateData: NonNullable<PublicProfileContentProps['templateData']>;
  selectedTemplate: 'template1' | 'template2';
  enabledTabs: string[];
  initialTab: TabId;
  isPreview?: boolean;
  forceMobileViewport?: boolean;
  initialProductCategoryOptions?: { value: string; label: string }[];
  initialSelectedRates?: SelectedRateRow[];
  onTabChange?: (tabId: TabId) => void;
}

// Minimal type import to avoid circular deps with PublicProfileContent
interface PublicProfileContentProps {
  profileData: {
    user: { id: string };
    company: { id: string; has_mortech_subscription?: boolean };
    template?: any;
  };
  templateData: { template: any } | null;
}

const PublicProfileTabsSection = forwardRef<
  PublicProfileTabsHandle,
  PublicProfileTabsSectionProps
>(function PublicProfileTabsSection(
  {
    profileData,
    templateData,
    selectedTemplate,
    enabledTabs,
    initialTab,
    isPreview = false,
    forceMobileViewport = false,
    initialProductCategoryOptions,
    initialSelectedRates,
    onTabChange,
  },
  ref,
) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const tabsSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isPreview || !templateData) return;

    const bodyMods =
      profileData?.template?.bodyModifications ||
      profileData?.template?.body_modifications ||
      templateData?.template?.bodyModifications ||
      templateData?.template?.body_modifications ||
      {};

    const templateActiveTab = bodyMods?.activeTab || bodyMods?.active_tab;
    const enabledTabsFromEffect =
      bodyMods?.enabledTabs ||
      bodyMods?.enabled_tabs ||
      enabledTabs;

    if (
      templateActiveTab &&
      enabledTabsFromEffect.includes(templateActiveTab) &&
      templateActiveTab !== activeTab
    ) {
      setActiveTab(templateActiveTab as TabId);
    }
  }, [templateData, profileData?.template, isPreview, enabledTabs, activeTab]);

  useEffect(() => {
    if (
      profileData?.company?.has_mortech_subscription === false &&
      activeTab === 'get-custom-rate'
    ) {
      setActiveTab('todays-rates');
    }
  }, [profileData?.company?.has_mortech_subscription, activeTab]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  useImperativeHandle(ref, () => ({
    selectTab: handleTabChange,
    scrollIntoView: () => {
      tabsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  }));

  const layoutConfig = templateData?.template?.layoutConfig;
  const isSidebarLayout = layoutConfig?.mainContentLayout?.type === 'sidebar';
  const hideGetCustomRate = profileData?.company?.has_mortech_subscription === false;

  const landingTabs = (
    <LandingPageTabs
      isPublic
      publicTemplateData={templateData}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      selectedTemplate={selectedTemplate}
      templateCustomization={profileData.template}
      userId={profileData.user.id}
      companyId={profileData.company.id}
      hasMortechSubscription={profileData.company.has_mortech_subscription}
      hideTabNavigation={isSidebarLayout}
      forceMobileView={forceMobileViewport}
      initialProductCategoryOptions={initialProductCategoryOptions}
      initialSelectedRates={initialSelectedRates}
    />
  );

  if (isSidebarLayout) {
    const allTabs = [
      { id: 'todays-rates', label: "Today's Rates", icon: 'rates' },
      { id: 'get-custom-rate', label: 'Get My Custom Rate', icon: 'custom' },
      { id: 'document-checklist', label: 'Document Checklist', icon: 'document' },
      { id: 'my-home-value', label: 'My Home Value', icon: 'home' },
      { id: 'find-my-home', label: 'Find My Home', icon: 'home' },
      { id: 'schedule-call', label: 'Schedule a Call', icon: 'calendar' },
      { id: 'learning-center', label: 'Learning Center', icon: 'about' },
      { id: 'neighborhood-reports', label: 'Neighborhood Reports', icon: 'location' },
    ];

    const navigationTabs = allTabs.filter(
      (tab) => enabledTabs.includes(tab.id) && !(tab.id === 'get-custom-rate' && hideGetCustomRate),
    );

    return (
      <div
        className={`flex flex-col gap-4 w-full min-w-0 max-w-full ${forceMobileViewport ? '' : '@[64rem]:flex-row @[64rem]:gap-6'}`}
      >
        <div
          className={`w-full overflow-x-auto ${forceMobileViewport ? '' : '@[64rem]:w-64 @[64rem]:flex-shrink-0'}`}
        >
          <div className={forceMobileViewport ? '' : 'sticky top-6 @[64rem]:top-8'}>
            <div
              className="rounded-lg shadow-sm border p-4"
              style={{
                backgroundColor: templateData?.template?.colors?.background || '#ffffff',
                borderColor: templateData?.template?.colors?.border || '#e5e7eb',
                borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`,
              }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{
                  color: templateData?.template?.colors?.text || '#111827',
                  fontFamily:
                    (templateData?.template?.typography?.fontFamily &&
                      (templateData?.template?.typography?.fontFamily.body ||
                        templateData?.template?.typography?.fontFamily)) ||
                    undefined,
                }}
              >
                Navigation
              </h3>
              <nav className="space-y-1">
                {navigationTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onPointerDown={(e) => {
                        if (e.pointerType === 'mouse' && e.button !== 0) return;
                        if (e.pointerType === 'touch') {
                          e.preventDefault();
                          handleTabChange(tab.id as TabId);
                        }
                      }}
                      onClick={() => handleTabChange(tab.id as TabId)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center touch-manipulation select-none ${
                        isActive ? 'shadow-sm' : 'hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: isActive
                          ? selectedTemplate === 'template2'
                            ? templateData?.template?.colors?.primary || '#3b82f6'
                            : `${templateData?.template?.colors?.primary || '#3b82f6'}25`
                          : 'transparent',
                        color: isActive
                          ? selectedTemplate === 'template2'
                            ? templateData?.template?.colors?.background || '#ffffff'
                            : templateData?.template?.colors?.primary || '#3b82f6'
                          : templateData?.template?.colors?.textSecondary || '#6b7280',
                        border: isActive
                          ? selectedTemplate === 'template2'
                            ? `1px solid ${templateData?.template?.colors?.primary || '#3b82f6'}`
                            : `1px solid ${templateData?.template?.colors?.primary || '#3b82f6'}50`
                          : '1px solid transparent',
                        borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`,
                        fontFamily:
                          (templateData?.template?.typography?.fontFamily &&
                            (templateData?.template?.typography?.fontFamily.body ||
                              templateData?.template?.typography?.fontFamily)) ||
                          undefined,
                      }}
                    >
                      <Icon
                        name={tab.icon as keyof typeof icons}
                        className="w-3 h-3 @[20rem]:w-4 @[20rem]:h-4 @[48rem]:w-5 @[48rem]:h-5 mr-3"
                        color={
                          isActive
                            ? selectedTemplate === 'template2'
                              ? templateData?.template?.colors?.background || '#ffffff'
                              : templateData?.template?.colors?.primary || '#3b82f6'
                            : templateData?.template?.colors?.textSecondary || '#6b7280'
                        }
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full max-w-full" ref={tabsSectionRef}>
          {landingTabs}
        </div>
      </div>
    );
  }

  const gridLayoutClasses = forceMobileViewport
    ? ''
    : selectedTemplate === 'template2'
      ? '@[48rem]:gap-6'
      : '@[48rem]:gap-6';

  return (
    <div className={`flex flex-col gap-4 w-full min-w-0 max-w-full ${gridLayoutClasses}`}>
      <div className="w-full min-w-0 max-w-full" ref={tabsSectionRef}>
        {landingTabs}
      </div>
    </div>
  );
});

export default memo(PublicProfileTabsSection);
