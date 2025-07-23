import { drizzle } from 'drizzle-orm/node-postgres';
import { reset, seed } from 'drizzle-seed';
import * as schema from '@/lib/db/schema';

const { projects, tasks, comments } = schema;

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  await reset(db, schema);
  await seed(db, { projects });
  await seed(db, { tasks });
  await seed(db, { comments });
}

main();
