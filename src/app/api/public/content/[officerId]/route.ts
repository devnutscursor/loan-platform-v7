import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  officerContentFaqs, 
  officerContentVideos, 
  officerContentGuides 
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/public/content/[officerId] - Get all content (FAQs, Videos, Guides) for public view
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ officerId: string }> }
) {
  try {
    const { officerId } = await params;

    if (!officerId) {
      return NextResponse.json(
        { success: false, error: 'Officer ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching public content for officer:', officerId);

    // Fetch all content for this officer in parallel
    const [faqs, videos, guides] = await Promise.all([
      db
        .select()
        .from(officerContentFaqs)
        .where(eq(officerContentFaqs.officerId, officerId)),
      db
        .select()
        .from(officerContentVideos)
        .where(eq(officerContentVideos.officerId, officerId)),
      db
        .select()
        .from(officerContentGuides)
        .where(eq(officerContentGuides.officerId, officerId))
    ]);

    console.log('✅ Found content:', {
      faqs: faqs.length,
      videos: videos.length,
      guides: guides.length
    });

    return NextResponse.json({
      success: true,
      data: {
        faqs,
        videos,
        guides
      }
    });

  } catch (error) {
    console.error('❌ Error fetching public content:', error);
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

