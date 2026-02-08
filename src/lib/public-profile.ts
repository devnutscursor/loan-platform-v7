import { getSupabaseService } from '@/lib/supabase/service';

const PROFILE_CACHE_TTL_MS = 120_000;
const profileCache = new Map<string, { data: any; fetchedAt: number }>();
const profileFetchPromises = new Map<string, Promise<any>>();

function mapUserRow(row: any) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    nmlsNumber: row.nmls_number,
    avatar: row.avatar,
    role: row.role,
    isActive: row.is_active,
  };
}

function mapLinkRow(row: any) {
  return {
    id: row.id,
    publicSlug: row.public_slug,
    isActive: row.is_active,
    currentUses: row.current_uses,
    maxUses: row.max_uses,
    expiresAt: row.expires_at,
  };
}

function mapTemplateRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    previewImage: row.preview_image,
    isActive: row.is_active,
    isPremium: row.is_premium,
    isDefault: row.is_default,
    userId: row.user_id,
    colors: row.colors,
    typography: row.typography,
    content: row.content,
    layout: row.layout,
    advanced: row.advanced,
    classes: row.classes,
    headerModifications: row.header_modifications,
    bodyModifications: row.body_modifications,
    rightSidebarModifications: row.right_sidebar_modifications,
    footerModifications: row.footer_modifications,
    layoutConfig: row.layout_config,
    isSelected: row.is_selected,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Fetch public profile + template by slug. Shared by API route and server component.
 * Returns { success: true, data } or throws { status: number, message: string }.
 */
export async function getPublicProfileData(slug: string): Promise<{ success: true; data: any }> {
  const cacheKey = `profile:${slug}`;
  const cached = profileCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < PROFILE_CACHE_TTL_MS) {
    return cached.data;
  }

  let promise = profileFetchPromises.get(cacheKey);
  if (!promise) {
    promise = (async () => {
      const supabase = getSupabaseService();
      const { data: linkRow, error: linkError } = await supabase
        .from('loan_officer_public_links')
        .select('id, user_id, company_id, public_slug, is_active, expires_at, max_uses, current_uses')
        .eq('public_slug', slug)
        .limit(1)
        .maybeSingle();

      if (linkError || !linkRow) {
        throw { status: 404, message: 'Public profile not found' };
      }

      const link = linkRow as any;
      if (!link.is_active) {
        throw { status: 410, message: 'This profile is no longer available' };
      }
      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        throw { status: 410, message: 'This profile has expired' };
      }
      if (link.max_uses != null && link.current_uses >= link.max_uses) {
        throw { status: 410, message: 'This profile has reached its usage limit' };
      }

      const [userRes, companyRes, pageSettingsRes, selRes, t1UserRes, t1DefaultRes, anyDefaultRes] = await Promise.all([
        supabase
          .from('users')
          .select('id, first_name, last_name, email, phone, nmls_number, avatar, role, is_active')
          .eq('id', link.user_id)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('companies')
          .select('id, name, logo, website, address, phone, email, license_number, company_nmls_number, company_social_media')
          .eq('id', link.company_id)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('page_settings')
          .select('template, settings, template_id')
          .eq('officer_id', link.user_id)
          .eq('is_published', true)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('templates')
          .select('*')
          .eq('user_id', link.user_id)
          .eq('is_selected', true)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('templates')
          .select('*')
          .eq('slug', 'template1')
          .eq('user_id', link.user_id)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('templates')
          .select('*')
          .eq('slug', 'template1')
          .eq('is_default', true)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('templates')
          .select('*')
          .eq('is_default', true)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle(),
      ]);

      const userData = userRes.data;
      const companyData = companyRes.data;
      const pageSettingsRow = pageSettingsRes.data;

      if (!userData) throw { status: 404, message: 'User data not found' };
      if (!companyData) throw { status: 404, message: 'Company data not found' };

      const templateId = pageSettingsRow && (pageSettingsRow as any).template_id;
      const defaultTemplateRow =
        selRes.data ?? t1UserRes.data ?? t1DefaultRes.data ?? anyDefaultRes.data;
      let templateData: any =
        defaultTemplateRow && (!templateId || defaultTemplateRow.id === templateId)
          ? defaultTemplateRow
          : null;
      if (templateId && !templateData) {
        const templateRes = await supabase
          .from('templates')
          .select('*')
          .eq('id', templateId)
          .limit(1)
          .maybeSingle();
        templateData = templateRes.data;
      }

      const payload = {
        success: true as const,
        data: {
          user: mapUserRow(userData),
          company: companyData,
          publicLink: {
            ...mapLinkRow(link),
            currentUses: (link.current_uses ?? 0) + 1,
          },
          pageSettings: pageSettingsRow
            ? {
                template: (pageSettingsRow as any).template,
                settings: (pageSettingsRow as any).settings,
                templateId: (pageSettingsRow as any).template_id,
              }
            : null,
          template: templateData ? mapTemplateRow(templateData) : null,
        },
      };

      profileCache.set(cacheKey, { data: payload, fetchedAt: Date.now() });
      profileFetchPromises.delete(cacheKey);
      return payload;
    })()
      .then((p) => p)
      .catch((err) => {
        profileFetchPromises.delete(cacheKey);
        throw err;
      });
    profileFetchPromises.set(cacheKey, promise);
  }

  return promise;
}
