import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing slug parameter' 
      }, { status: 400 });
    }

    console.log(`🔄 Fetching company by slug: ${slug}`);

    // Get company by slug
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        slug,
        email,
        admin_email,
        invite_status,
        invite_sent_at,
        invite_expires_at,
        invite_token,
        admin_user_id,
        is_active,
        deactivated,
        created_at,
        updated_at
      `)
      .eq('slug', slug)
      .single();

    if (companyError || !companyData) {
      console.error('❌ Company not found:', companyError);
      return NextResponse.json({ 
        success: false, 
        error: 'Company not found' 
      }, { status: 404 });
    }

    console.log(`👤 Found company: ${companyData.name} (${companyData.id})`);

    return NextResponse.json({ 
      success: true, 
      data: companyData 
    });

  } catch (error: any) {
    console.error('❌ Unexpected error fetching company by slug:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Server error' 
    }, { status: 500 });
  }
}
