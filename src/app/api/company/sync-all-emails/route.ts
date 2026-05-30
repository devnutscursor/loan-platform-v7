import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireSuperAdmin } from '@/lib/api-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSuperAdmin(req);
    if (auth instanceof NextResponse) return auth;

    console.log('🔄 Starting bulk company email sync...');

    // Get all company admins and their current emails from Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return NextResponse.json({ 
        success: false, 
        error: authError.message 
      }, { status: 500 });
    }

    console.log(`👥 Found ${authUsers.users.length} auth users`);

    // Get all company admins from user_companies
    const { data: companyAdmins, error: companyAdminsError } = await supabase
      .from('user_companies')
      .select(`
        user_id,
        company_id,
        companies!inner(id, name, email, slug)
      `)
      .eq('role', 'admin')
      .eq('is_active', true);

    if (companyAdminsError) {
      console.error('❌ Error fetching company admins:', companyAdminsError);
      return NextResponse.json({ 
        success: false, 
        error: companyAdminsError.message 
      }, { status: 500 });
    }

    console.log(`🏢 Found ${companyAdmins.length} company admins`);

    const syncResults = [];
    let successCount = 0;
    let errorCount = 0;

    // For each company admin, check if their auth email differs from company email
    for (const admin of companyAdmins) {
      const company = admin.companies as any;
      const authUser = authUsers.users.find(user => user.id === admin.user_id);
      
      if (!authUser) {
        console.warn(`⚠️ Auth user not found for company admin: ${admin.user_id}`);
        continue;
      }

      // Check if company email needs updating
      if (company.email !== authUser.email || company.admin_email !== authUser.email) {
        console.log(`🔄 Syncing company ${company.name}: ${company.email} → ${authUser.email}`);
        
        try {
          const { error: updateError } = await supabase
            .from('companies')
            .update({ 
              email: authUser.email,
              admin_email: authUser.email,
              updated_at: new Date().toISOString()
            })
            .eq('id', company.id);

          if (updateError) {
            console.error(`❌ Error updating company ${company.name}:`, updateError);
            syncResults.push({
              companyId: company.id,
              companyName: company.name,
              oldEmail: company.email,
              newEmail: authUser.email,
              status: 'error',
              error: updateError.message
            });
            errorCount++;
          } else {
            console.log(`✅ Updated company ${company.name} email`);
            syncResults.push({
              companyId: company.id,
              companyName: company.name,
              oldEmail: company.email,
              newEmail: authUser.email,
              status: 'success'
            });
            successCount++;
          }
        } catch (error: any) {
          console.error(`❌ Unexpected error updating company ${company.name}:`, error);
          syncResults.push({
            companyId: company.id,
            companyName: company.name,
            oldEmail: company.email,
            newEmail: authUser.email,
            status: 'error',
            error: error.message
          });
          errorCount++;
        }
      } else {
        console.log(`✅ Company ${company.name} email already in sync`);
        syncResults.push({
          companyId: company.id,
          companyName: company.name,
          email: company.email,
          adminEmail: company.admin_email,
          status: 'already_synced'
        });
      }
    }

    console.log(`🎉 Bulk sync completed: ${successCount} updated, ${errorCount} errors`);

    return NextResponse.json({ 
      success: true, 
      data: {
        totalProcessed: companyAdmins.length,
        successCount,
        errorCount,
        results: syncResults
      }
    });

  } catch (error: any) {
    console.error('❌ Unexpected error in bulk company email sync:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Server error' 
    }, { status: 500 });
  }
}
