import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { uploadDefaultContentForOfficer } from '@/lib/default-content-uploader';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
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

    const result = await uploadDefaultContentForOfficer(user.id);

    return NextResponse.json({
      success: result.success,
      data: {
        faqsCount: result.faqsCount,
        guidesCount: result.guidesCount,
        videosCount: result.videosCount
      },
      error: result.error
    });

  } catch (error) {
    console.error('❌ Error in upload-default endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload default content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

