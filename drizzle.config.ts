import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  out: './migrations',
  schema: './lib/db/schema',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    prefix: 'timestamp',
    table: '__migrations__',
    schema: 'public',
  },
});
