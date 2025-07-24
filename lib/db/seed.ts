import { db } from '@/lib/db/connect_db';
import { reset, seed } from 'drizzle-seed';
import * as schema from '@/lib/db/schema';

const { projects, tasks, comments } = schema;

async function main() {
  await reset(db, schema);
  await seed(db, { projects });
  await seed(db, { tasks });
  await seed(db, { comments });
}

main();
