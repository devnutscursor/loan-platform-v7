'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';

// Template data interface
interface TemplateData {
  template: {
    id: string;
    slug: string;
    name: string;
    colors: any;
    typography: any;
    content: any;
    layout: any;
    advanced: any;
    classes: any;
    headerModifications?: any;
    bodyModifications?: any;
    rightSidebarModifications?: any;
  };
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

// Global template state interface
interface GlobalTemplateState {
  // Template data cache
  templates: Record<string, TemplateData>;
  
  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  getTemplate: (slug: string) => TemplateData | null;
  refreshTemplate: (slug: string) => Promise<void>;
  clearCache: () => void;
  
  // Status
  hasTemplate: (slug: string) => boolean;
  getTemplateCount: () => number;
}

// Create the context
const GlobalTemplateContext = createContext<GlobalTemplateState | undefined>(undefined);

// Provider component
export function GlobalTemplateProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<Record<string, TemplateData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Request deduplication - track ongoing requests
  const [fetchingTemplates, setFetchingTemplates] = useState<Set<string>>(new Set());

  // Fetch a single template with deduplication
  const fetchTemplate = useCallback(async (slug: string): Promise<TemplateData | null> => {
    if (!user) {
      console.log('⚠️ GlobalTemplate: No user, skipping fetch');
      return null;
    }

    // Check if already fetching this template
    if (fetchingTemplates.has(slug)) {
      console.log('⏳ GlobalTemplate: Template already being fetched:', slug);
      // Wait for the existing request to complete
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!fetchingTemplates.has(slug)) {
            clearInterval(checkInterval);
            const cachedTemplate = templates[slug];
            resolve(cachedTemplate || null);
          }
        }, 100);
      });
    }

    // Check client-side cache first
    const cacheKey = `template_${user.id}_${slug}`;
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          // Check if cache is still valid (5 minutes)
          if (Date.now() - parsedCache.timestamp < 5 * 60 * 1000) {
            console.log('✅ GlobalTemplate: Using client cache for:', slug);
            return parsedCache.data;
          }
        } catch (e) {
          // Invalid cache, remove it
          localStorage.removeItem(cacheKey);
        }
      }
    }

    try {
      console.log('🔍 GlobalTemplate: Fetching template:', slug);
      
      // Mark as fetching
      setFetchingTemplates(prev => new Set(prev).add(slug));
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`/api/templates/user/${slug}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch template');
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ GlobalTemplate: Template fetched successfully:', slug);
        
        // Cache in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: result.data,
            timestamp: Date.now()
          }));
        }
        
        return result.data;
      } else {
        throw new Error(result.error || 'API returned unsuccessful response');
      }

    } catch (err) {
      console.error('❌ GlobalTemplate: Error fetching template:', err);
      throw err;
    } finally {
      // Remove from fetching set
      setFetchingTemplates(prev => {
        const newSet = new Set(prev);
        newSet.delete(slug);
        return newSet;
      });
    }
  }, [user, fetchingTemplates]); // Remove templates from dependencies to prevent infinite loops

  // Initialize all templates with optimized loading
  const initializeTemplates = useCallback(async () => {
    if (!user || authLoading || isInitialized) return;
    
    console.log('🚀 GlobalTemplate: Initializing all templates...');
    setIsLoading(true);
    setError(null);

    try {
      const templatesToLoad = ['template1', 'template2'];
      
      // Check which templates are already cached
      const cachedTemplates: Record<string, TemplateData> = {};
      const uncachedSlugs: string[] = [];
      
      for (const slug of templatesToLoad) {
        const cacheKey = `template_${user.id}_${slug}`;
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const parsedCache = JSON.parse(cached);
              if (Date.now() - parsedCache.timestamp < 5 * 60 * 1000) {
                cachedTemplates[slug] = parsedCache.data;
                console.log('✅ GlobalTemplate: Using cached template:', slug);
                continue;
              }
            } catch (e) {
              localStorage.removeItem(cacheKey);
            }
          }
        }
        uncachedSlugs.push(slug);
      }
      
      // Only fetch uncached templates
      let fetchPromises: Promise<{ slug: string; templateData: TemplateData | null }>[] = [];
      if (uncachedSlugs.length > 0) {
        fetchPromises = uncachedSlugs.map(async (slug) => {
          try {
            const templateData = await fetchTemplate(slug);
            return { slug, templateData };
          } catch (error) {
            console.error(`❌ GlobalTemplate: Failed to load ${slug}:`, error);
            return { slug, templateData: null };
          }
        });
      }
      
      const fetchResults = await Promise.all(fetchPromises);
      
      // Combine cached and fetched templates
      const allTemplates: Record<string, TemplateData> = { ...cachedTemplates };
      fetchResults.forEach(({ slug, templateData }) => {
        if (templateData) {
          allTemplates[slug] = templateData;
        }
      });

      setTemplates(allTemplates);
      setIsInitialized(true);
      
      console.log('✅ GlobalTemplate: All templates initialized:', {
        total: Object.keys(allTemplates).length,
        cached: Object.keys(cachedTemplates).length,
        fetched: fetchResults.filter(r => r.templateData).length
      });
      
    } catch (error) {
      console.error('❌ GlobalTemplate: Error initializing templates:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize templates');
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading, isInitialized, fetchTemplate]);

  // Get template from cache
  const getTemplate = useCallback((slug: string): TemplateData | null => {
    return templates[slug] || null;
  }, [templates]);

  // Refresh a specific template
  const refreshTemplate = useCallback(async (slug: string) => {
    if (!user) return;
    
    try {
      console.log('🔄 GlobalTemplate: Refreshing template:', slug);
      
      // Clear client-side cache to force fresh fetch
      const cacheKey = `template_${user.id}_${slug}`;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(cacheKey);
        console.log('🗑️ GlobalTemplate: Cleared cache for:', slug);
        
        // Also clear efficient templates cache to ensure all components refresh
        localStorage.removeItem(cacheKey);
        console.log('🗑️ GlobalTemplate: Cleared efficient templates cache for:', slug);
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('templateRefreshed', { 
          detail: { slug, userId: user.id } 
        }));
        console.log('📡 GlobalTemplate: Dispatched template refresh event for:', slug);
      }
      
      const templateData = await fetchTemplate(slug);
      
      if (templateData) {
        setTemplates(prev => ({
          ...prev,
          [slug]: templateData
        }));
        console.log('✅ GlobalTemplate: Template refreshed and context updated:', slug);
      }
    } catch (error) {
      console.error('❌ GlobalTemplate: Error refreshing template:', error);
    }
  }, [user, fetchTemplate]);

  // Clear cache
  const clearCache = useCallback(() => {
    console.log('🗑️ GlobalTemplate: Clearing cache');
    setTemplates({});
    setIsInitialized(false);
    setError(null);
    setFetchingTemplates(new Set());
    
    // Clear localStorage cache
    if (typeof window !== 'undefined' && user) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`template_${user.id}_`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }, [user]);

  // Check if template exists
  const hasTemplate = useCallback((slug: string): boolean => {
    return !!templates[slug];
  }, [templates]);

  // Get template count
  const getTemplateCount = useCallback((): number => {
    return Object.keys(templates).length;
  }, [templates]);

  // Initialize templates when user is available
  useEffect(() => {
    if (!authLoading && user && !isInitialized) {
      initializeTemplates();
    } else if (!authLoading && !user) {
      clearCache();
    }
  }, [user, authLoading, isInitialized]); // Removed function dependencies to prevent infinite loops

  // Create the context value
  const contextValue: GlobalTemplateState = {
    templates,
    isLoading: isLoading || authLoading,
    isInitialized,
    error,
    getTemplate,
    refreshTemplate,
    clearCache,
    hasTemplate,
    getTemplateCount,
  };

  return (
    <GlobalTemplateContext.Provider value={contextValue}>
      {children}
    </GlobalTemplateContext.Provider>
  );
}

// Hook to use the global template state
export function useGlobalTemplates() {
  const context = useContext(GlobalTemplateContext);
  
  if (context === undefined) {
    throw new Error('useGlobalTemplates must be used within a GlobalTemplateProvider');
  }
  
  return context;
}

// Hook for getting a specific template (with fallback)
export function useTemplate(slug: string) {
  const { getTemplate, isLoading, isInitialized } = useGlobalTemplates();
  
  const templateData = getTemplate(slug);
  
  // Provide fallback template data to prevent flickering
  const fallbackTemplate: TemplateData = {
    template: {
      id: 'fallback',
      slug,
      name: 'Loading...',
      colors: {
        primary: '#ec4899',
        secondary: '#3b82f6',
        background: '#ffffff',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb'
      },
      typography: {
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        }
      },
      content: {
        headline: 'Loading...',
        subheadline: 'Please wait while we load your template.',
        ctaText: 'Get Started',
        companyName: 'Your Company'
      },
      layout: {
        alignment: 'center',
        spacing: 16,
        borderRadius: 8,
        padding: 24
      },
      advanced: {
        customCSS: '',
        accessibility: true
      },
      classes: {},
      headerModifications: {},
      bodyModifications: {},
      rightSidebarModifications: {}
    },
    userInfo: {
      userId: '',
      companyId: '',
      companyName: '',
      userRole: '',
      hasCustomSettings: false
    },
    metadata: {
      templateSlug: slug,
      isCustomized: false,
      isPublished: false
    }
  };

  // Return real template if available, otherwise fallback
  return {
    templateData: templateData || fallbackTemplate,
    isLoading: isLoading || (!isInitialized && !templateData), // Only show loading if we don't have data AND not initialized
    isFallback: !templateData,
    hasTemplate: !!templateData
  };
}
