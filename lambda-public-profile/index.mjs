import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CACHE_TTL_MS = Number(process.env.PROFILE_CACHE_TTL_MS) || 2 * 60 * 1000; // 2 min default
const profileCache = new Map();
const profileFetchPromises = new Map();

function mapUserRow(row) {
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

function mapLinkRow(row) {
  return {
    id: row.id,
    publicSlug: row.public_slug,
    isActive: row.is_active,
    currentUses: row.current_uses,
    maxUses: row.max_uses,
    expiresAt: row.expires_at,
  };
}

function mapTemplateRow(row) {
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

function corsHeaders(origin = '*') {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  };
}

async function getProfileBySlug(slug) {
  const cacheKey = `profile:${slug}`;
  const cached = profileCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { payload: cached.data, cache: 'HIT' };
  }

  let promise = profileFetchPromises.get(cacheKey);
  if (!promise) {
    promise = (async () => {
      const { data: linkRow, error: linkError } = await supabase
        .from('loan_officer_public_links')
        .select('id, user_id, company_id, public_slug, is_active, expires_at, max_uses, current_uses')
        .eq('public_slug', slug)
        .limit(1)
        .maybeSingle();

      if (linkError || !linkRow) throw { status: 404, message: 'Public profile not found' };

      const link = linkRow;
      if (!link.is_active) throw { status: 410, message: 'This profile is no longer available' };
      if (link.expires_at && new Date(link.expires_at) < new Date()) throw { status: 410, message: 'This profile has expired' };
      if (link.max_uses != null && link.current_uses >= link.max_uses) throw { status: 410, message: 'This profile has reached its usage limit' };

      (async () => {
        try {
          await supabase.from('public_link_usage').insert({
            link_id: link.id,
            ip_address: 'unknown',
            user_agent: null,
            referrer: null,
          });
          await supabase
            .from('loan_officer_public_links')
            .update({
              current_uses: (link.current_uses ?? 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', link.id);
        } catch (e) {
          console.warn('Failed to record usage analytics:', e);
        }
      })().catch(() => {});

      const [userRes, companyRes, pageSettingsRes] = await Promise.all([
        supabase.from('users').select('id, first_name, last_name, email, phone, nmls_number, avatar, role, is_active').eq('id', link.user_id).limit(1).maybeSingle(),
        supabase.from('companies').select('id, name, logo, website, address, phone, email, license_number, company_nmls_number, company_social_media').eq('id', link.company_id).limit(1).maybeSingle(),
        supabase.from('page_settings').select('template, settings, template_id').eq('officer_id', link.user_id).eq('is_published', true).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      const userData = userRes.data;
      const companyData = companyRes.data;
      const pageSettingsRow = pageSettingsRes.data;

      if (!userData) throw { status: 404, message: 'User data not found' };
      if (!companyData) throw { status: 404, message: 'Company data not found' };

      let templateData = null;
      const templateId = pageSettingsRow?.template_id;
      if (templateId) {
        const templateRes = await supabase.from('templates').select('*').eq('id', templateId).limit(1).maybeSingle();
        templateData = templateRes.data;
      }

      const payload = {
        success: true,
        data: {
          user: mapUserRow(userData),
          company: companyData,
          publicLink: {
            ...mapLinkRow(link),
            currentUses: (link.current_uses ?? 0) + 1,
          },
          pageSettings: pageSettingsRow
            ? { template: pageSettingsRow.template, settings: pageSettingsRow.settings, templateId: pageSettingsRow.template_id }
            : null,
          template: templateData ? mapTemplateRow(templateData) : null,
        },
      };

      profileCache.set(cacheKey, { data: payload, fetchedAt: Date.now() });
      profileFetchPromises.delete(cacheKey);
      return payload;
    })().catch((err) => {
      profileFetchPromises.delete(cacheKey);
      throw err;
    });
    profileFetchPromises.set(cacheKey, promise);
  }

  const payload = await promise;
  return { payload, cache: 'MISS' };
}

export const handler = async (event) => {
  const method = event.requestContext?.http?.method ?? event.httpMethod ?? 'GET';
  const rawPath = event.rawPath ?? event.path ?? '/';
  const origin = event.headers?.origin ?? event.headers?.Origin ?? '*';

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(origin), body: '' };
  }

  if (method !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders(origin),
      body: JSON.stringify({ success: false, message: 'Method not allowed' }),
    };
  }

  const slug = rawPath.replace(/^\//, '').split('/')[0] || rawPath.replace(/^\//, '');
  if (!slug) {
    return {
      statusCode: 400,
      headers: corsHeaders(origin),
      body: JSON.stringify({ success: false, message: 'Slug is required' }),
    };
  }

  try {
    const { payload, cache } = await getProfileBySlug(slug);
    const headers = { ...corsHeaders(origin), 'X-Cache': cache };
    return { statusCode: 200, headers, body: JSON.stringify(payload) };
  } catch (err) {
    if (err && typeof err.status === 'number') {
      return {
        statusCode: err.status,
        headers: corsHeaders(origin),
        body: JSON.stringify({ success: false, message: err.message ?? 'Not found' }),
      };
    }
    console.error('Error fetching public profile:', err);
    return {
      statusCode: 500,
      headers: corsHeaders(origin),
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: err?.message ?? 'Unknown error',
      }),
    };
  }
};
