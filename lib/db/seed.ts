import { db } from '@/lib/db/connect_db';
import { reset, seed } from 'drizzle-seed';
import * as schema from '@/lib/db/schema';

async function main() {
  await reset(db, schema);
  await seed(db, { users: schema.users, projects: schema.projects }).refine((f) => ({
    users: {
      count: 5,
      columns: {
        firstName: f.firstName(),
        lastName: f.lastName(),
        primaryEmailAddress: f.email(),
      },
    },
  }));
}

main();
