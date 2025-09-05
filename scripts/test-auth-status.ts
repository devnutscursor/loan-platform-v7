import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthStatus() {
  console.log('🔍 Testing authentication status and RLS policies...');
  
  try {
    // Test 1: Check current session
    console.log('\n📋 Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (session) {
      console.log('✅ User is authenticated:', session.user.email);
      console.log('User ID:', session.user.id);
    } else {
      console.log('❌ No active session - user not authenticated');
    }
    
    // Test 2: Try to fetch companies without authentication
    console.log('\n🔍 Testing companies query without authentication...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');
    
    if (companiesError) {
      console.log('❌ Companies query failed:', companiesError.message);
      console.log('Error code:', companiesError.code);
      console.log('Error details:', companiesError.details);
    } else {
      console.log('✅ Companies query successful');
      console.log('Companies found:', companies.length);
    }
    
    // Test 3: Try to sign in with super admin
    console.log('\n🔐 Testing super admin sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@loanplatform.com',
      password: 'Admin123!@#'
    });
    
    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
    } else {
      console.log('✅ Sign in successful:', signInData.user.email);
      
      // Test 4: Try to fetch companies after authentication
      console.log('\n🔍 Testing companies query after authentication...');
      const { data: authCompanies, error: authCompaniesError } = await supabase
        .from('companies')
        .select('*');
      
      if (authCompaniesError) {
        console.log('❌ Authenticated companies query failed:', authCompaniesError.message);
      } else {
        console.log('✅ Authenticated companies query successful');
        console.log('Companies found:', authCompanies.length);
        if (authCompanies.length > 0) {
          console.log('Sample company:', authCompanies[0]);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Error during auth test:', error);
  }
}

testAuthStatus();
