import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, companies } from '../src/lib/db/schema';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function seedSuperAdmin() {
  try {
    console.log('🌱 Starting database seeding...');

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

    // Create super admin user
    const superAdminData = {
      id: crypto.randomUUID(), // Generate UUID
      email: 'admin@loanplatform.com',
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
    console.log('\n📋 Next steps:');
    console.log('1. Go to Supabase Dashboard → Authentication → Users');
    console.log('2. Create a new user with email: admin@loanplatform.com');
    console.log('3. Set a password for the super admin');
    console.log('4. Copy the User ID from Supabase Auth');
    console.log('5. Update the users table with the Auth User ID');
    console.log('\n💡 Or run: yarn seed:auth to create auth user automatically');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Import eq function
import { eq } from 'drizzle-orm';

seedSuperAdmin();
