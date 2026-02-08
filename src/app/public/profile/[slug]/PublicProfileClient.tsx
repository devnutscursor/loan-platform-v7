'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import PublicProfileContent from '@/components/public/PublicProfileContent';

export interface PublicProfileData {
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
  company: Record<string, unknown>;
  publicLink: {
    id: string;
    publicSlug: string;
    isActive: boolean;
    currentUses: number;
    maxUses?: number;
    expiresAt?: string;
  };
  pageSettings?: { template: string; settings: any; templateId: string };
  template?: any;
}

export interface PublicTemplateData {
  template: any;
  pageSettings: any;
  metadata: { templateSlug: string; isCustomized: boolean; isPublished: boolean };
}

const PROFILE_STORAGE_PREFIX = 'lo:profile:';
const TEMPLATE_STORAGE_PREFIX = 'lo:template:';
const CACHE_TTL_MS = 5 * 60 * 1000;

const SkeletonLoader = () => (
  <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: '80px', backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }} />
    <div style={{ height: '300px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '200px', height: '200px', backgroundColor: '#e5e7eb', borderRadius: '50%' }} />
    </div>
    <div style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
      <div style={{ height: '20px', backgroundColor: '#e5e7eb', marginBottom: '1rem', borderRadius: '4px' }} />
      <div style={{ height: '20px', backgroundColor: '#e5e7eb', marginBottom: '1rem', borderRadius: '4px', width: '60%' }} />
    </div>
  </div>
);

const profileApiUrl = (s: string) => `/api/public-profile/${encodeURIComponent(s)}`;

export default function PublicProfileClient({
  initialProfileData,
  initialTemplateData,
  initialSlug,
}: {
  initialProfileData: PublicProfileData | null;
  initialTemplateData: PublicTemplateData | null;
  initialSlug: string | null;
}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const isPreview = searchParams.get('preview') === 'true';
  const previewTemplate = searchParams.get('template') as 'template1' | 'template2' | null;

  const hasInitial = initialSlug === slug && initialProfileData != null;
  const [profileData, setProfileData] = useState<PublicProfileData | null>(hasInitial ? initialProfileData : null);
  const [templateData, setTemplateData] = useState<PublicTemplateData | null>(hasInitial ? initialTemplateData : null);
  const [loading, setLoading] = useState(!hasInitial);
  const [error, setError] = useState<string | null>(null);

  const getStoredProfile = useCallback((s: string): PublicProfileData | null => {
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
  }, []);

  const setStoredProfile = useCallback((s: string, data: PublicProfileData) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${PROFILE_STORAGE_PREFIX}${s}`, JSON.stringify({ data, fetchedAt: Date.now() }));
    } catch {}
  }, []);

  const setStoredTemplate = useCallback((userId: string, templateSlug: string | null, data: PublicTemplateData) => {
    if (typeof window === 'undefined') return;
    try {
      const key = `${TEMPLATE_STORAGE_PREFIX}${userId}:${templateSlug ?? 'default'}`;
      localStorage.setItem(key, JSON.stringify({ data, fetchedAt: Date.now() }));
    } catch {}
  }, []);

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

      const data = profileResult.data as PublicProfileData;
      setProfileData(data);
      setStoredProfile(slug, data);

      const userId = data.user.id;
      const needTemplatesApi = (isPreview && !!previewTemplate) || !data.template;

      if (!needTemplatesApi && data.template) {
        const templateDataFromProfile: PublicTemplateData = {
          template: data.template,
          pageSettings: data.pageSettings ?? null,
          metadata: {
            templateSlug: data.template?.slug ?? 'template1',
            isCustomized: !data.template?.isDefault,
            isPublished: true,
          },
        };
        setTemplateData(templateDataFromProfile);
        setStoredTemplate(userId, isPreview && previewTemplate ? previewTemplate : null, templateDataFromProfile);
        setLoading(false);
        return;
      }

      let templateUrl = `/api/public-templates/${userId}`;
      if (isPreview && previewTemplate) templateUrl += `?template=${previewTemplate}`;
      const templateResponse = await fetch(templateUrl);
      const templateResult = await templateResponse.json();

      if (templateResult.success) {
        if (isPreview && previewTemplate) {
          templateResult.data.template = { ...templateResult.data.template, slug: previewTemplate };
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
  }, [slug, isPreview, previewTemplate, setStoredProfile, setStoredTemplate]);

  useEffect(() => {
    if (!slug) return;
    const storedProfile = getStoredProfile(slug);
    const templateSlug = isPreview && previewTemplate ? previewTemplate : null;
    const storedTemplate = storedProfile
      ? (() => {
          try {
            const key = `${TEMPLATE_STORAGE_PREFIX}${storedProfile.user.id}:${templateSlug ?? 'default'}`;
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const { data, fetchedAt } = JSON.parse(raw);
            if (!data || typeof fetchedAt !== 'number') return null;
            if (Date.now() - fetchedAt > CACHE_TTL_MS) return null;
            return data as PublicTemplateData;
          } catch {
            return null;
          }
        })()
      : null;

    if (storedProfile && (storedTemplate || true)) {
      setProfileData(storedProfile);
      if (storedTemplate) setTemplateData(storedTemplate);
      setLoading(false);
      return;
    }

    if (hasInitial && !(isPreview && previewTemplate)) {
      setLoading(false);
      return;
    }

    if (hasInitial && (isPreview && previewTemplate) && initialProfileData) {
      setLoading(false);
      const userId = initialProfileData.user.id;
      const templateUrl = `/api/public-templates/${userId}?template=${previewTemplate}`;
      fetch(templateUrl)
        .then((r) => r.json())
        .then((templateResult) => {
          if (templateResult.success) {
            templateResult.data.template = { ...templateResult.data.template, slug: previewTemplate };
            setTemplateData(templateResult.data);
            setStoredTemplate(userId, previewTemplate, templateResult.data);
          }
        })
        .catch(() => {});
      return;
    }

    if (!hasInitial) {
      setLoading(true);
      setProfileData(null);
      setTemplateData(null);
      fetchPublicProfileAndTemplate();
    }
  }, [slug, isPreview, previewTemplate, hasInitial, initialProfileData, getStoredProfile, setStoredTemplate, fetchPublicProfileAndTemplate]);

  const refreshProfile = useCallback(() => {
    setError(null);
    setLoading(true);
    setProfileData(null);
    setTemplateData(null);
    fetchPublicProfileAndTemplate();
  }, [fetchPublicProfileAndTemplate]);

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

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {(error.includes('no longer available') || error.includes('not found'))
              ? 'Profile Temporarily Unavailable'
              : 'Profile Not Available'}
          </h1>
          <p className="text-gray-600 mb-6">
            {(error.includes('no longer available') || error.includes('not found'))
              ? 'This profile link is currently inactive. It may be reactivated soon.'
              : error}
          </p>
          <div className="space-y-3">
            <Button onClick={refreshProfile} variant="primary" className="w-full">🔄 Try Again</Button>
            <Button onClick={() => window.location.href = '/'} variant="secondary" className="w-full">Go to Homepage</Button>
          </div>
          {(error.includes('no longer available') || error.includes('not found')) && (
            <p className="text-sm text-gray-500 mt-4">This page will automatically check for updates every 5 seconds.</p>
          )}
        </Card>
      </div>
    );
  }

  if (!profileData) return <SkeletonLoader />;

  return (
    <PublicProfileContent
      profileData={profileData}
      templateData={templateData}
      isPreview={false}
    />
  );
}
