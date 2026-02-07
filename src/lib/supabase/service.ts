import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Single global Supabase client with service role for API routes.
 * Created once at module load so connection is reused across requests (no per-request init).
 */
let serviceClient: SupabaseClient | null = null;

export function getSupabaseService(): SupabaseClient {
  if (!serviceClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
    serviceClient = createClient(url, key);
  }
  return serviceClient;
}
