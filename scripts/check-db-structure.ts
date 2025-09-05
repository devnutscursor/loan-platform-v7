import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseStructure() {
  console.log('🔍 Checking database structure and data...');
  
  try {
    // Check 1: Get all companies with all columns
    console.log('\n📋 Checking companies table structure...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(5);
    
    if (companiesError) {
      console.log('❌ Error fetching companies:', companiesError.message);
    } else {
      console.log('✅ Companies found:', companies.length);
      if (companies.length > 0) {
        console.log('📊 Sample company data:');
        console.log(JSON.stringify(companies[0], null, 2));
        
        // Check if isActive column exists in the data
        const firstCompany = companies[0];
        if ('is_active' in firstCompany) {
          console.log('✅ is_active column exists in data:', firstCompany.is_active);
        } else {
          console.log('❌ is_active column NOT found in data');
          console.log('Available columns:', Object.keys(firstCompany));
        }
      }
    }
    
    // Check 2: Try to query specific columns
    console.log('\n🔍 Testing specific column queries...');
    
    // Test without isActive
    const { data: test1, error: error1 } = await supabase
      .from('companies')
      .select('id, name, email, website')
      .limit(1);
    
    if (error1) {
      console.log('❌ Basic columns query failed:', error1.message);
    } else {
      console.log('✅ Basic columns query works');
    }
    
    // Test with isActive
    const { data: test2, error: error2 } = await supabase
      .from('companies')
      .select('id, name, email, website, is_active')
      .limit(1);
    
    if (error2) {
      console.log('❌ is_active column query failed:', error2.message);
    } else {
      console.log('✅ is_active column query works');
      console.log('is_active value:', test2?.[0]?.is_active);
    }
    
    // Check 3: Try to insert a test record
    console.log('\n🧪 Testing insert with isActive...');
    const testCompany = {
      name: 'Cache Test Company',
      slug: 'cache-test-company',
      email: 'cache@test.com',
      website: 'https://cachetest.com',
      is_active: true
    };
    
    const { data: insertTest, error: insertError } = await supabase
      .from('companies')
      .insert(testCompany)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Insert with is_active failed:', insertError.message);
    } else {
      console.log('✅ Insert with is_active successful');
      console.log('Inserted data:', insertTest);
      
      // Clean up
      await supabase
        .from('companies')
        .delete()
        .eq('id', insertTest.id);
      console.log('🧹 Test record cleaned up');
    }
    
  } catch (error) {
    console.log('❌ Error during database check:', error);
  }
}

checkDatabaseStructure();


