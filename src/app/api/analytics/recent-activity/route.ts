import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db, leads, users, companies, templates, publicLinkUsage, loanOfficerPublicLinks, userCompanies } from '@/lib/db';
import { eq, desc, and, gte, sql } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const RECENT_ACTIVITY_CACHE_TTL_MS = 30000;
const RECENT_ACTIVITY_DAYS = 7;
const recentActivityCache = new Map<
  string,
  { data: { success: true; data: { activities: ActivityItem[]; total: number } }; fetchedAt: number }
>();
const recentActivityFetchPromises = new Map<
  string,
  Promise<{ success: true; data: { activities: ActivityItem[]; total: number } }>
>();

interface ActivityItem {
  id: string;
  type: 'lead_created' | 'lead_updated' | 'lead_converted' | 'officer_added' | 'company_created' | 'login' | 'public_profile_view' | 'template_modified';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  companyId?: string;
  companyName?: string;
  leadId?: string;
  leadName?: string;
  leadFirstName?: string;
  leadLastName?: string;
  templateId?: string;
  templateName?: string;
  metadata?: Record<string, any>;
  icon: string;
  color: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Recent Activity API: Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error('❌ Recent Activity API: User not found:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { role } = userData;
    let company_id: string | null = null;

    // Get company_id for non-super-admin users
    if (role !== 'super_admin') {
      console.log(`🔍 Looking for company association for user: ${user.id}`);
      
      const { data: userCompany, error: companyError } = await supabase
        .from('user_companies')
        .select('company_id, role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log(`🔍 Company query result:`, { userCompany, companyError });

      if (companyError || !userCompany) {
        console.error('❌ Recent Activity API: Company not found for user:', user.id, 'Error:', companyError);
        console.log('⚠️ Recent Activity API: User has no company association, but continuing to process activities');
        
        // Try alternative query using Drizzle ORM
        try {
          const drizzleCompany = await db
            .select({ companyId: userCompanies.companyId, role: userCompanies.role })
            .from(userCompanies)
            .where(eq(userCompanies.userId, user.id))
            .limit(1);
          
          if (drizzleCompany.length > 0) {
            company_id = drizzleCompany[0].companyId;
            console.log(`✅ Found company association via Drizzle: company_id=${company_id}, role=${drizzleCompany[0].role}`);
          } else {
            console.log('❌ No company association found via Drizzle either');
            company_id = null;
          }
        } catch (drizzleError) {
          console.error('❌ Drizzle query also failed:', drizzleError);
          company_id = null;
        }
      } else {
        company_id = userCompany.company_id;
        console.log(`✅ Found company association: company_id=${company_id}, role=${userCompany.role}`);
      }
    }

    const cacheKey = `recent-activity:${user.id}:${role}:${company_id ?? 'none'}`;
    const cached = recentActivityCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < RECENT_ACTIVITY_CACHE_TTL_MS) {
      const res = NextResponse.json(cached.data);
      res.headers.set('X-Cache', 'HIT');
      res.headers.set('Cache-Control', 'private, max-age=30');
      return res;
    }

    let promise = recentActivityFetchPromises.get(cacheKey);
    if (!promise) {
      promise = (async () => {
        const activities: ActivityItem[] = [];
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - RECENT_ACTIVITY_DAYS);
        
        if (role === 'super_admin') {
          await getSuperAdminActivities(activities, sinceDate);
        } else if (role === 'company_admin' && company_id) {
          await getCompanyAdminActivities(activities, company_id, sinceDate);
        } else if (role === 'employee') {
          await Promise.all([
            getEmployeeActivities(activities, user.id, company_id, sinceDate),
            getPublicProfileViews(activities, user.id, sinceDate),
            getTemplateModifications(activities, user.id, sinceDate),
          ]);
          
        } else {
          console.log(`⚠️ No matching role found: role=${role}, company_id=${company_id}`);
        }

        // If no activities found, add a welcome activity
        if (activities.length === 0) {
          activities.push({
            id: 'welcome_activity',
            type: 'login',
            title: 'Welcome!',
            description: 'Your activity feed will show your recent actions here',
            timestamp: new Date().toISOString(),
            icon: '👋',
            color: '#01bcc6'
          });
        }

        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const recentActivities = activities.slice(0, 10);

        console.log(`📈 Recent Activity API: Found ${activities.length} total activities, returning ${recentActivities.length} recent activities for user ${user.id} (${role})`);

        const payload = {
          success: true as const,
          data: { activities: recentActivities, total: activities.length }
        };

        recentActivityCache.set(cacheKey, { data: payload, fetchedAt: Date.now() });
        recentActivityFetchPromises.delete(cacheKey);
        return payload;
      })()
        .then((p) => p)
        .catch((err) => {
          recentActivityFetchPromises.delete(cacheKey);
          throw err;
        });
      recentActivityFetchPromises.set(cacheKey, promise);
    }

    const payload = await promise;
    const res = NextResponse.json(payload);
    res.headers.set('X-Cache', 'MISS');
    res.headers.set('Cache-Control', 'private, max-age=30');
    return res;

  } catch (error) {
    console.error('Recent Activity API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getSuperAdminActivities(activities: ActivityItem[], since: Date) {
  const recentLeads = await db
    .select({
      id: leads.id,
      firstName: leads.firstName,
      lastName: leads.lastName,
      status: leads.status,
      conversionStage: leads.conversionStage,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      officerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
      companyName: companies.name,
      companyId: companies.id
    })
    .from(leads)
    .innerJoin(users, eq(leads.officerId, users.id))
    .innerJoin(companies, eq(leads.companyId, companies.id))
    .where(gte(leads.createdAt, since))
    .orderBy(desc(leads.createdAt))
    .limit(10);

  const recentCompanies = await db
    .select({
      id: companies.id,
      name: companies.name,
      createdAt: companies.createdAt,
      adminEmail: companies.adminEmail
    })
    .from(companies)
    .where(gte(companies.createdAt, since))
    .orderBy(desc(companies.createdAt))
    .limit(3);

  recentLeads.forEach(lead => {
    if (lead.createdAt) {
      activities.push({
        id: `lead_${lead.id}`,
        type: 'lead_created',
        title: 'New Lead',
        description: `${lead.firstName} ${lead.lastName} from ${lead.companyName}`,
        timestamp: lead.createdAt.toISOString(),
        leadId: lead.id,
        leadName: `${lead.firstName} ${lead.lastName}`,
        leadFirstName: lead.firstName,
        leadLastName: lead.lastName,
        companyId: lead.companyId,
        companyName: lead.companyName,
        userName: lead.officerName,
        icon: '👤',
        color: '#01bcc6'
      });
    }

    if (lead.updatedAt && lead.updatedAt.getTime() !== lead.createdAt?.getTime()) {
      activities.push({
        id: `lead_update_${lead.id}`,
        type: 'lead_updated',
        title: 'Lead Updated',
        description: `${lead.firstName} ${lead.lastName} - ${lead.status}`,
        timestamp: lead.updatedAt.toISOString(),
        leadId: lead.id,
        leadName: `${lead.firstName} ${lead.lastName}`,
        leadFirstName: lead.firstName,
        leadLastName: lead.lastName,
        companyId: lead.companyId,
        companyName: lead.companyName,
        userName: lead.officerName,
        metadata: { status: lead.status, conversionStage: lead.conversionStage },
        icon: '📊',
        color: '#10b981'
      });
    }
  });

  recentCompanies.forEach(company => {
    if (company.createdAt) {
      activities.push({
        id: `company_${company.id}`,
        type: 'company_created',
        title: 'New Company',
        description: `${company.name} registered`,
        timestamp: company.createdAt.toISOString(),
        companyId: company.id,
        companyName: company.name,
        metadata: { adminEmail: company.adminEmail },
        icon: '🏢',
        color: '#8b5cf6'
      });
    }
  });
}

async function getCompanyAdminActivities(activities: ActivityItem[], companyId: string, since: Date) {
  const recentLeads = await db
    .select({
      id: leads.id,
      firstName: leads.firstName,
      lastName: leads.lastName,
      status: leads.status,
      conversionStage: leads.conversionStage,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      officerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`
    })
    .from(leads)
    .innerJoin(users, eq(leads.officerId, users.id))
    .where(and(
      eq(leads.companyId, companyId),
      gte(leads.createdAt, since)
    ))
    .orderBy(desc(leads.createdAt))
    .limit(8);

  const recentOfficers = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      createdAt: users.createdAt
    })
    .from(users)
    .innerJoin(sql`user_companies`, sql`user_companies.user_id = ${users.id}`)
    .where(and(
      sql`user_companies.company_id = ${companyId}`,
      sql`user_companies.role = 'employee'`,
      gte(users.createdAt, since)
    ))
    .orderBy(desc(users.createdAt))
    .limit(3);

  recentLeads.forEach(lead => {
    if (lead.createdAt) {
      activities.push({
        id: `lead_${lead.id}`,
        type: 'lead_created',
        title: 'New Lead',
        description: `${lead.firstName} ${lead.lastName} by ${lead.officerName}`,
        timestamp: lead.createdAt.toISOString(),
        leadId: lead.id,
        leadName: `${lead.firstName} ${lead.lastName}`,
        leadFirstName: lead.firstName,
        leadLastName: lead.lastName,
        userName: lead.officerName,
        icon: '👤',
        color: '#01bcc6'
      });
    }

    if (lead.updatedAt && lead.updatedAt.getTime() !== lead.createdAt?.getTime()) {
      activities.push({
        id: `lead_update_${lead.id}`,
        type: 'lead_updated',
        title: 'Lead Updated',
        description: `${lead.firstName} ${lead.lastName} - ${lead.status}`,
        timestamp: lead.updatedAt.toISOString(),
        leadId: lead.id,
        leadName: `${lead.firstName} ${lead.lastName}`,
        leadFirstName: lead.firstName,
        leadLastName: lead.lastName,
        userName: lead.officerName,
        metadata: { status: lead.status, conversionStage: lead.conversionStage },
        icon: '📊',
        color: '#10b981'
      });
    }
  });

  recentOfficers.forEach(officer => {
    if (officer.createdAt) {
      activities.push({
        id: `officer_${officer.id}`,
        type: 'officer_added',
        title: 'New Officer',
        description: `${officer.firstName} ${officer.lastName} added`,
        timestamp: officer.createdAt.toISOString(),
        userId: officer.id,
        userName: `${officer.firstName} ${officer.lastName}`,
        icon: '👨‍💼',
        color: '#f59e0b'
      });
    }
  });
}

async function getEmployeeActivities(activities: ActivityItem[], userId: string, companyId: string | null, since: Date) {
  try {
    const userLeads = await db
      .select({
        id: leads.id,
        firstName: leads.firstName,
        lastName: leads.lastName,
        status: leads.status,
        conversionStage: leads.conversionStage,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt
      })
      .from(leads)
      .where(and(
        eq(leads.officerId, userId),
        gte(leads.createdAt, since)
      ))
      .orderBy(desc(leads.createdAt))
      .limit(6);

    userLeads.forEach(lead => {
      if (lead.createdAt) {
        activities.push({
          id: `my_lead_${lead.id}`,
          type: 'lead_created',
          title: 'New Lead',
          description: `${lead.firstName} ${lead.lastName}`,
          timestamp: lead.createdAt.toISOString(),
          leadId: lead.id,
          leadName: `${lead.firstName} ${lead.lastName}`,
          leadFirstName: lead.firstName,
          leadLastName: lead.lastName,
          icon: '👤',
          color: '#01bcc6'
        });
      }

      if (lead.updatedAt && lead.updatedAt.getTime() !== lead.createdAt?.getTime()) {
        activities.push({
          id: `my_lead_update_${lead.id}`,
          type: 'lead_updated',
          title: 'Lead Updated',
          description: `${lead.firstName} ${lead.lastName} - ${lead.status}`,
          timestamp: lead.updatedAt.toISOString(),
          leadId: lead.id,
          leadName: `${lead.firstName} ${lead.lastName}`,
          leadFirstName: lead.firstName,
          leadLastName: lead.lastName,
          metadata: { status: lead.status, conversionStage: lead.conversionStage },
          icon: '📊',
          color: '#10b981'
        });
      }
    });
  } catch (error) {
    console.error('❌ Error fetching employee activities:', error);
  }
}

async function getPublicProfileViews(activities: ActivityItem[], userId: string, since: Date) {
  try {
    // Get public profile views for this user's public links
  const profileViews = await db
      .select({
        id: publicLinkUsage.id,
        accessedAt: publicLinkUsage.accessedAt,
        userAgent: publicLinkUsage.userAgent,
        referrer: publicLinkUsage.referrer,
        linkId: publicLinkUsage.linkId,
        publicSlug: loanOfficerPublicLinks.publicSlug
      })
      .from(publicLinkUsage)
      .innerJoin(loanOfficerPublicLinks, eq(publicLinkUsage.linkId, loanOfficerPublicLinks.id))
      .where(and(
        eq(loanOfficerPublicLinks.userId, userId),
        gte(publicLinkUsage.accessedAt, since)
      ))
      .orderBy(desc(publicLinkUsage.accessedAt))
    .limit(5);

    profileViews.forEach(view => {
      if (view.accessedAt) {
        activities.push({
          id: `profile_view_${view.id}`,
          type: 'public_profile_view',
          title: 'Profile Viewed',
          description: `Your public profile was viewed`,
          timestamp: view.accessedAt.toISOString(),
          metadata: { 
            userAgent: view.userAgent,
            referrer: view.referrer,
            publicSlug: view.publicSlug
          },
          icon: '👁️',
          color: '#8b5cf6'
        });
      }
    });
  } catch (error) {
    console.error('Error fetching public profile views:', error);
  }
}

async function getTemplateModifications(activities: ActivityItem[], userId: string, since: Date) {
  try {
    // Get template modifications for this user
    const templateModifications = await db
      .select({
        id: templates.id,
        name: templates.name,
        updatedAt: templates.updatedAt,
        isDefault: templates.isDefault
      })
      .from(templates)
      .where(and(
        eq(templates.userId, userId),
        gte(templates.updatedAt, since)
      ))
      .orderBy(desc(templates.updatedAt))
      .limit(6);

    console.log(`🎨 Found ${templateModifications.length} template modifications for user ${userId} in the last 30 days`);

    templateModifications.forEach(template => {
      if (template.updatedAt) {
        activities.push({
          id: `template_${template.id}`,
          type: 'template_modified',
          title: 'Template Updated',
          description: `Customized "${template.name}" template`,
          timestamp: template.updatedAt.toISOString(),
          templateId: template.id,
          templateName: template.name,
          metadata: { 
            isDefault: template.isDefault,
            templateType: template.isDefault ? 'default' : 'custom'
          },
          icon: '🎨',
          color: '#f59e0b'
        });
      }
    });
  } catch (error) {
    console.error('❌ Error fetching template modifications:', error);
  }
}
