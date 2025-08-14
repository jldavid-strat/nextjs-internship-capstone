import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
import * as schema from './schema/schema';
import * as relations from '../../migrations/relations';

config({ path: '.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema: { ...schema, ...relations } });

// [CONSIDER] implement caching: https://orm.drizzle.team/docs/cache
