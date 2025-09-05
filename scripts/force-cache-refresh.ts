import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function forceCacheRefresh() {
  console.log('🔄 Forcing Supabase schema cache refresh...');
  
  try {
    // Method 1: Multiple queries to trigger cache refresh
    console.log('📋 Running multiple queries to trigger cache refresh...');
    
    for (let i = 0; i < 5; i++) {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, is_active')
        .limit(1);
      
      if (error) {
        console.log(`❌ Query ${i + 1} failed:`, error.message);
      } else {
        console.log(`✅ Query ${i + 1} successful`);
      }
      
      // Small delay between queries
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Method 2: Try to trigger a schema reload via RPC
    console.log('\n🔧 Attempting schema reload via RPC...');
    
    try {
      const { data, error } = await supabase.rpc('reload_schema');
      if (error) {
        console.log('❌ RPC reload failed:', error.message);
      } else {
        console.log('✅ RPC reload successful:', data);
      }
    } catch (rpcError) {
      console.log('❌ RPC function not available, trying alternative...');
    }
    
    // Method 3: Try to access system tables to force refresh
    console.log('\n🔍 Accessing system tables to force refresh...');
    
    try {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'companies')
        .eq('column_name', 'is_active');
      
      if (error) {
        console.log('❌ System table query failed:', error.message);
      } else {
        console.log('✅ System table query successful:', data);
      }
    } catch (sysError) {
      console.log('❌ System table access not available');
    }
    
    // Method 4: Final test
    console.log('\n🧪 Final test - try to create a company...');
    
    const testCompany = {
      name: 'Final Cache Test',
      slug: 'final-cache-test',
      email: 'final@test.com',
      website: 'https://finaltest.com',
      is_active: true
    };
    
    const { data: finalTest, error: finalError } = await supabase
      .from('companies')
      .insert(testCompany)
      .select()
      .single();
    
    if (finalError) {
      console.log('❌ Final test failed:', finalError.message);
    } else {
      console.log('✅ Final test successful!');
      console.log('Created company:', finalTest);
      
      // Clean up
      await supabase
        .from('companies')
        .delete()
        .eq('id', finalTest.id);
      console.log('🧹 Final test record cleaned up');
    }
    
  } catch (error) {
    console.log('❌ Error during cache refresh:', error);
  }
}

forceCacheRefresh();


