'use client';

import { supabase } from '@/lib/supabase/client';

/**
 * Utility functions for profile management with cache invalidation
 */
export class ProfileManager {
  private static readonly CACHE_KEY = 'loan_officer_profile_cache';

  /**
   * Clear the profile cache
   */
  static clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('🗑️ Profile cache cleared via ProfileManager');
    } catch (error) {
      console.error('Error clearing profile cache:', error);
    }
  }

  /**
   * Update user profile and clear cache
   */
  static async updateProfile(userId: string, updates: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    avatar?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
      }

      // Clear cache after successful update
      this.clearCache();
      console.log('✅ Profile updated and cache cleared');

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Force refresh profile data by clearing cache
   */
  static forceRefresh(): void {
    this.clearCache();
    console.log('🔄 Profile cache cleared for force refresh');
  }

  /**
   * Check if cache exists and is valid
   */
  static isCacheValid(): boolean {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return false;

      const parsedCache = JSON.parse(cached);
      const cacheAge = Date.now() - new Date(parsedCache.cachedAt).getTime();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      return cacheAge < CACHE_DURATION;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }
}
