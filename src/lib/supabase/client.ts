import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser Supabase client that stores session in cookies (SSR-compatible).
 * This is required for Next.js middleware/server to see the logged-in user.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export const supabase = createClient();