import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { officerContentFaqs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/officers/content/faqs - Get all FAQs for logged-in officer
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

    // Fetch all FAQs for this officer
    const faqs = await db
      .select()
      .from(officerContentFaqs)
      .where(eq(officerContentFaqs.officerId, user.id))
      .orderBy(desc(officerContentFaqs.createdAt));

    return NextResponse.json({
      success: true,
      data: faqs
    });

  } catch (error) {
    console.error('❌ Error fetching FAQs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch FAQs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/officers/content/faqs - Create FAQs (accepts array)
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
    const { faqs } = body; // Expect array of FAQs

    if (!Array.isArray(faqs) || faqs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'FAQs array is required' },
        { status: 400 }
      );
    }

    // Validate each FAQ
    for (const faq of faqs) {
      if (!faq.question || !faq.answer || !faq.category) {
        return NextResponse.json(
          { success: false, error: 'Each FAQ must have question, answer, and category' },
          { status: 400 }
        );
      }
    }

    // Insert all FAQs
    const newFaqs = faqs.map(faq => ({
      officerId: user.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const insertedFaqs = await db.insert(officerContentFaqs).values(newFaqs).returning();

    return NextResponse.json({
      success: true,
      data: insertedFaqs,
      message: `Successfully created ${insertedFaqs.length} FAQ(s)`
    });

  } catch (error) {
    console.error('❌ Error creating FAQs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create FAQs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

