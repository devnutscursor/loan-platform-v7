import { NextRequest, NextResponse } from 'next/server';
import {
  assertCanManageCompany,
  requireCompanyAdminOrSuperAdmin,
} from '@/lib/api-auth';
import { getSupabaseService } from '@/lib/supabase/service';

const COMPANY_PROFILE_COLUMNS = `
  id,
  name,
  phone,
  email,
  website,
  logo,
  address,
  license_number,
  company_tagline,
  company_description,
  company_nmls_number,
  company_established_year,
  company_team_size,
  company_specialties,
  company_awards,
  company_testimonials,
  company_social_media,
  company_branding,
  company_contact_info,
  company_business_hours,
  company_service_areas,
  company_languages,
  company_certifications,
  company_version
`;

export async function GET(req: NextRequest) {
  try {
    const auth = await requireCompanyAdminOrSuperAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const { ctx } = auth;

    const { searchParams } = new URL(req.url);
    const requestedCompanyId = searchParams.get('companyId');
    const companyId =
      ctx.role === 'super_admin' ? requestedCompanyId : ctx.companyId;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Missing companyId' },
        { status: 400 },
      );
    }

    const denied = await assertCanManageCompany(ctx, companyId);
    if (denied) return denied;

    const supabase = getSupabaseService();
    const { data, error } = await supabase
      .from('companies')
      .select(COMPANY_PROFILE_COLUMNS)
      .eq('id', companyId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching company profile:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Unexpected error fetching company profile:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireCompanyAdminOrSuperAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const { ctx } = auth;

    const body = await req.json();
    const requestedCompanyId = body.companyId as string | undefined;
    const companyId =
      ctx.role === 'super_admin' ? requestedCompanyId : ctx.companyId;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Missing companyId' },
        { status: 400 },
      );
    }

    const denied = await assertCanManageCompany(ctx, companyId);
    if (denied) return denied;

    const {
      phone,
      email,
      website,
      logo,
      address,
      license_number,
      company_tagline,
      company_description,
      company_nmls_number,
      company_established_year,
      company_team_size,
      company_specialties,
      company_social_media,
      company_branding,
      company_contact_info,
      company_business_hours,
      company_service_areas,
      company_languages,
      company_certifications,
      company_version,
    } = body;

    const supabase = getSupabaseService();
    const { data, error } = await supabase
      .from('companies')
      .update({
        phone,
        email,
        website,
        logo,
        address,
        license_number,
        company_tagline,
        company_description,
        company_nmls_number,
        company_established_year,
        company_team_size,
        company_specialties,
        company_social_media,
        company_branding,
        company_contact_info,
        company_business_hours,
        company_service_areas,
        company_languages,
        company_certifications,
        company_last_updated_by: ctx.userId,
        company_version: (company_version ?? 1) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)
      .select(COMPANY_PROFILE_COLUMNS)
      .maybeSingle();

    if (error) {
      console.error('Error updating company profile:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Unexpected error updating company profile:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
