import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { officerContentFaqs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PUT /api/officers/content/faqs/[id] - Update FAQ
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { question, answer, category } = body;

    // Validate required fields
    if (!question || !answer || !category) {
      return NextResponse.json(
        { success: false, error: 'Question, answer, and category are required' },
        { status: 400 }
      );
    }

    // Check if FAQ exists and belongs to the officer
    const existingFaq = await db
      .select()
      .from(officerContentFaqs)
      .where(eq(officerContentFaqs.id, id))
      .limit(1);

    if (existingFaq.length === 0) {
      return NextResponse.json(
        { success: false, error: 'FAQ not found' },
        { status: 404 }
      );
    }

    if (existingFaq[0].officerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update FAQ
    const updatedFaq = await db
      .update(officerContentFaqs)
      .set({
        question,
        answer,
        category,
        updatedAt: new Date()
      })
      .where(eq(officerContentFaqs.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedFaq[0],
      message: 'FAQ updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating FAQ:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update FAQ',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/officers/content/faqs/[id] - Delete FAQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if FAQ exists and belongs to the officer
    const existingFaq = await db
      .select()
      .from(officerContentFaqs)
      .where(eq(officerContentFaqs.id, id))
      .limit(1);

    if (existingFaq.length === 0) {
      return NextResponse.json(
        { success: false, error: 'FAQ not found' },
        { status: 404 }
      );
    }

    if (existingFaq[0].officerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete FAQ
    await db
      .delete(officerContentFaqs)
      .where(eq(officerContentFaqs.id, id));

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting FAQ:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete FAQ',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

