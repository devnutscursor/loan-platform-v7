import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

type ContentType = 'faqs' | 'videos' | 'guides' | 'all';

const CONTENT_CACHE_TTL_MS = 30000;
const contentCache = new Map<
  string,
  {
    data: { faqs: any[]; videos: any[]; guides: any[] };
    fetchedAt: number;
  }
>();
const contentFetchPromises = new Map<string, Promise<{ faqs: any[]; videos: any[]; guides: any[] }>>();

const mapFaqRow = (faq: any) => ({
  id: faq.id,
  officerId: faq.officer_id,
  question: faq.question,
  answer: faq.answer,
  category: faq.category,
  createdAt: faq.created_at,
  updatedAt: faq.updated_at
});

const mapVideoRow = (video: any) => ({
  id: video.id,
  officerId: video.officer_id,
  title: video.title,
  description: video.description,
  category: video.category,
  videoUrl: video.video_url,
  thumbnailUrl: video.thumbnail_url,
  duration: video.duration,
  cloudinaryPublicId: video.cloudinary_public_id,
  createdAt: video.created_at,
  updatedAt: video.updated_at
});

const mapGuideRow = (guide: any) => ({
  id: guide.id,
  officerId: guide.officer_id,
  name: guide.name,
  category: guide.category,
  fileUrl: guide.file_url,
  funnelUrl: guide.funnel_url,
  fileName: guide.file_name,
  fileType: guide.file_type,
  cloudinaryPublicId: guide.cloudinary_public_id,
  createdAt: guide.created_at,
  updatedAt: guide.updated_at
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'all') as ContentType;
    const cacheKey = `${user.id}:${type}`;
    const cached = contentCache.get(cacheKey);
    if (cached && (Date.now() - cached.fetchedAt) < CONTENT_CACHE_TTL_MS) {
      return NextResponse.json(
        { success: true, data: cached.data },
        { headers: { 'X-Cache': 'HIT', 'Cache-Control': 'private, max-age=30' } }
      );
    }

    const inFlight = contentFetchPromises.get(cacheKey);
    if (inFlight) {
      const data = await inFlight;
      return NextResponse.json(
        { success: true, data },
        { headers: { 'X-Cache': 'HIT', 'Cache-Control': 'private, max-age=30' } }
      );
    }

    const fetchPromise = (async () => {
      const data = {
        faqs: [] as any[],
        videos: [] as any[],
        guides: [] as any[]
      };

      const queries: Array<Promise<unknown>> = [];

      if (type === 'all' || type === 'faqs') {
        queries.push(
          (async () => {
            const { data: faqs, error } = await supabase
              .from('officer_content_faqs')
              .select('id, officer_id, question, answer, category, created_at, updated_at')
              .eq('officer_id', user.id)
              .order('created_at', { ascending: false });
            if (error) throw error;
            data.faqs = (faqs || []).map(mapFaqRow);
          })()
        );
      }

      if (type === 'all' || type === 'videos') {
        queries.push(
          (async () => {
            const { data: videos, error } = await supabase
              .from('officer_content_videos')
              .select('id, officer_id, title, description, category, video_url, thumbnail_url, duration, cloudinary_public_id, created_at, updated_at')
              .eq('officer_id', user.id)
              .order('created_at', { ascending: false });
            if (error) throw error;
            data.videos = (videos || []).map(mapVideoRow);
          })()
        );
      }

      if (type === 'all' || type === 'guides') {
        queries.push(
          (async () => {
            const { data: guides, error } = await supabase
              .from('officer_content_guides')
              .select('id, officer_id, name, category, file_url, funnel_url, file_name, file_type, cloudinary_public_id, created_at, updated_at')
              .eq('officer_id', user.id)
              .order('created_at', { ascending: false });
            if (error) throw error;
            data.guides = (guides || []).map(mapGuideRow);
          })()
        );
      }

      await Promise.all(queries);
      return data;
    })();

    contentFetchPromises.set(cacheKey, fetchPromise);
    try {
      const data = await fetchPromise;
      contentCache.set(cacheKey, { data, fetchedAt: Date.now() });
      return NextResponse.json(
        { success: true, data },
        { headers: { 'X-Cache': 'MISS', 'Cache-Control': 'private, max-age=30' } }
      );
    } finally {
      contentFetchPromises.delete(cacheKey);
    }
  } catch (error) {
    console.error('❌ Error fetching content management data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
