#!/usr/bin/env node

/**
 * Baseline migration history: mark all existing migration files as already applied.
 * Use when your DB already has the schema (e.g. from Supabase or manual runs) but
 * drizzle.__drizzle_migrations is empty or out of sync, so "yarn db:migrate" re-runs
 * old migrations and fails on "relation already exists".
 *
 * Usage: yarn db:baseline
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set (e.g. in .env.local)');
  process.exit(1);
}

const drizzleDir = path.join(process.cwd(), 'drizzle');
const journalPath = path.join(drizzleDir, 'meta', '_journal.json');

interface JournalEntry {
  idx: number;
  when: number;
  tag: string;
  breakpoints: boolean;
}

async function main() {
  if (!fs.existsSync(journalPath)) {
    console.error('❌ Not found:', journalPath);
    process.exit(1);
  }

  const journal = JSON.parse(fs.readFileSync(journalPath, 'utf-8')) as {
    entries: JournalEntry[];
  };

  const entries: { tag: string; when: number; hash: string }[] = [];

  for (const entry of journal.entries) {
    const sqlPath = path.join(drizzleDir, `${entry.tag}.sql`);
    if (!fs.existsSync(sqlPath)) {
      console.error('❌ Missing migration file:', sqlPath);
      process.exit(1);
    }
    const content = fs.readFileSync(sqlPath, 'utf-8');
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    entries.push({ tag: entry.tag, when: entry.when, hash });
  }

  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    await sql.unsafe(`
      CREATE SCHEMA IF NOT EXISTS drizzle;
      CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `);

    const existing = await sql`
      SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at
    ` as { hash: string; created_at: string }[];

    if (existing.length >= entries.length) {
      console.log('✅ Migration history already has', existing.length, 'entries. Nothing to do.');
      return;
    }

    for (const e of entries) {
      const found = existing.some((r) => r.hash === e.hash || Number(r.created_at) === e.when);
      if (found) continue;
      await sql`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES (${e.hash}, ${e.when})
      `;
      console.log('  Recorded:', e.tag);
    }

    console.log('✅ Baseline complete. You can run yarn db:migrate safely.');
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
