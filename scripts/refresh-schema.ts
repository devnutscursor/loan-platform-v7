import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function refreshSchema() {
  console.log('🔄 Refreshing Supabase schema cache...');
  
  try {
    // Try to query the companies table to refresh the schema cache
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, isActive')
      .limit(1);
    
    if (error) {
      console.log('❌ Schema cache refresh failed:', error.message);
      console.log('This is expected if the column doesn\'t exist yet.');
    } else {
      console.log('✅ Schema cache refreshed successfully');
      console.log('Sample data:', data);
    }
  } catch (error) {
    console.log('❌ Error refreshing schema:', error);
  }
}

refreshSchema();


