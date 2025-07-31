import {
  pgTable,
  integer,
  varchar,
  text,
  timestamp,
  primaryKey,
  index,
  uuid,
  bigint,
} from 'drizzle-orm/pg-core';
import {
  jobPositionNameEnum,
  memberRoleEnum,
  projectStatusEnum,
  taskPriorityEnum,
  taskStatusEnum,
} from './enums';

export const user = pgTable(
  'user',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkId: varchar('clerk_id').unique().notNull(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    imgLink: varchar('img_url').notNull(),
    primaryEmailAddress: varchar('primary_email_address', { length: 255 }).notNull(),

    // default to 'none'
    jobPositionId: bigint('job_position_id', { mode: 'number' })
      .references(() => jobPosition.id)
      .default(1),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [index('clerk_id_idx').on(table.clerkId)],
);

export const jobPosition = pgTable(
  'job_position',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    name: jobPositionNameEnum('name').notNull().unique(),
  },
  (table) => [index('job_position_id').on(table.id)],
);

export const project = pgTable(
  'project',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 300 }).notNull(),
    description: varchar('description', { length: 300 }),
    status: projectStatusEnum('status').notNull().default('active'),
    statusChangedAt: timestamp('status_changed_at'),
    statusChangedBy: integer('status_changed_by').references(() => user.id),
    ownerId: uuid('owner_id')
      .references(() => user.id)
      .notNull(),
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [index('project_id_idx').on(table.id)],
);

export const projectMember = pgTable(
  'project_member',
  {
    userId: uuid('user_id')
      .references(() => user.id)
      .notNull(),
    projectId: uuid('project_id')
      .references(() => project.id)
      .notNull(),
    projectMemberRole: memberRoleEnum('project_member_role').notNull().default('member'),
    joinedAt: timestamp('joined_at').defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'custom_project_member_pk',
      columns: [table.userId, table.projectId],
    }),
  ],
);

export const projectDiscussion = pgTable('project_discussion', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  projectId: uuid('project_id')
    .references(() => project.id)
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  closedAt: timestamp('closed_at'),
});

export const teamProjects = pgTable(
  'team_projects',
  {
    teamId: uuid('team_id').references(() => team.id),
    projectId: uuid('project_id').references(() => project.id),
  },
  (table) => [
    primaryKey({
      name: 'custom_team_projects_pk',
      columns: [table.teamId, table.projectId],
    }),
  ],
);

export const team = pgTable(
  'team',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 300 }).notNull(),
    description: varchar('description', { length: 300 }),
    color: varchar('color', { length: 7 }),
    createdBy: uuid('created_by')
      .references(() => user.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [index('team_id_idx').on(table.id)],
);

export const teamMember = pgTable(
  'team_member',
  {
    userId: uuid('user_id')
      .references(() => user.id)
      .notNull(),
    teamId: uuid('team_id')
      .references(() => team.id)
      .notNull(),
    teamMemberRole: memberRoleEnum('team_member_role').notNull().default('member'),
    joinedAt: timestamp('joined_at').defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'custom_team_member_pk',
      columns: [table.userId, table.teamId],
    }),
  ],
);

export const milestone = pgTable('milestone', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  milestoneName: varchar('milestone_name', { length: 255 }).notNull(),
  projectId: uuid('project_id')
    .references(() => project.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  achievedAt: timestamp('achieved_at'),
});

export const kanbanColumn = pgTable(
  'kanban_column',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 300 }),
    projectId: uuid('project_id')
      .references(() => project.id)
      .notNull(),
    position: integer('position').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [index('kanban_column_id_idx').on(table.id)],
);

export const label = pgTable(
  'label',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    color: varchar('color', { length: 7 }),
  },
  (table) => [index('label_id_idx').on(table.id)],
);

// consider: create detail column (as markdown) for entering details about the task
export const task = pgTable(
  'task',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    title: varchar('title', { length: 300 }).notNull(),
    description: varchar('description', { length: 300 }),
    detail: text('detail'),
    projectId: uuid('project_id')
      .references(() => project.id)
      .notNull(),
    kanbanColumnId: integer('kanban_column_id')
      .references(() => kanbanColumn.id)
      .notNull(),
    milestoneId: integer('milestone_id').references(() => milestone.id),
    status: taskStatusEnum('status').notNull().default('none'),
    priority: taskPriorityEnum('priority').notNull().default('none'),
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [index('task_id_idx').on(table.id)],
);

export const taskLabel = pgTable(
  'task_label',
  {
    taskId: bigint('task_id', { mode: 'number' })
      .references(() => task.id)
      .notNull(),
    labelId: integer('label_id')
      .references(() => label.id)
      .notNull(),
  },
  (table) => [
    primaryKey({ name: 'custom_task_label_pk', columns: [table.taskId, table.labelId] }),
  ],
);

export const taskHistory = pgTable('task_history', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  taskId: bigint('task_id', { mode: 'number' })
    .references(() => task.id)
    .notNull(),
  changedBy: uuid('changed_by')
    .references(() => user.id)
    .notNull(),
  changeDescription: text('change_description').notNull(),
  changedAt: timestamp('changed_at').notNull().defaultNow(),
});

export const taskAssignee = pgTable(
  'task_assignee',
  {
    taskId: bigint('task_id', { mode: 'number' })
      .references(() => task.id)
      .notNull(),
    assigneeId: uuid('assignee_id')
      .references(() => user.id)
      .notNull(),
    assignedAt: timestamp('assigned_at').defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'custom_task_assignee_pk',
      columns: [table.taskId, table.assigneeId],
    }),
  ],
);

export const taskAttachment = pgTable('task_attachment', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  taskId: bigint('task_id', { mode: 'number' }).references(() => task.id),
  filename: varchar('filename', { length: 255 }).notNull(),
  filetype: varchar('filetype', { length: 100 }).notNull(),
  filepath: text('filepath').notNull(),
  uploadedBy: uuid('uploaded_by_id')
    .references(() => user.id)
    .notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

// TODO: add ability for comments to have replies
export const taskComment = pgTable('task_comment', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  content: text('content').notNull(),
  taskId: bigint('task_id', { mode: 'number' })
    .references(() => task.id)
    .notNull(),

  // check if viable
  parentCommentId: uuid('parent_comment_id'),
  authorId: uuid('author_id')
    .references(() => user.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
