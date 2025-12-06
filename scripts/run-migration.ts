#!/usr/bin/env node

/**
 * Run a specific migration file
 * Usage: yarn db:run-migration <migration-filename>
 * Example: yarn db:run-migration 0010_spicy_korvac.sql
 */

// Load environment variables FIRST, before any other imports
import { config } from 'dotenv';
config({ path: '.env.local' });

// Now create database connection directly instead of importing db module
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join } from 'path';

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.error('Make sure .env.local exists and contains DATABASE_URL');
  process.exit(1);
}

// Create database connection
const client = postgres(process.env.DATABASE_URL, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 60,
});

const db = drizzle(client);

async function runMigration(migrationFileName: string) {
  try {
    console.log(`🚀 Running migration: ${migrationFileName}...`);
    
    // Read the migration file
    const migrationPath = join(process.cwd(), 'drizzle', migrationFileName);
    let migrationSQL: string;
    
    try {
      migrationSQL = readFileSync(migrationPath, 'utf-8');
    } catch (error) {
      console.error(`❌ Error: Could not read migration file: ${migrationPath}`);
      console.error('Make sure the file exists in the drizzle/ directory');
      process.exit(1);
    }
    
    // Split by statement breakpoints and execute each statement
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let executedCount = 0;
    for (const statement of statements) {
      const cleanStatement = statement.trim();
      if (cleanStatement) {
        try {
          await db.execute(sql.raw(cleanStatement));
          executedCount++;
          console.log(`✅ Executed statement ${executedCount}`);
        } catch (error: any) {
          // If table/index already exists, that's okay - continue
          if (error?.code === '42P07' || error?.message?.includes('already exists')) {
            console.log(`⚠️  Skipped (already exists): ${cleanStatement.substring(0, 50)}...`);
            continue;
          }
          throw error;
        }
      }
    }
    
    console.log(`\n✅ Migration completed successfully! (${executedCount} statements executed)`);
    await client.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    await client.end();
    process.exit(1);
  }
}

// Get migration file name from command line arguments
const migrationFileName = process.argv[2];

if (!migrationFileName) {
  console.error('❌ Error: Migration file name is required');
  console.log('Usage: yarn db:run-migration <migration-filename>');
  console.log('Example: yarn db:run-migration 0010_spicy_korvac.sql');
  process.exit(1);
}

runMigration(migrationFileName);

