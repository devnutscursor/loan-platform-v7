import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAuthUsers() {
  try {
    console.log('🔍 Checking Supabase Auth users...\n');

    // List all users (this requires admin access)
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }

    console.log(`📊 Found ${users.users.length} users in Supabase Auth:\n`);

    users.users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`   Last Sign In: ${user.last_sign_in_at || 'Never'}`);
      console.log(`   Role: ${user.user_metadata?.role || 'Not set'}`);
      console.log(`   Company: ${user.user_metadata?.company_name || 'Not set'}`);
      console.log('   ---');
    });

    // Check database users
    console.log('\n🔍 Checking database users...\n');
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*');

    if (dbError) {
      console.error('❌ Error fetching database users:', dbError);
    } else {
      console.log(`📊 Found ${dbUsers?.length || 0} users in database:\n`);
      dbUsers?.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.is_active}`);
        console.log('   ---');
      });
    }

    // Check companies
    console.log('\n🔍 Checking companies...\n');
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('*');

    if (companyError) {
      console.error('❌ Error fetching companies:', companyError);
    } else {
      console.log(`📊 Found ${companies?.length || 0} companies:\n`);
      companies?.forEach((company, index) => {
        console.log(`${index + 1}. Name: ${company.name}`);
        console.log(`   Admin Email: ${company.admin_email}`);
        console.log(`   Email Verified: ${company.admin_email_verified}`);
        console.log(`   Admin User ID: ${company.admin_user_id}`);
        console.log('   ---');
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Function to delete a specific user from auth
async function deleteAuthUser(email: string) {
  try {
    console.log(`🗑️ Attempting to delete user: ${email}`);
    
    // First, find the user
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return;
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    console.log(`👤 Found user: ${user.email} (ID: ${user.id})`);

    // Delete the user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error('❌ Error deleting user:', deleteError);
    } else {
      console.log(`✅ Successfully deleted user: ${email}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Main execution
const command = process.argv[2];
const email = process.argv[3];

if (command === 'delete' && email) {
  deleteAuthUser(email);
} else {
  checkAuthUsers();
}
