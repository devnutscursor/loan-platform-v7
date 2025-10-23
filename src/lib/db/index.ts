import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create the connection
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, {
  max: 10, // Reduced for Vercel limits
  idle_timeout: 20,
  connect_timeout: 60, // Increased timeout for production
  max_lifetime: 60 * 30,
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  prepare: false, // Disable prepared statements for better compatibility
  transform: {
    undefined: null, // Transform undefined to null
  },
  onnotice: () => {}, // Suppress notices in production
  debug: process.env.NODE_ENV === 'development',
});

// Create the database instance
export const db = drizzle(client, { schema });

// Export schema for use in other files
export * from './schema';