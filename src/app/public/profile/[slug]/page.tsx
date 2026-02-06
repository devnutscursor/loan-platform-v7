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

  const PROFILE_STORAGE_PREFIX = 'lo:profile:';
  const TEMPLATE_STORAGE_PREFIX = 'lo:template:';
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  // Option B: Lambda with Provisioned Concurrency (no cold start)
  const profileApiBase = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_PUBLIC_PROFILE_API_URL ?? '') : '';
  const profileApiUrl = (s: string) =>
    profileApiBase ? `${profileApiBase.replace(/\/$/, '')}/${encodeURIComponent(s)}` : `/api/public-profile/${s}`;

  const getStoredProfile = (s: string): PublicProfileData | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`${PROFILE_STORAGE_PREFIX}${s}`);
      if (!raw) return null;
      const { data, fetchedAt } = JSON.parse(raw);
      if (!data || typeof fetchedAt !== 'number') return null;
      if (Date.now() - fetchedAt > CACHE_TTL_MS) return null;
      return data as PublicProfileData;
    } catch {
      return null;
    }
  };

  const setStoredProfile = (s: string, data: PublicProfileData) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        `${PROFILE_STORAGE_PREFIX}${s}`,
        JSON.stringify({ data, fetchedAt: Date.now() })
      );
    } catch {
      // ignore
    }
  };

  const getStoredTemplate = (userId: string, templateSlug: string | null): PublicTemplateData | null => {
    if (typeof window === 'undefined') return null;
    try {
      const key = `${TEMPLATE_STORAGE_PREFIX}${userId}:${templateSlug ?? 'default'}`;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { data, fetchedAt } = JSON.parse(raw);
      if (!data || typeof fetchedAt !== 'number') return null;
      if (Date.now() - fetchedAt > CACHE_TTL_MS) return null;
      return data as PublicTemplateData;
    } catch {
      return null;
    }
  };

  const setStoredTemplate = (userId: string, templateSlug: string | null, data: PublicTemplateData) => {
    if (typeof window === 'undefined') return;
    try {
      const key = `${TEMPLATE_STORAGE_PREFIX}${userId}:${templateSlug ?? 'default'}`;
      localStorage.setItem(key, JSON.stringify({ data, fetchedAt: Date.now() }));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!slug) return;

    setError(null);

    const storedProfile = getStoredProfile(slug);
    const templateSlug = isPreview && previewTemplate ? previewTemplate : null;
    const storedTemplate = storedProfile
      ? getStoredTemplate(storedProfile.user.id, templateSlug)
      : null;

    if (storedProfile && (storedTemplate || true)) {
      setProfileData(storedProfile);
      if (storedTemplate) setTemplateData(storedTemplate);
      setLoading(false);
    } else {
      setLoading(true);
      setProfileData(null);
      setTemplateData(null);
    }

    const fetchPublicProfileAndTemplate = async () => {
      try {
        if (!storedProfile) setLoading(true);

        const profileResponse = await fetch(profileApiUrl(slug));
        const profileResult = await profileResponse.json();

        if (!profileResult.success) {
          const errorMessage = profileResult.message || 'Failed to load profile';
          setError(errorMessage);
          setLoading(false);
          return;
        }

        setProfileData(profileResult.data);
        setStoredProfile(slug, profileResult.data);

        const userId = profileResult.data.user.id;
        let templateUrl = `/api/public-templates/${userId}`;
        if (isPreview && previewTemplate) templateUrl += `?template=${previewTemplate}`;

        const templateResponse = await fetch(templateUrl);
        const templateResult = await templateResponse.json();

        if (templateResult.success) {
          if (isPreview && previewTemplate) {
            templateResult.data.template = {
              ...templateResult.data.template,
              slug: previewTemplate
            };
          }
          setTemplateData(templateResult.data);
          setStoredTemplate(userId, templateSlug, templateResult.data);
        }
      } catch (err) {
        console.error('Error fetching public profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfileAndTemplate();
  }, [slug, isPreview, previewTemplate, profileApiBase]);

  const fetchPublicProfileAndTemplate = useCallback(async () => {
    setError(null);
    setLoading(true);
    setProfileData(null);
    setTemplateData(null);

    try {
      const profileResponse = await fetch(profileApiUrl(slug));
      const profileResult = await profileResponse.json();

      if (!profileResult.success) {
        setError(profileResult.message || 'Failed to load profile');
        setLoading(false);
        return;
      }

      setProfileData(profileResult.data);
      setStoredProfile(slug, profileResult.data);

      const userId = profileResult.data.user.id;
      let templateUrl = `/api/public-templates/${userId}`;
      if (isPreview && previewTemplate) templateUrl += `?template=${previewTemplate}`;

      const templateResponse = await fetch(templateUrl);
      const templateResult = await templateResponse.json();

      if (templateResult.success) {
        if (isPreview && previewTemplate) {
          templateResult.data.template = {
            ...templateResult.data.template,
            slug: previewTemplate
          };
        }
        setTemplateData(templateResult.data);
        setStoredTemplate(userId, isPreview && previewTemplate ? previewTemplate : null, templateResult.data);
      }
    } catch (err) {
      console.error('Error fetching public profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [slug, isPreview, previewTemplate, profileApiBase]);

  const refreshProfile = useCallback(() => {
    setError(null);
    setLoading(true);
    setProfileData(null);
    setTemplateData(null);
    fetchPublicProfileAndTemplate();
  }, [fetchPublicProfileAndTemplate]);

  // Add periodic refresh to check if link status has changed
  useEffect(() => {
    if (error && (error.includes('no longer available') || error.includes('not found'))) {
      const interval = setInterval(() => refreshProfile(), 5000);
      const timeout = setTimeout(() => clearInterval(interval), 120000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [error, refreshProfile]);

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
