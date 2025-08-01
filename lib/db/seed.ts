import { db } from '@/lib/db/connect_db';
import { reset, seed } from 'drizzle-seed';
import * as schema from '@/lib/db/schema';

const projectStatus = ['active', 'completed', 'archived', 'on_going', 'cancelled'];

const memberRoleName = ['owner', 'admin', 'viewer', 'member'];

const uuids = [
  '550e8400-e29b-41d4-a716-446655440000',
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '123e4567-e89b-12d3-a456-426655440000',
  '87654321-4321-4321-4321-210987654321',
];

const project_uuids = [
  'a1b2c3d4-e5f6-4789-a012-3456789abcde',
  'f8e7d6c5-b4a3-4210-9876-543210fedcba',
  '12345678-90ab-4cde-f012-3456789abcef',
  '87654321-0fed-4cba-9876-543210987654',
  'deadbeef-cafe-4babe-dead-beefcafebabe',
];
async function main() {
  await reset(db, schema);
  await seed(db, {
    users: schema.users,
    projects: schema.projects,
    project_members: schema.projectMembers,
  }).refine((f) => ({
    users: {
      count: 5,
      columns: {
        id: f.valuesFromArray({ values: uuids, isUnique: true }),
        firstName: f.firstName(),
        lastName: f.lastName(),
        primaryEmailAddress: f.email(),
      },
    },
    projects: {
      count: 10,
      columns: {
        id: f.valuesFromArray({ values: project_uuids, isUnique: true }),
        title: f.loremIpsum({ sentencesCount: 2 }),
        description: f.loremIpsum({ sentencesCount: 1 }),
        status: f.valuesFromArray({ values: projectStatus }),
        ownerId: f.valuesFromArray({ values: uuids }),
        dueDate: f.date(),
      },
    },
    project_members: {
      count: 5,
      columns: {
        userId: f.valuesFromArray({ values: uuids }),
        projectId: f.valuesFromArray({ values: project_uuids }),
        projectMemberRole: f.valuesFromArray({ values: memberRoleName }),
        joinedAt: f.date(),
      },
    },
  }));
}

main();
