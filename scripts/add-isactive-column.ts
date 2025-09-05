import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addIsActiveColumn() {
  console.log('🔧 Adding isActive column to companies table...');
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync('add-isactive-column.sql', 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.log('❌ Error executing SQL:', error.message);
      console.log('Please run this SQL manually in your Supabase Dashboard → SQL Editor:');
      console.log('\n' + sql + '\n');
    } else {
      console.log('✅ isActive column added successfully');
      console.log('Result:', data);
    }
  } catch (error) {
    console.log('❌ Error:', error);
    console.log('Please run this SQL manually in your Supabase Dashboard → SQL Editor:');
    console.log('\n' + fs.readFileSync('add-isactive-column.sql', 'utf8') + '\n');
  }
}

addIsActiveColumn();


