import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TEMPLATE_CACHE_TTL_MS = 30000;
const templateCache = new Map<
  string,
  { data: { success: true; data: any }; fetchedAt: number }
>();
const templateFetchPromises = new Map<string, Promise<{ success: true; data: any }>>();

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

export const revalidate = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const requestedTemplateSlug = searchParams.get('template');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const cacheKey = `templates:${userId}:${requestedTemplateSlug ?? 'default'}`;
    const cached = templateCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < TEMPLATE_CACHE_TTL_MS) {
      const res = NextResponse.json(cached.data);
      res.headers.set('X-Cache', 'HIT');
      res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
      return res;
    }

    let promise = templateFetchPromises.get(cacheKey);
    if (!promise) {
      promise = (async () => {
        let templateRow: any = null;

        if (requestedTemplateSlug) {
          const [userRes, defaultRes] = await Promise.all([
            supabase
              .from('templates')
              .select('*')
              .eq('user_id', userId)
              .eq('slug', requestedTemplateSlug)
              .eq('is_active', true)
              .limit(1)
              .maybeSingle(),
            supabase
              .from('templates')
              .select('*')
              .eq('slug', requestedTemplateSlug)
              .eq('is_default', true)
              .eq('is_active', true)
              .limit(1)
              .maybeSingle(),
          ]);
          templateRow = userRes.data ?? defaultRes.data;
        } else {
          const [selRes, t1UserRes, t1DefaultRes, anyDefaultRes] = await Promise.all([
            supabase
              .from('templates')
              .select('*')
              .eq('user_id', userId)
              .eq('is_selected', true)
              .eq('is_active', true)
              .limit(1)
              .maybeSingle(),
            supabase
              .from('templates')
              .select('*')
              .eq('slug', 'template1')
              .eq('user_id', userId)
              .eq('is_default', false)
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
          templateRow =
            selRes.data ??
            t1UserRes.data ??
            t1DefaultRes.data ??
            anyDefaultRes.data;
        }

        if (!templateRow) {
          throw { status: 404, message: 'No template found' };
        }

        const template = mapTemplateRow(templateRow);
        const finalTemplate = requestedTemplateSlug
          ? { ...template, slug: requestedTemplateSlug }
          : template;

        const payload = {
          success: true as const,
          data: {
            template: finalTemplate,
            pageSettings: null,
            metadata: {
              templateSlug: finalTemplate.slug,
              isCustomized: !finalTemplate.isDefault,
              isPublished: true,
            },
          },
        };

        templateCache.set(cacheKey, { data: payload, fetchedAt: Date.now() });
        templateFetchPromises.delete(cacheKey);
        return payload;
      })()
        .then((p) => p)
        .catch((err) => {
          templateFetchPromises.delete(cacheKey);
          throw err;
        });
      templateFetchPromises.set(cacheKey, promise);
    }

    const payload = await promise;
    const res = NextResponse.json(payload);
    res.headers.set('X-Cache', 'MISS');
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return res;
  } catch (err: any) {
    if (err && typeof err.status === 'number') {
      return NextResponse.json(
        { success: false, message: err.message ?? 'Not found' },
        { status: err.status }
      );
    }
    console.error('Error fetching public template:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
