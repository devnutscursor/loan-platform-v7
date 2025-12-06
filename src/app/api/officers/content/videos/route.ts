import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { officerContentVideos } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/officers/content/videos - Get all videos for logged-in officer
export async function GET(request: NextRequest) {
  try {
    // Get authorization header
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

    // Fetch all videos for this officer
    const videos = await db
      .select()
      .from(officerContentVideos)
      .where(eq(officerContentVideos.officerId, user.id))
      .orderBy(desc(officerContentVideos.createdAt));

    return NextResponse.json({
      success: true,
      data: videos
    });

  } catch (error) {
    console.error('❌ Error fetching videos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch videos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/officers/content/videos - Create video
export async function POST(request: NextRequest) {
  try {
    // Get authorization header
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

    const body = await request.json();
    const { title, description, category, video_url, thumbnail_url, duration, cloudinary_public_id } = body;

    // Validate required fields
    if (!title || !category || !video_url || !duration || !cloudinary_public_id) {
      return NextResponse.json(
        { success: false, error: 'Title, category, video_url, duration, and cloudinary_public_id are required' },
        { status: 400 }
      );
    }

    // Insert video
    const newVideo = {
      officerId: user.id,
      title,
      description: description || null,
      category,
      videoUrl: video_url,
      thumbnailUrl: thumbnail_url || null,
      duration,
      cloudinaryPublicId: cloudinary_public_id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertedVideo = await db.insert(officerContentVideos).values(newVideo).returning();

    return NextResponse.json({
      success: true,
      data: insertedVideo[0],
      message: 'Video created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating video:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

