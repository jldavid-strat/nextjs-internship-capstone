import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import * as schema from './schema/schema';
import * as relations from './relations';

config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);
const client = sql;
export const db = drizzle(client, { schema: { ...schema, ...relations } });
