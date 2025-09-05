'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// interface Company {
//   id: string;
//   name: string;
// }

interface UserRole {
  role: 'super_admin' | 'company_admin' | 'employee';
  companyId?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // For free Supabase plan, we rely only on onAuthStateChange
    // No initial session check to avoid getSession() calls

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('🔐 useAuth: Auth state changed:', event, session?.user?.email);
        
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          console.log('🔐 useAuth: User authenticated:', session.user.email, 'Event:', event);
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log('🔐 useAuth: User signed out');
          setUser(null);
          setUserRole(null);
          setCompanyId(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Handle token refresh - user is still signed in
          console.log('🔐 useAuth: Token refreshed, user still signed in:', session.user.email);
          setUser(session.user);
          await fetchUserRole(session.user.id);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('🔍 useAuth: Fetching user role for:', userId);
      
      // First check if user is super admin
      const { data: superAdmin } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .eq('role', 'super_admin')
        .single();

      if (superAdmin) {
        console.log('🔍 useAuth: User is super admin');
        setUserRole({ role: 'super_admin' });
        return;
      }

      // Check if user is company admin
      const { data: companyAdmin } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .eq('role', 'company_admin')
        .single();

      if (companyAdmin) {
        console.log('🔍 useAuth: User is company admin');
        // Get company ID for company admin
        const { data: userCompany } = await supabase
          .from('user_companies')
          .select('company_id')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .single();

        if (userCompany) {
          console.log('🔍 useAuth: Found company ID:', userCompany.company_id);
          setUserRole({ role: 'company_admin', companyId: userCompany.company_id });
          setCompanyId(userCompany.company_id);
        } else {
          console.log('🔍 useAuth: No company found for company admin');
          setUserRole({ role: 'company_admin' });
        }
        return;
      }

      // Check user-company relationship for employees
      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('company_id, role')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (userCompanies && userCompanies.length > 0) {
        // Use the first active company relationship
        const userCompany = userCompanies[0];
        console.log('🔍 useAuth: User is employee with company:', userCompany.company_id);
        setUserRole({ role: 'employee', companyId: userCompany.company_id });
        setCompanyId(userCompany.company_id);
      } else {
        console.log('🔍 useAuth: No user-company relationship found');
      }
    } catch (error) {
      console.error('🔍 useAuth: Error fetching user role:', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      setCompanyId(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isSuperAdmin = userRole?.role === 'super_admin';
  const isCompanyAdmin = userRole?.role === 'company_admin';
  const isEmployee = userRole?.role === 'employee';

  return {
    user,
    userRole,
    companyId,
    loading: loading || !mounted,
    signOut,
    isSuperAdmin,
    isCompanyAdmin,
    isEmployee,
    isAuthenticated: !!user,
  };
}
