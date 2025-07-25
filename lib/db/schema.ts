// TODO: Task 3.1 - Design database schema for users, projects, lists, and tasks
// TODO: Task 3.3 - Set up Drizzle ORM with type-safe schema definitions

import {
  pgTable,
  text,
  integer,
  varchar,
  bigserial,
  primaryKey,
} from 'drizzle-orm/pg-core';
import * as enums from './enums';
import { timestamp } from 'drizzle-orm/pg-core';

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

export const jobPosition = pgTable('job_position', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
});

export const user = pgTable('user', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  technicalKey: integer('technical_key').unique(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  jobPositionId: integer('job_position_id').references(() => jobPosition.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const team = pgTable('team', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const memberRole = pgTable('member_role', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: enums.teamMemberRoleEnum('name').notNull(),
});

export const teamMember = pgTable(
  'team_member',
  {
    memberId: integer('member_id').references(() => user.id),
    teamId: integer('team_id').references(() => team.id),
    memberRoleId: integer('member_role_id').references(() => memberRole.id),
    joinedAt: timestamp('joined_at').defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.memberId, table.teamId] }),
  }),
);

// consider: add public_id when passing id to API endpoint
export const project = pgTable('project', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  teamId: integer('team_id').references(() => team.id),
  title: varchar('title', { length: 255 }),
  description: varchar('description', { length: 1000 }),
  status: enums.projectStatusEnum('status').default('active'),
  statusChangedAt: timestamp('status_changed_at'),
  statusChangedBy: integer('status_changed_by').references(() => teamMember.memberId),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// consider: create detail column (as markdown) for entering details about the task
export const task = pgTable('task', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  projectId: integer('project_id').references(() => project.id),
  status: enums.taskStatusEnum('status').default('planning'),
  priority: enums.taskPriorityEnum('priority').default('low'),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const label = pgTable('label', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  color: varchar('color', { length: 7 }),
});

export const taskLabel = pgTable(
  'task_label',
  {
    taskId: integer('task_id').references(() => task.id),
    labelId: integer('label_id').references(() => label.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.taskId, table.labelId] }),
  }),
);

export const taskHistory = pgTable('task_history', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  taskId: integer('task_id').references(() => task.id),
  changedBy: integer('changed_by').references(() => teamMember.memberId),
  changeDescription: text('change_description'),
  changedAt: timestamp('changed_at').defaultNow(),
});

export const taskAssignee = pgTable(
  'task_assignee',
  {
    taskId: integer('task_id').references(() => task.id),
    assigneeId: integer('assignee_id').references(() => teamMember.memberId),
    assignedAt: timestamp('assigned_at').defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.taskId, table.assigneeId] }),
  }),
);

export const taskAttachment = pgTable('task_attachment', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  taskId: integer('task_id').references(() => task.id),
  filename: varchar('filename', { length: 255 }),
  filetype: varchar('filetype', { length: 100 }),
  filepath: varchar('filepath', { length: 500 }),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

export const taskComment = pgTable('task_comment', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  content: text('content'),
  taskId: integer('task_id').references(() => task.id),
  authorId: integer('author_id').references(() => teamMember.memberId),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const columnList = pgTable('column_list', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 255 }),
  description: varchar('description', { length: 500 }),
  projectId: integer('project_id').references(() => project.id),
  position: integer('position'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const milestone = pgTable('milestone', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  milestoneName: varchar('milestone_name', { length: 255 }),
  projectId: integer('project_id').references(() => project.id),
  achievedAt: timestamp('achieved_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const columnListNames = pgTable(
  'column_list_names',
  {
    columnListId: integer('column_list_id').references(() => columnList.id),
    projectId: integer('project_id').references(() => project.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.columnListId, table.projectId] }),
  }),
);

export const columnTaskList = pgTable(
  'column_task_list',
  {
    taskId: integer('task_id').references(() => task.id),
    columnListId: integer('column_list_id').references(() => columnList.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.taskId, table.columnListId] }),
  }),
);

// export type InsertProject = typeof projects.$inferInsert;
// export type SelectProject = typeof projects.$inferSelect;

// export type InsertTask = typeof tasks.$inferInsert;
// export type SelectTask = typeof tasks.$inferSelect;

// export type InsertComment = typeof comments.$inferInsert;
// export type SelectComment = typeof comments.$inferSelect;
