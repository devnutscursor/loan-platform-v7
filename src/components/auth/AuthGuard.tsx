'use client';

import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'company_admin' | 'employee';
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  // TEMPORARILY DISABLED - conflicts with useAuth hook
  return <>{children}</>;
}
