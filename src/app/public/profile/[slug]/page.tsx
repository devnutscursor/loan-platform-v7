'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import PublicProfileContent from '@/components/public/PublicProfileContent';

interface PublicProfileData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nmlsNumber?: string;
    avatar?: string;
    role: string;
    isActive: boolean;
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
    company_social_media?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
  };
  publicLink: {
    id: string;
    publicSlug: string;
    isActive: boolean;
    currentUses: number;
    maxUses?: number;
    expiresAt?: string;
  };
  pageSettings?: {
    template: string;
    settings: any;
    templateId: string;
  };
  template?: any;
}

interface PublicTemplateData {
  template: any;
  pageSettings: any;
  metadata: {
    templateSlug: string;
    isCustomized: boolean;
    isPublished: boolean;
  };
}

// Skeleton Loading Component (same as internal profile)
const SkeletonLoader = () => (
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

export default function PublicProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  
  // Check if this is a preview mode from customizer
  const isPreview = searchParams.get('preview') === 'true';
  const previewTemplate = searchParams.get('template') as 'template1' | 'template2' | null;
  
  const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
  const [templateData, setTemplateData] = useState<PublicTemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    if (slug) {
      // Clear any previous error state and cached data when fetching new data
      setError(null);
      setLoading(true);
      setProfileData(null);
      setTemplateData(null);
      fetchPublicProfile();
    }
  }, [slug]);

  // Add a refresh mechanism that can be triggered externally
  const refreshProfile = useCallback(() => {
    console.log('🔄 Refreshing public profile data...');
    setError(null);
    setLoading(true);
    setProfileData(null);
    setTemplateData(null);
    fetchPublicProfile();
  }, [slug]);

  // Add periodic refresh to check if link status has changed
  useEffect(() => {
    if (error && (error.includes('no longer available') || error.includes('not found'))) {
      console.log('🔄 Link appears to be deactivated, setting up periodic refresh...');
      
      const interval = setInterval(() => {
        console.log('🔄 Checking if link has been reactivated...');
        refreshProfile();
      }, 5000); // Check every 5 seconds

      // Clean up interval after 2 minutes
      const timeout = setTimeout(() => {
        clearInterval(interval);
        console.log('⏰ Stopped checking for link reactivation');
      }, 120000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [error, refreshProfile]);

  // Separate effect to handle template selection after component mounts
  useEffect(() => {
    if (profileData?.user?.id) {
      const fetchTemplate = async () => {
        try {
          // In preview mode, use the preview template from query params
          // Otherwise, fetch from database
          const templateCacheBuster = Date.now();
          let templateResponse;
          
          if (isPreview && previewTemplate) {
            // Preview mode: fetch the specific template
            console.log('🎨 Preview mode: Fetching template', previewTemplate);
            templateResponse = await fetch(`/api/public-templates/${profileData.user.id}?template=${previewTemplate}&t=${templateCacheBuster}`);
          } else {
            // Normal mode: fetch from database
            templateResponse = await fetch(`/api/public-templates/${profileData.user.id}?t=${templateCacheBuster}`);
          }
          
          const templateResult = await templateResponse.json();
          console.log('🎨 Template API response:', templateResult);
          
          if (templateResult.success) {
            // Override template slug if in preview mode
            if (isPreview && previewTemplate) {
              templateResult.data.template = {
                ...templateResult.data.template,
                slug: previewTemplate
              };
            }
            setTemplateData(templateResult.data);
          } else {
            console.error('❌ Template API error:', templateResult.message);
          }
        } catch (err) {
          console.error('❌ Error fetching template:', err);
        }
      };

      fetchTemplate();
    }
  }, [profileData?.user?.id, isPreview, previewTemplate]);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching public profile for slug:', slug);
      
      // Fetch profile data and template data in parallel
      // Add cache-busting parameter to prevent browser caching
      const cacheBuster = Date.now();
      const [profileResponse, templateResponse] = await Promise.all([
        fetch(`/api/public-profile/${slug}?t=${cacheBuster}`),
        // We'll fetch template data after we get the profile data
        Promise.resolve(null)
      ]);
      
      console.log('📡 Profile API response status:', profileResponse.status);
      const profileResult = await profileResponse.json();
      console.log('📦 Profile API response data:', profileResult);

      if (profileResult.success) {
        setProfileData(profileResult.data);
        // Template fetching is handled in the separate useEffect
      } else {
        // Handle different types of errors more gracefully
        const errorMessage = profileResult.message || 'Failed to load profile';
        
        if (errorMessage.includes('no longer available') || errorMessage.includes('not found')) {
          // This is expected behavior when link is deactivated, log as info
          console.log('ℹ️ Profile link is currently unavailable:', errorMessage);
        } else {
          // This is an actual error, log as error
          console.error('❌ Profile API returned error:', errorMessage);
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error('❌ Error fetching public profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };


  // Debug: Always show loading state first
  console.log('🔍 Component render state:', { loading, error, profileData: !!profileData, slug });

  if (loading) {
    console.log('📱 Rendering loading state');
    return <SkeletonLoader />;
  }

  if (error) {
    console.log('❌ Rendering error state:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {(error.includes('no longer available') || error.includes('not found')) 
              ? 'Profile Temporarily Unavailable' 
              : 'Profile Not Available'
            }
          </h1>
          <p className="text-gray-600 mb-6">
            {(error.includes('no longer available') || error.includes('not found'))
              ? 'This profile link is currently inactive. It may be reactivated soon.'
              : error
            }
          </p>
          <div className="space-y-3">
            <Button 
              onClick={refreshProfile}
              variant="primary"
              className="w-full"
            >
              🔄 Try Again
            </Button>
            <Button 
              onClick={() => window.location.href = '/'}
              variant="secondary"
              className="w-full"
            >
              Go to Homepage
            </Button>
          </div>
          {(error.includes('no longer available') || error.includes('not found')) && (
            <p className="text-sm text-gray-500 mt-4">
              This page will automatically check for updates every 5 seconds.
            </p>
          )}
        </Card>
      </div>
    );
  }

  if (!profileData) {
    console.log('📱 Rendering no data state');
    return <SkeletonLoader />;
  }

  console.log('✅ Rendering profile data:', profileData);

  return (
    <PublicProfileContent
      profileData={profileData}
      templateData={templateData}
      isPreview={false}
    />
  );
}
