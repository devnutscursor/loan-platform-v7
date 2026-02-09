import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase/service';
import { z } from 'zod';

const createPublicLinkSchema = z.object({
  expiresAt: z.string().optional(),
  maxUses: z.number().optional(),
});

function mapRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    publicSlug: row.public_slug,
    isActive: row.is_active,
    currentUses: row.current_uses ?? 0,
    maxUses: row.max_uses,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');

    if (!userId || !companyId) {
      return NextResponse.json(
        { success: false, message: 'User ID and Company ID are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseService();
    const { data, error } = await supabase
      .from('loan_officer_public_links')
      .select('id, public_slug, is_active, current_uses, max_uses, expires_at, created_at')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error checking public link:', error);
      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }

    const mapped = mapRow(data);
    return NextResponse.json({
      success: true,
      hasLink: !!mapped,
      data: mapped,
    });
  } catch (error) {
    console.error('Error checking public link:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, companyId, expiresAt, maxUses } = body;

    if (!userId || !companyId) {
      return NextResponse.json(
        { success: false, message: 'User ID and Company ID are required' },
        { status: 400 }
      );
    }

    const validatedData = createPublicLinkSchema.parse({ expiresAt, maxUses });
    const supabase = getSupabaseService();

    const { data: existing, error: existingError } = await supabase
      .from('loan_officer_public_links')
      .select('id, public_slug, is_active, current_uses, max_uses, expires_at, created_at')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing link:', existingError);
      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }

    if (existing) {
      if (!existing.is_active) {
        const { data: updated, error: updateError } = await supabase
          .from('loan_officer_public_links')
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select('id, public_slug, is_active, current_uses, max_uses, expires_at, created_at')
          .single();

        if (updateError) {
          console.error('Error reactivating link:', updateError);
          return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
          );
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return NextResponse.json({
          success: true,
          data: mapRow(updated),
          publicUrl: `${baseUrl}/public/profile/${updated.public_slug}`,
          message: 'Public link reactivated',
        });
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.json({
        success: true,
        data: mapRow(existing),
        publicUrl: `${baseUrl}/public/profile/${existing.public_slug}`,
        message: 'Public link already exists',
      });
    }

    const publicSlug = `${userId.slice(0, 8)}-${Date.now().toString(36)}`;
    const { data: inserted, error: insertError } = await supabase
      .from('loan_officer_public_links')
      .insert({
        user_id: userId,
        company_id: companyId,
        public_slug: publicSlug,
        is_active: true,
        expires_at: validatedData.expiresAt ? validatedData.expiresAt : null,
        max_uses: validatedData.maxUses ?? null,
      })
      .select('id, public_slug, is_active, current_uses, max_uses, expires_at, created_at')
      .single();

    if (insertError) {
      console.error('Error creating public link:', insertError);
      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.json({
      success: true,
      data: mapRow(inserted),
      publicUrl: `${baseUrl}/public/profile/${inserted.public_slug}`,
    });
  } catch (error) {
    console.error('Error creating public link:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkId, isActive, expiresAt, maxUses } = body;

    if (!linkId) {
      return NextResponse.json(
        { success: false, message: 'Link ID is required' },
        { status: 400 }
      );
    }

    const validatedData = createPublicLinkSchema.parse({ expiresAt, maxUses });
    const supabase = getSupabaseService();

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (isActive !== undefined) updates.is_active = isActive;
    if (validatedData.expiresAt !== undefined) updates.expires_at = validatedData.expiresAt;
    if (validatedData.maxUses !== undefined) updates.max_uses = validatedData.maxUses;

    const { data: updated, error } = await supabase
      .from('loan_officer_public_links')
      .update(updates)
      .eq('id', linkId)
      .select('id, public_slug, is_active, current_uses, max_uses, expires_at, created_at')
      .maybeSingle();

    if (error || !updated) {
      return NextResponse.json(
        { success: false, message: 'Public link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mapRow(updated),
    });
  } catch (error) {
    console.error('Error updating public link:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('linkId');

    if (!linkId) {
      return NextResponse.json(
        { success: false, message: 'Link ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseService();
    const { data, error } = await supabase
      .from('loan_officer_public_links')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', linkId)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('Error deactivating public link:', error);
      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: 'Public link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Public link deactivated successfully',
    });
  } catch (error) {
    console.error('Error deactivating public link:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
