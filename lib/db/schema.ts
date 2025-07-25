// TODO: Task 3.1 - Design database schema for users, projects, lists, and tasks
// TODO: Task 3.3 - Set up Drizzle ORM with type-safe schema definitions

import {
  pgTable,
  text,
  serial,
  date,
  integer,
  varchar,
  uuid,
  bigserial,
} from 'drizzle-orm/pg-core';
import { projectStatus } from './enums';
import { timestamp } from 'drizzle-orm/gel-core';

/*
TODO: Implementation Notes for Interns:

1. Install Drizzle ORM dependencies:
   - drizzle-orm
   - drizzle-kit
   - @vercel/postgres (if using Vercel Postgres)
   - OR pg + @types/pg (if using regular PostgreSQL)

2. Define schemas for:
   - users (id, clerkId, email, name, createdAt, updatedAt)
   - projects (id, name, description, ownerId, createdAt, updatedAt, dueDate)
   - lists (id, name, projectId, position, createdAt, updatedAt)
   - tasks (id, title, description, listId, assigneeId, priority, dueDate, position, createdAt, updatedAt)
   - comments (id, content, taskId, authorId, createdAt, updatedAt)

3. Set up proper relationships between tables
4. Add indexes for performance
5. Configure migrations

Example structure:
import { pgTable, text, timestamp, integer, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ... other tables
*/

// Placeholder exports to prevent import errors
// export const users = 'TODO: Implement users table schema';
// export const lists = 'TODO: Implement lists table schema';

// future considerations:
// add public_id when passing id to API endpoint
export const project = pgTable('project', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  teamId: bigserial('team_id', { mode: 'number' }).references(() => team.id),
  description: text('description'),
  status: projectStatus(),
  statusChangedAt: date('status_changed_at').defaultNow(),
  statusChangedBy: bigserial('status_changed_by', { mode: 'number' }).references(
    () => team_member.member_id,
  ),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  assigneeId: serial('assignee-id'),
  priority: varchar('priority', { length: 255 }).default('low'),
  position: integer('position').notNull(),
  createdAt: date('created_at').defaultNow(),
  updatedAt: date('updated_at').defaultNow(),
});
export const comments = pgTable('comments', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  description: text('description').notNull(),
  detail: text('detail').notNull(),
  authorId: serial('author_id').notNull(),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at'),
});

export type InsertProject = typeof projects.$inferInsert;
export type SelectProject = typeof projects.$inferSelect;

export type InsertTask = typeof tasks.$inferInsert;
export type SelectTask = typeof tasks.$inferSelect;

export type InsertComment = typeof comments.$inferInsert;
export type SelectComment = typeof comments.$inferSelect;
