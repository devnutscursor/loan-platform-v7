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

async function resetAndSeedSuperAdmin() {
  try {
    console.log('🔄 Resetting and seeding super admin...');

    const adminEmail = 'admin@loanplatform.com';
    const adminPassword = 'Admin123!@#'; // You can change this

    // Delete existing super admin from database
    console.log('🗑️ Removing existing super admin from database...');
    await db.delete(users).where(eq(users.role, 'super_admin'));

    // Delete existing auth user (if exists)
    console.log('🗑️ Removing existing auth user...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(user => user.email === adminEmail);
    
    if (existingUser) {
      await supabase.auth.admin.deleteUser(existingUser.id);
      console.log('✅ Existing auth user deleted');
    }

    console.log('🔐 Creating new Supabase Auth user...');
    
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

    // Create a default company for testing (only if it doesn't exist)
    const existingCompany = await db
      .select()
      .from(companies)
      .where(eq(companies.slug, 'default-company'))
      .limit(1);

    if (existingCompany.length === 0) {
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
    } else {
      console.log('✅ Default company already exists:', existingCompany[0].name);
    }

    console.log('\n🎉 Reset and seeding completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('📧 Email:', adminEmail);
    console.log('🔐 Password:', adminPassword);
    console.log('\n🚀 You can now login at: http://localhost:3000/auth');

  } catch (error) {
    console.error('❌ Error resetting and seeding database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetAndSeedSuperAdmin();
