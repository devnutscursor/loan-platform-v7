'use client';

import React, { useState, useMemo, lazy, Suspense } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useProfileCache } from '@/hooks/use-profile-cache';
import { useEfficientTemplates } from '@/hooks/use-efficient-templates';
import TemplateSelector from '@/components/TemplateSelector';
import { ProfileManager } from '@/lib/profile-manager';
import { typography } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';

// Lazy load unified components
const UnifiedHeroSection = lazy(() => import('@/components/landingPage/UnifiedHeroSection'));
const UnifiedRightSidebar = lazy(() => import('@/components/landingPage/UnifiedRightSidebar'));
const LandingPageTabs = lazy(() => import('@/components/landingPage/LandingPageTabs'));

// Import types
import type { TabId } from '@/components/landingPage/LandingPageTabs';

// Skeleton Loading Component
const SkeletonLoader = React.memo(() => (
  <div style={{
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  }}>
    {/* Header Skeleton */}
    <div style={{
      height: '80px',
      backgroundColor: '#f3f4f6',
      borderBottom: '1px solid #e5e7eb'
    }} />
    
    {/* Hero Section Skeleton */}
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
    
    {/* Content Skeleton */}
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '32px 16px',
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '32px'
    }}>
      <div style={{
        height: '600px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px'
      }} />
      <div style={{
        height: '400px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px'
      }} />
    </div>
  </div>
));

SkeletonLoader.displayName = 'SkeletonLoader';

export default function OfficersProfilePage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const { profile, refreshProfile, loading: profileLoading, getProfile } = useProfileCache();
  const { 
    isLoading: templatesLoading,
    fetchTemplate,
    getTemplateSync,
    templateData
  } = useEfficientTemplates();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('todays-rates');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('template1');
  
  // Form data state - initialize with profile data when available
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Update form data when profile is loaded
  React.useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  // Trigger profile fetching when user/auth state changes
  React.useEffect(() => {
    console.log('🔄 Profile page: Triggering profile fetch', { user: user?.email, authLoading, profileLoading });
    getProfile(user, authLoading);
  }, [user, authLoading, getProfile]);

  // Fetch template data when component mounts or template changes (same as TemplateSelector)
  React.useEffect(() => {
    console.log('🔄 Profile page useEffect triggered:', {
      user: !!user,
      authLoading,
      selectedTemplate,
      userEmail: user?.email
    });
    
    if (user) {  // ← Only check for user, not authLoading (same as TemplateSelector)
      console.log('🔄 Profile page: Fetching template data for:', selectedTemplate);
      fetchTemplate(selectedTemplate).then(() => {
        console.log('✅ Profile page: Template data fetched successfully for:', selectedTemplate);
      }).catch(error => {
        console.error('❌ Profile page: Error fetching template:', error);
      });
    }
  }, [user, selectedTemplate, fetchTemplate]);  // ← Removed authLoading dependency

  // Memoize handlers to prevent unnecessary re-renders
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSave = React.useCallback(async () => {
    // TODO: Implement profile update logic
    console.log('Saving profile:', formData);
    setIsEditing(false);
  }, [formData]);

  const handleCancel = React.useCallback(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
    setIsEditing(false);
  }, [profile]);

  const handleTabChange = React.useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    console.log('Tab changed to:', tabId);
  }, []);

  const handleTemplateChange = React.useCallback((templateSlug: string) => {
    setSelectedTemplate(templateSlug);
    console.log('Template changed to:', templateSlug);
  }, []);

  const handleRefreshProfile = React.useCallback(async () => {
    if (user) {
      console.log('🔄 Refreshing profile data...');
      await refreshProfile(user);
    }
  }, [user, refreshProfile]);

  // Memoize user information calculations using fetched profile data
  const officerInfo = useMemo(() => {
    if (profile) {
      const info = {
        officerName: `${profile.firstName} ${profile.lastName}`,
        phone: profile.phone || null, // Only show if exists in database
        email: profile.email || 'user@example.com',
      };
      console.log('🎯 Using fetched profile data for officerInfo:', info);
      return info;
    }
    
    // Fallback to form data if profile not loaded yet
    const officerName = formData.firstName && formData.lastName 
      ? `${formData.firstName} ${formData.lastName}`
      : 'John Smith';
    
    const fallbackInfo = {
      officerName,
      phone: formData.phone || null, // Only show if exists
      email: formData.email || 'john@example.com',
    };
    console.log('⚠️ Using fallback data for officerInfo:', fallbackInfo);
    return fallbackInfo;
  }, [profile, formData.firstName, formData.lastName, formData.phone, formData.email]);

  // Debug logging for loading states
  console.log('🔍 Profile page render state:', {
    authLoading,
    profileLoading,
    hasUser: !!user,
    hasProfile: !!profile,
    userEmail: user?.email,
    selectedTemplate,
    templateDataKeys: Object.keys(templateData),
    currentTemplateData: templateData[selectedTemplate]
  });

  // Show loading state while profile is being fetched (but not authLoading since TemplateSelector works)
  if (profileLoading || templatesLoading) {
    return (
      <RouteGuard allowedRoles={['employee']}>
        <DashboardLayout 
          title="Loan Officer Profile" 
          subtitle="Loading your profile..."
        >
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4`} style={{ borderColor: selectedTemplate === 'template2' ? '#9333ea' : '#ec4899' }}></div>
              <p className="text-gray-600">Loading profile data...</p>
              <p className="text-sm text-gray-500 mt-2">
                Auth: {authLoading ? 'Loading' : 'Ready'} | Profile: {profileLoading ? 'Loading' : 'Ready'} | Templates: {templatesLoading ? 'Loading' : 'Ready'}
              </p>
            </div>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  // Check if template data is available for the selected template
  const currentTemplateData = templateData[selectedTemplate];
  console.log('🔍 Profile page template data check:', {
    selectedTemplate,
    templateDataKeys: Object.keys(templateData),
    currentTemplateData: !!currentTemplateData,
    templateData
  });
  
  // If no template data, show a warning but still render (components will use fallbacks)
  if (!currentTemplateData) {
    console.warn('⚠️ Profile page: No template data available, components will use fallback styling');
  }

  return (
    <RouteGuard allowedRoles={['employee']}>
      <DashboardLayout 
        title="Loan Officer Profile" 
        subtitle="Manage your professional profile and mortgage rates"
      >
        <div className="min-h-screen bg-white">
          {/* Template Selection Panel */}
          <div className="fixed top-20 right-4 z-50">
            <TemplateSelector 
              onTemplateChange={handleTemplateChange}
              className="w-80"
            />
          </div>

          {/* Unified Template Rendering with Suspense */}
          <Suspense fallback={<SkeletonLoader />}>
            {/* Unified Hero Section */}
            <UnifiedHeroSection
              officerName={officerInfo.officerName}
              phone={officerInfo.phone || undefined}
              email={officerInfo.email}
              template={selectedTemplate as 'template1' | 'template2'}
            />

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
                {/* Main Content - Takes up 3/4 of the width on XL screens */}
                <div className="xl:col-span-3">
                  <LandingPageTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    selectedTemplate={selectedTemplate as 'template1' | 'template2'}
                    className="w-full"
                  />
                </div>

                {/* Right Sidebar - Takes up 1/4 of the width on XL screens */}
                <div className="xl:col-span-1">
                  <div className="sticky top-6 lg:top-8">
                    <UnifiedRightSidebar template={selectedTemplate as 'template1' | 'template2'} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <p className="text-gray-400">
                    © 2024 Your Brand™. All rights reserved. | NMLS Consumer Access
                  </p>
                </div>
              </div>
            </footer>
          </Suspense>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
