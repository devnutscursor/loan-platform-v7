import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { officerContentFaqs, officerContentGuides, officerContentVideos } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

type ContentType = 'faqs' | 'videos' | 'guides' | 'all';

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

    const data = {
      faqs: [] as any[],
      videos: [] as any[],
      guides: [] as any[]
    };

    const queries: Promise<void>[] = [];

    if (type === 'all' || type === 'faqs') {
      queries.push(
        db
          .select()
          .from(officerContentFaqs)
          .where(eq(officerContentFaqs.officerId, user.id))
          .orderBy(desc(officerContentFaqs.createdAt))
          .then((faqs) => {
            data.faqs = faqs;
          })
      );
    }

    if (type === 'all' || type === 'videos') {
      queries.push(
        db
          .select()
          .from(officerContentVideos)
          .where(eq(officerContentVideos.officerId, user.id))
          .orderBy(desc(officerContentVideos.createdAt))
          .then((videos) => {
            data.videos = videos;
          })
      );
    }

    if (type === 'all' || type === 'guides') {
      queries.push(
        db
          .select()
          .from(officerContentGuides)
          .where(eq(officerContentGuides.officerId, user.id))
          .orderBy(desc(officerContentGuides.createdAt))
          .then((guides) => {
            data.guides = guides;
          })
      );
    }

    await Promise.all(queries);

    return NextResponse.json({
      success: true,
      data
    });
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
