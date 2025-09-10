'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export interface LoanOfficerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  nmlsNumber: string | null;
  title: string | null;
  company?: {
    id: string;
    name: string;
    logo: string | null;
    website: string | null;
    phone: string | null;
    email: string | null;
  };
  isOnline: boolean;
  lastLoginAt: string | null;
}

interface CachedProfile {
  profile: LoanOfficerProfile;
  userId: string;
  userEmail: string;
  cachedAt: string;
  lastLoginAt: string | null;
}

const CACHE_KEY = 'loan_officer_profile_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useProfileCache() {
  const [profile, setProfile] = useState<LoanOfficerProfile | null>(null);
  const [loading, setLoading] = useState(false); // Start with false, will be set to true when fetching
  const [error, setError] = useState<string | null>(null);

  console.log('🔍 useProfileCache hook initialized:', { loading, hasProfile: !!profile });

  // Get cached profile from localStorage
  const getCachedProfile = useCallback((): CachedProfile | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsedCache: CachedProfile = JSON.parse(cached);
      
      // Check if cache is expired
      const cacheAge = Date.now() - new Date(parsedCache.cachedAt).getTime();
      if (cacheAge > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return parsedCache;
    } catch (error) {
      console.error('Error reading cached profile:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, []);

  // Save profile to cache
  const saveToCache = useCallback((profile: LoanOfficerProfile, userId: string, userEmail: string) => {
    try {
      const cacheData: CachedProfile = {
        profile,
        userId,
        userEmail,
        cachedAt: new Date().toISOString(),
        lastLoginAt: profile.lastLoginAt,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 Profile cached successfully');
    } catch (error) {
      console.error('Error saving profile to cache:', error);
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Profile cache cleared');
  }, []);

  // Check if cached profile matches current user
  const isCacheValid = useCallback((cachedProfile: CachedProfile, currentUser: User): boolean => {
    // Only check userId and email - don't compare lastLoginAt as it causes cache invalidation
    const isValid = (
      cachedProfile.userId === currentUser.id &&
      cachedProfile.userEmail === currentUser.email
    );
    
    if (!isValid) {
      console.log('❌ Cache invalid - user mismatch:', {
        cachedUserId: cachedProfile.userId,
        currentUserId: currentUser.id,
        cachedEmail: cachedProfile.userEmail,
        currentEmail: currentUser.email
      });
    } else {
      console.log('✅ Cache valid for user:', currentUser.email);
    }
    
    return isValid;
  }, []);

  // Fetch fresh profile data
  const fetchProfile = useCallback(async (user: User): Promise<LoanOfficerProfile> => {
    console.log('🔍 Fetching fresh profile data for user:', user.email);

    // Fetch user data from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        avatar,
        last_login_at,
        created_at
      `)
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('❌ Error fetching user data:', userError);
      throw new Error('Failed to fetch user data');
    }

    console.log('✅ User data fetched:', userData);

    // Fetch company data
    const { data: companyData, error: companyError } = await supabase
      .from('user_companies')
      .select(`
        role,
        companies!inner(
          id,
          name,
          logo,
          website,
          phone,
          email,
          license_number,
          address
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (companyError) {
      console.error('❌ Error fetching company data:', companyError);
    }

    console.log('✅ Company data fetched:', companyData);

    // Determine if user is online
    const isOnline = userData.last_login_at 
      ? new Date(userData.last_login_at).getTime() > (Date.now() - 5 * 60 * 1000)
      : false;

    // Build profile object
    const profileData: LoanOfficerProfile = {
      id: userData.id,
      firstName: userData.first_name || userData.email?.split('@')[0] || 'User',
      lastName: userData.last_name || 'Smith',
      email: userData.email,
      phone: userData.phone || null,
      avatar: userData.avatar,
      nmlsNumber: null, // Not in database schema
      title: null, // Not in database schema
      company: companyData?.companies ? {
        id: (companyData.companies as any).id,
        name: (companyData.companies as any).name,
        logo: (companyData.companies as any).logo,
        website: (companyData.companies as any).website,
        phone: (companyData.companies as any).phone,
        email: (companyData.companies as any).email,
      } : undefined,
      isOnline,
      lastLoginAt: userData.last_login_at,
    };

    console.log('🎉 Fresh profile data built:', profileData);

    // Update last login time
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    return profileData;
  }, []);

  // Main function to get profile (with caching logic)
  const getProfile = useCallback(async (user: User | null, authLoading: boolean) => {
    console.log('🔄 getProfile called:', { user: user?.email, authLoading });
    
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...');
      return; // Wait for auth to load
    }
    
    try {
      console.log('🚀 Starting profile fetch...');
      setLoading(true);
      setError(null);

      if (!user) {
        console.log('⚠️ No authenticated user, using fallback');
        const fallbackProfile: LoanOfficerProfile = {
          id: 'fallback',
          firstName: 'User',
          lastName: 'Smith',
          email: 'user@example.com',
          phone: null,
          nmlsNumber: null,
          title: null,
          isOnline: true,
        };
        setProfile(fallbackProfile);
        return;
      }

      // Check if we already have a valid profile for this user
      if (profile && profile.id === user.id && profile.email === user.email) {
        console.log('✅ Profile already loaded for user:', user.email);
        setLoading(false);
        return;
      }

      // Check cache first
      const cachedProfile = getCachedProfile();
      
      if (cachedProfile && isCacheValid(cachedProfile, user)) {
        console.log('✅ Using cached profile data');
        setProfile(cachedProfile.profile);
        return;
      }

      console.log('🔄 Cache invalid or expired, fetching fresh data');
      
      // Fetch fresh data
      const freshProfile = await fetchProfile(user);
      
      // Save to cache
      saveToCache(freshProfile, user.id, user.email);
      
      // Set profile
      setProfile(freshProfile);

    } catch (err) {
      console.error('❌ Error in getProfile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      
      // Try to use cached data even if expired as fallback
      const cachedProfile = getCachedProfile();
      if (cachedProfile) {
        console.log('⚠️ Using expired cached data as fallback');
        setProfile(cachedProfile.profile);
      } else {
        // Use fallback data
        const fallbackProfile: LoanOfficerProfile = {
          id: 'fallback',
          firstName: 'User',
          lastName: 'Smith',
          email: 'user@example.com',
          phone: null,
          nmlsNumber: null,
          title: null,
          isOnline: true,
        };
        setProfile(fallbackProfile);
      }
    } finally {
      setLoading(false);
    }
  }, [getCachedProfile, isCacheValid, fetchProfile, saveToCache]);

  // Force refresh profile (bypass cache)
  const refreshProfile = useCallback(async (user: User | null) => {
    if (!user) return;
    
    console.log('🔄 Force refreshing profile data');
    clearCache();
    await getProfile(user, false);
  }, [clearCache, getProfile]);

  return {
    profile,
    loading,
    error,
    getProfile,
    refreshProfile,
    clearCache,
  };
}
