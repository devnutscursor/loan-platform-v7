import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, companies } from '../src/lib/db/schema';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const client = postgres(connectionString);
const db = drizzle(client);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedSuperAdminWithAuth() {
  try {
    console.log('🌱 Starting database seeding with Supabase Auth...');

    // Check if super admin already exists
    const existingSuperAdmin = await db
      .select()
      .from(users)
      .where(eq(users.role, 'super_admin'))
      .limit(1);

    if (existingSuperAdmin.length > 0) {
      console.log('✅ Super admin already exists:', existingSuperAdmin[0].email);
      return;
    }

    const adminEmail = 'admin@loanplatform.com';
    const adminPassword = 'Admin123!@#'; // You can change this

    console.log('🔐 Creating Supabase Auth user...');
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }

    if (!authData.user) {
      console.error('❌ No user data returned from Supabase Auth');
      return;
    }

    console.log('✅ Supabase Auth user created:', authData.user.id);

    // Create super admin user in database with the same ID as Supabase Auth
    const superAdminData = {
      id: authData.user.id, // Use the same ID as Supabase Auth
      email: adminEmail,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin' as const,
      isActive: true,
    };

    const [newSuperAdmin] = await db
      .insert(users)
      .values(superAdminData)
      .returning();

    console.log('✅ Super admin created successfully!');
    console.log('📧 Email:', newSuperAdmin.email);
    console.log('🆔 ID:', newSuperAdmin.id);
    console.log('👤 Name:', `${newSuperAdmin.firstName} ${newSuperAdmin.lastName}`);
    console.log('🔑 Role:', newSuperAdmin.role);
    console.log('🔐 Password:', adminPassword);

    // Create a default company for testing
    const defaultCompany = {
      name: 'Default Company',
      slug: 'default-company',
      website: 'https://defaultcompany.com',
      isActive: true,
    };

    const [newCompany] = await db
      .insert(companies)
      .values(defaultCompany)
      .returning();

    console.log('✅ Default company created:', newCompany.name);

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('📧 Email:', adminEmail);
    console.log('🔐 Password:', adminPassword);
    console.log('\n🚀 You can now login at: http://localhost:3000/auth');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedSuperAdminWithAuth();
