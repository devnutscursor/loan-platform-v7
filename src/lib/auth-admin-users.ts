import type { SupabaseClient, User } from '@supabase/supabase-js';

export function normalizeInviteEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Find an Auth user by email (paginated listUsers — do not rely on first page only).
 */
export async function findAuthUserByEmail(
  supabase: SupabaseClient,
  email: string,
): Promise<User | null> {
  const normalized = normalizeInviteEmail(email);
  let page = 1;
  const perPage = 1000;

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const user = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (user) return user;

    if (!data.users.length || data.users.length < perPage) return null;
    page += 1;
  }
}
