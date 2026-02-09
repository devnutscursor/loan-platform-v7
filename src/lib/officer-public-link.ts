import { getSupabaseService } from '@/lib/supabase/service';

export type OfficerPublicLink = {
  id: string;
  publicSlug: string;
  isActive: boolean;
  currentUses: number;
  maxUses: number | null;
  expiresAt: string | null;
  createdAt: string;
};

function mapRow(row: any): OfficerPublicLink | null {
  if (!row) return null;
  return {
    id: row.id,
    publicSlug: row.public_slug,
    isActive: row.is_active,
    currentUses: row.current_uses ?? 0,
    maxUses: row.max_uses,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

/**
 * Fetch the officer's active public link server-side (for RSC).
 * Gets company from user_companies, then active link from loan_officer_public_links.
 * Returns null if no link or not found.
 */
export async function getOfficerPublicLinkServer(userId: string): Promise<OfficerPublicLink | null> {
  const supabase = getSupabaseService();

  const { data: userCompany, error: ucError } = await supabase
    .from('user_companies')
    .select('company_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (ucError || !userCompany?.company_id) return null;

  const companyId = (userCompany as { company_id: string }).company_id;

  const { data: linkRow, error: linkError } = await supabase
    .from('loan_officer_public_links')
    .select('id, public_slug, is_active, current_uses, max_uses, expires_at, created_at')
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (linkError || !linkRow) return null;

  return mapRow(linkRow);
}
