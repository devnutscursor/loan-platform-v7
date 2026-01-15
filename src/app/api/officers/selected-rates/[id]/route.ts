import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db, selectedRates } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * DELETE /api/officers/selected-rates/[id]
 * Remove a selected rate
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify the rate belongs to this officer
    const rate = await db
      .select()
      .from(selectedRates)
      .where(
        and(
          eq(selectedRates.id, id),
          eq(selectedRates.officerId, user.id)
        )
      )
      .limit(1);

    if (rate.length === 0) {
      return NextResponse.json(
        { error: 'Rate not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the rate
    await db
      .delete(selectedRates)
      .where(eq(selectedRates.id, id));

    return NextResponse.json({
      success: true,
      message: 'Rate removed successfully',
    });

  } catch (error) {
    console.error('❌ Error removing selected rate:', error);
    return NextResponse.json(
      { error: 'Failed to remove selected rate' },
      { status: 500 }
    );
  }
}

