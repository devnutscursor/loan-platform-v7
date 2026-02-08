#!/usr/bin/env tsx
/**
 * Syncs auth.users from public.users in the current (NEW) Supabase project.
 * For every row in public.users, creates an Auth user with the same id so login works.
 * Also ensures one super_admin exists (first user or SUPER_ADMIN_EMAIL).
 *
 * Run after migrating DB (e.g. from supabase_old_full.sql) when auth.users is empty.
 *
 * Usage:
 *   npx tsx scripts/sync-auth-users-from-public.ts
 *
 * Env (.env.local or .env):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY = NEW project
 *   AUTH_DEFAULT_PASSWORD (optional) = temp password for created users (default: ChangeMe@123)
 *   SUPER_ADMIN_EMAIL (optional) = email to treat as super admin; else first user
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });
config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (new project) in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEFAULT_PASSWORD = process.env.AUTH_DEFAULT_PASSWORD || 'ChangeMe@123';

async function main() {
  console.log('Fetching public.users from current project...');
  const { data: rows, error: fetchError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role');
  if (fetchError) {
    console.error('Failed to fetch users:', fetchError.message);
    process.exit(1);
  }
  if (!rows?.length) {
    console.log('No users in public.users. Nothing to sync.');
    return;
  }
  console.log(`Found ${rows.length} rows in public.users`);

  const { data: authList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existingAuthIds = new Set((authList?.users ?? []).map((u) => u.id));
  const existingAuthEmails = new Set((authList?.users ?? []).map((u) => u.email?.toLowerCase()).filter(Boolean));

  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || rows[0]?.email || '').toLowerCase();
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const email = row.email?.trim();
    if (!email) {
      console.warn('Skip user with no email, id:', row.id);
      skipped++;
      continue;
    }
    const emailLower = email.toLowerCase();
    if (existingAuthIds.has(row.id) || existingAuthEmails.has(emailLower)) {
      console.log('Already in auth:', email);
      skipped++;
      continue;
    }

    const isSuperAdmin = emailLower === superAdminEmail || row.role === 'super_admin';
    const fullName = [row.first_name, row.last_name].filter(Boolean).join(' ') || email;

    const attrs: Record<string, unknown> = {
      email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        first_name: row.first_name,
        last_name: row.last_name,
        role: isSuperAdmin ? 'super_admin' : row.role,
      },
    };
    if (row.id) attrs.id = row.id;

    const { data: u, error } = await supabase.auth.admin.createUser(attrs as any);

    if (error) {
      console.error('Failed:', email, error.message);
      continue;
    }
    if (u?.user) {
      existingAuthIds.add(u.user.id);
      existingAuthEmails.add((u.user.email || '').toLowerCase());
    }
    created++;
    console.log(isSuperAdmin ? 'Super admin created:' : 'Created:', email);
  }

  console.log('\nDone. Created:', created, 'Skipped:', skipped);
  if (created > 0) {
    console.log('Default password for new users:', DEFAULT_PASSWORD);
    console.log('Ask users to change password after first login.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
