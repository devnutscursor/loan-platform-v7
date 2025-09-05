import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function forceSchemaRefresh() {
  console.log('🔄 Forcing Supabase schema cache refresh...');
  
  try {
    // Method 1: Try to query with different column combinations
    console.log('📋 Testing different column combinations...');
    
    // Test 1: Query without isActive
    const { data: test1, error: error1 } = await supabase
      .from('companies')
      .select('id, name, email')
      .limit(1);
    
    if (error1) {
      console.log('❌ Basic query failed:', error1.message);
    } else {
      console.log('✅ Basic query works:', test1);
    }
    
    // Test 2: Try to query with isActive (this should fail and refresh cache)
    const { data: test2, error: error2 } = await supabase
      .from('companies')
      .select('id, name, email, isActive')
      .limit(1);
    
    if (error2) {
      console.log('❌ isActive query failed (expected):', error2.message);
    } else {
      console.log('✅ isActive query works:', test2);
    }
    
    // Method 2: Try to insert a test record to trigger schema refresh
    console.log('🧪 Testing insert to trigger schema refresh...');
    
    const testCompany = {
      name: 'Schema Test Company',
      slug: 'schema-test-company',
      email: 'test@schematest.com',
      website: 'https://schematest.com'
    };
    
    const { data: insertTest, error: insertError } = await supabase
      .from('companies')
      .insert(testCompany)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
    } else {
      console.log('✅ Insert test successful:', insertTest);
      
      // Clean up test record
      await supabase
        .from('companies')
        .delete()
        .eq('id', insertTest.id);
      console.log('🧹 Test record cleaned up');
    }
    
  } catch (error) {
    console.log('❌ Error during schema refresh:', error);
  }
}

forceSchemaRefresh();


