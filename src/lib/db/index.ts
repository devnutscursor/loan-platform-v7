import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let _dbInstance: ReturnType<typeof drizzle<typeof schema>> | undefined;

function createDbInstance() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL environment variable is not set');
  const useSsl = process.env.NODE_ENV === 'production' || connectionString.includes('supabase');
  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 60,
    max_lifetime: 60 * 30,
    ssl: useSsl ? 'require' : false,
    prepare: false,
    transform: { undefined: null },
    onnotice: () => {},
    debug: process.env.NODE_ENV === 'development',
  });
  return drizzle(client, { schema });
}

// Lazy proxy — initialization is deferred until first use, not at module load time
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    if (!_dbInstance) _dbInstance = createDbInstance();
    return Reflect.get(_dbInstance, prop, receiver);
  },
});

// Export schema for use in other files
export * from './schema';