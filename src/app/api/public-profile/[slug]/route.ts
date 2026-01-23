import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  loanOfficerPublicLinks, 
  users, 
  companies, 
  publicLinkUsage,
  pageSettings,
  templates
} from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Cache configuration - revalidate every 60 seconds
export const revalidate = 60;

// GET: Fetch public profile data by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('🔍 Fetching public profile for slug:', slug);

    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Slug is required' },
        { status: 400 }
      );
    }

    // Check if this slug has a public link
    console.log('🔍 Searching for slug:', slug);
    const publicLink = await db
      .select({
        id: loanOfficerPublicLinks.id,
        userId: loanOfficerPublicLinks.userId,
        companyId: loanOfficerPublicLinks.companyId,
        publicSlug: loanOfficerPublicLinks.publicSlug,
        isActive: loanOfficerPublicLinks.isActive,
        expiresAt: loanOfficerPublicLinks.expiresAt,
        maxUses: loanOfficerPublicLinks.maxUses,
        currentUses: loanOfficerPublicLinks.currentUses,
      })
      .from(loanOfficerPublicLinks)
      .where(eq(loanOfficerPublicLinks.publicSlug, slug))
      .limit(1);

    console.log('🔗 Public link query result:', publicLink);

    if (publicLink.length === 0) {
      console.log('❌ No public link found for slug:', slug);
      return NextResponse.json(
        { success: false, message: 'Public profile not found' },
        { status: 404 }
      );
    }

    const link = publicLink[0];
    console.log('✅ Found public link:', link);

    // Check if link is active
    if (!link.isActive) {
      return NextResponse.json(
        { success: false, message: 'This profile is no longer available' },
        { status: 410 }
      );
    }

    // Check if link has expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, message: 'This profile has expired' },
        { status: 410 }
      );
    }

    // Check if max uses exceeded
    if (link.maxUses && link.currentUses >= link.maxUses) {
      return NextResponse.json(
        { success: false, message: 'This profile has reached its usage limit' },
        { status: 410 }
      );
    }

    // Record usage analytics - make non-blocking (fire and forget)
    const userAgent = request.headers.get('user-agent') || null;
    const referrer = request.headers.get('referer') || null;
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Non-blocking analytics: execute in background without awaiting
    // This doesn't block the response, improving page load time
    (async () => {
      try {
        await db.insert(publicLinkUsage).values({
          linkId: link.id,
          ipAddress,
          userAgent,
          referrer,
        });

        // Increment usage count
        await db
          .update(loanOfficerPublicLinks)
          .set({
            currentUses: link.currentUses + 1,
            updatedAt: new Date(),
          })
          .where(eq(loanOfficerPublicLinks.id, link.id));
      } catch (analyticsError) {
        console.warn('Failed to record usage analytics:', analyticsError);
        // Don't fail the request if analytics fail
      }
    })().catch(err => {
      // Silently handle any uncaught errors in the background task
      console.warn('Background analytics task error:', err);
    });

    // Fetch all data in parallel: user, company, pageSettings, and template
    console.log('👤 Fetching user data for userId:', link.userId);
    console.log('🏢 Fetching company data for companyId:', link.companyId);
    
    const [userData, companyData, pageSettingsData] = await Promise.all([
      db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          nmlsNumber: users.nmlsNumber,
          avatar: users.avatar,
          role: users.role,
          isActive: users.isActive,
        })
        .from(users)
        .where(eq(users.id, link.userId))
        .limit(1),
      
      db
        .select({
          id: companies.id,
          name: companies.name,
          logo: companies.logo,
          website: companies.website,
          address: companies.address,
          phone: companies.phone,
          email: companies.email,
          license_number: companies.licenseNumber,
          company_nmls_number: companies.companyNmlsNumber,
          company_social_media: companies.companySocialMedia,
        })
        .from(companies)
        .where(eq(companies.id, link.companyId))
        .limit(1),
      
      // Fetch page settings in parallel
      db
        .select({
          template: pageSettings.template,
          settings: pageSettings.settings,
          templateId: pageSettings.templateId,
        })
        .from(pageSettings)
        .where(
          and(
            eq(pageSettings.officerId, link.userId),
            eq(pageSettings.isPublished, true)
          )
        )
        .orderBy(desc(pageSettings.updatedAt))
        .limit(1),
    ]);

    console.log('👤 User data result:', userData);
    console.log('🏢 Company data result:', companyData);

    if (userData.length === 0) {
      console.log('❌ User data not found for userId:', link.userId);
      return NextResponse.json(
        { success: false, message: 'User data not found' },
        { status: 404 }
      );
    }

    if (companyData.length === 0) {
      console.log('❌ Company data not found for companyId:', link.companyId);
      return NextResponse.json(
        { success: false, message: 'Company data not found' },
        { status: 404 }
      );
    }

    // Fetch template if pageSettings exist (only one additional query instead of sequential)
    let templateData = null;
    if (pageSettingsData.length > 0 && pageSettingsData[0].templateId) {
      const templateResult = await db
        .select()
        .from(templates)
        .where(eq(templates.id, pageSettingsData[0].templateId))
        .limit(1);
      
      if (templateResult.length > 0) {
        templateData = templateResult[0];
      }
    }

    const response = NextResponse.json({
      success: true,
      data: {
        user: userData[0],
        company: companyData[0],
        publicLink: {
          id: link.id,
          publicSlug: link.publicSlug,
          isActive: link.isActive,
          currentUses: link.currentUses + 1, // Updated count
          maxUses: link.maxUses,
          expiresAt: link.expiresAt,
        },
        pageSettings: pageSettingsData[0] || null,
        template: templateData,
      },
    });

    // Add cache headers for public caching
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    return response;

  } catch (error) {
    console.error('❌ Error fetching public profile:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
