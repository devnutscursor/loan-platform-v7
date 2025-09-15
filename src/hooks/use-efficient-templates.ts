'use client';

import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { TemplateContext } from '@/contexts/TemplateContext';

interface EfficientTemplateData {
  template: any;
  userInfo: {
    userId: string;
    companyId: string;
    companyName: string;
    userRole: string;
    hasCustomSettings: boolean;
  };
  metadata: {
    templateSlug: string;
    isCustomized: boolean;
    isPublished: boolean;
  };
}

export function useEfficientTemplates() {
  const { user, loading: authLoading } = useAuth();
  const templateContext = useContext(TemplateContext);
  const [templateData, setTemplateData] = useState<Record<string, EfficientTemplateData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingTemplates, setFetchingTemplates] = useState<Set<string>>(new Set());
  const hasPreloadedRef = useRef(false);

  // Debug logging
  console.log('🔍 useEfficientTemplates hook state:', {
    hasUser: !!user,
    authLoading,
    isLoading,
    templateCount: Object.keys(templateData).length,
    error
  });

  // Fetch a specific template efficiently
  const fetchTemplate = useCallback(async (templateSlug: string, forceRefresh = false) => {
    if (!user) {
      console.log('⚠️ EfficientTemplates: No user, skipping fetch');
      return;
    }

    // Check if we already have this template cached
    if (!forceRefresh && templateData[templateSlug]) {
      console.log('✅ EfficientTemplates: Using cached template:', templateSlug);
      return templateData[templateSlug];
    }

    // Check if we're already fetching this template to prevent duplicate requests
    if (fetchingTemplates.has(templateSlug)) {
      console.log('⏳ EfficientTemplates: Already fetching template, waiting:', templateSlug);
      // Wait for the existing request to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (templateData[templateSlug]) {
            clearInterval(checkInterval);
            resolve(templateData[templateSlug]);
          } else if (!fetchingTemplates.has(templateSlug)) {
            clearInterval(checkInterval);
            resolve(null);
          }
        }, 100);
      });
    }

    // Mark this template as being fetched
    setFetchingTemplates(prev => new Set(prev).add(templateSlug));
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 EfficientTemplates: Fetching template:', templateSlug);
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`/api/templates/user/${templateSlug}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 EfficientTemplates API Response status:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const result = await response.json();
      console.log('🔍 EfficientTemplates API Response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch template');
      }

      if (result.success) {
        // Cache the template data
        setTemplateData(prev => ({
          ...prev,
          [templateSlug]: result.data
        }));
        setError(null);
        console.log('✅ EfficientTemplates: Template fetched and cached:', templateSlug);
        return result.data;
      } else {
        throw new Error(result.error || 'API returned unsuccessful response');
      }

    } catch (err) {
      console.error('❌ EfficientTemplates: Error fetching template:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch template');
      throw err;
    } finally {
      setIsLoading(false);
      // Remove from fetching set
      setFetchingTemplates(prev => {
        const newSet = new Set(prev);
        newSet.delete(templateSlug);
        return newSet;
      });
    }
  }, [user, templateData, fetchingTemplates]);

  // Get a specific template (from cache or fetch if needed)
  const getTemplate = useCallback(async (templateSlug: string) => {
    // If we have it cached, return it
    if (templateData[templateSlug]) {
      return templateData[templateSlug];
    }
    
    // Otherwise fetch it
    return await fetchTemplate(templateSlug);
  }, [templateData, fetchTemplate]);

  // Get template data synchronously (from cache only)
  const getTemplateSync = useCallback((templateSlug: string) => {
    // If we're in customizer mode with custom template, use it
    if (templateContext && templateContext.isCustomizerMode && templateContext.customTemplate) {
      console.log('🎨 EfficientTemplates: Using customizer template from context:', templateSlug);
      return {
        template: templateContext.customTemplate,
        userInfo: {
          userId: user?.id || '',
          companyId: '',
          companyName: '',
          userRole: '',
          hasCustomSettings: true
        },
        metadata: {
          templateSlug,
          isCustomized: true,
          isPublished: false
        }
      };
    }
    
    // Otherwise, use cached template data
    return templateData[templateSlug] || null;
  }, [templateData, templateContext, user]);

  // Refresh a specific template
  const refreshTemplate = useCallback(async (templateSlug: string) => {
    return await fetchTemplate(templateSlug, true);
  }, [fetchTemplate]);

  // Preload all templates for better performance
  const preloadTemplates = useCallback(async () => {
    if (!user) return;
    
    const templatesToPreload = ['template1', 'template2'];
    const promises = templatesToPreload.map(templateSlug => {
      // Check current state at the time of execution
      if (!templateData[templateSlug] && !fetchingTemplates.has(templateSlug)) {
        return fetchTemplate(templateSlug);
      }
      return Promise.resolve();
    });
    
    try {
      await Promise.all(promises);
      console.log('✅ EfficientTemplates: All templates preloaded');
    } catch (error) {
      console.error('❌ EfficientTemplates: Error preloading templates:', error);
    }
  }, [user, fetchTemplate]);

  // Save template settings
  const saveTemplateSettings = useCallback(async (templateSlug: string, customSettings: any, isPublished = false) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('🔍 EfficientTemplates: Saving template settings:', {
        templateSlug,
        customSettings,
        isPublished
      });

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch('/api/templates/user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateSlug,
          customSettings,
          isPublished
        }),
      });

      console.log('🔍 EfficientTemplates Save Response status:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const result = await response.json();
      console.log('🔍 EfficientTemplates Save Response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save template settings');
      }

      if (result.success) {
        // Refresh the template after successful save
        await fetchTemplate(templateSlug, true);
        console.log('✅ EfficientTemplates: Template settings saved and refreshed');
        return result.data;
      } else {
        throw new Error(result.error || 'API returned unsuccessful response');
      }

    } catch (err) {
      console.error('❌ EfficientTemplates: Error saving template settings:', err);
      throw err;
    }
  }, [user, fetchTemplate]);

  // Clear cache
  const clearCache = useCallback(() => {
    console.log('🗑️ EfficientTemplates: Clearing cache');
    setTemplateData({});
  }, []);

  // Auto-fetch templates when user changes
  useEffect(() => {
    if (!authLoading && user && !hasPreloadedRef.current) {
      console.log('🔍 EfficientTemplates: User loaded, preloading templates');
      hasPreloadedRef.current = true;
      // Preload templates when user is available
      preloadTemplates().catch(error => {
        console.error('❌ EfficientTemplates: Error preloading templates:', error);
      });
    } else if (!authLoading && !user) {
      console.log('🔍 EfficientTemplates: No user, clearing data');
      hasPreloadedRef.current = false;
      setTemplateData({});
      setIsLoading(false);
      setError(null);
    }
  }, [user, authLoading]);

  // Listen for storage changes to refresh templates when other tabs/components update them
  useEffect(() => {
    if (!user) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith(`template_${user.id}_`) && e.newValue === null) {
        // Template cache was cleared, refresh the template
        const templateSlug = e.key.replace(`template_${user.id}_`, '');
        console.log('🔄 EfficientTemplates: Template cache cleared, refreshing:', templateSlug);
        fetchTemplate(templateSlug, true).catch(error => {
          console.error('❌ EfficientTemplates: Error refreshing template after cache clear:', error);
        });
      }
    };

    const handleTemplateRefresh = (e: CustomEvent) => {
      const { slug, userId } = e.detail;
      if (userId === user.id) {
        console.log('🔄 EfficientTemplates: Template refresh event received, refreshing:', slug);
        fetchTemplate(slug, true).catch(error => {
          console.error('❌ EfficientTemplates: Error refreshing template after refresh event:', error);
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('templateRefreshed', handleTemplateRefresh as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('templateRefreshed', handleTemplateRefresh as EventListener);
    };
  }, [user, fetchTemplate]);

  return {
    // Data
    templateData,
    
    // State
    isLoading: isLoading || authLoading,
    error,
    
    // Actions
    getTemplate,
    getTemplateSync,
    fetchTemplate,
    refreshTemplate,
    preloadTemplates,
    saveTemplateSettings,
    clearCache,
    
    // Helper methods
    hasTemplate: (templateSlug: string) => !!templateData[templateSlug],
    getTemplateCount: () => Object.keys(templateData).length
  };
}
