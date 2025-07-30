import {
  pgTable,
  integer,
  varchar,
  text,
  timestamp,
  primaryKey,
  index,
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
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    clerkId: varchar('clerk_id').unique().notNull(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    imgUrl: varchar('img_url').notNull(),
    emailAddress: varchar('email', { length: 255 }).notNull(),
    jobPositionId: integer('job_position_id').references(() => jobPosition.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [index('clerk_id_idx').on(table.clerkId)],
);

export const jobPosition = pgTable(
  'job_position',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: jobPositionNameEnum('name').notNull(),
  },
  (table) => [index('job_position_id').on(table.id)],
);

export const project = pgTable(
  'project',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    status: projectStatusEnum('status').notNull().default('active'),
    statusChangedAt: timestamp('status_changed_at'),
    statusChangedBy: integer('status_changed_by').references(() => user.id),
    ownerId: integer('owner_id')
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
    userId: integer('user_id')
      .references(() => user.id)
      .notNull(),
    projectId: integer('project_id')
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
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  projectId: integer('project_id')
    .references(() => project.id)
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  closedAt: timestamp('closed_at'),
});

export const team = pgTable(
  'team',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    projectId: integer('project_id').references(() => project.id),
    color: varchar('color', { length: 7 }),
    createdBy: integer('created_by')
      .references(() => user.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('team_id_idx').on(table.id)],
);

export const teamMember = pgTable(
  'team_member',
  {
    userId: integer('user_id')
      .references(() => user.id)
      .notNull(),
    teamId: integer('team_id')
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
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  milestoneName: varchar('milestone_name', { length: 255 }).notNull(),
  projectId: integer('project_id')
    .references(() => project.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  achievedAt: timestamp('achieved_at'),
});

export const kanbanColumn = pgTable(
  'kanban_column',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    projectId: integer('project_id')
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
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    color: varchar('color', { length: 7 }),
  },
  (table) => [index('label_id_idx').on(table.id)],
);
// consider: create detail column (as markdown) for entering details about the task
export const task = pgTable(
  'task',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    detail: text('detail'),
    projectId: integer('project_id')
      .references(() => project.id)
      .notNull(),
    kanbanColumnId: integer('kanban_column_id')
      .references(() => kanbanColumn.id)
      .notNull(),
    milestoneId: integer('milestone_id').references(() => milestone.id),
    status: taskStatusEnum('status').notNull().default('planning'),
    priority: taskPriorityEnum('priority').notNull().default('medium'),
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [index('task_id_idx').on(table.id)],
);

export const taskLabel = pgTable(
  'task_label',
  {
    taskId: integer('task_id')
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
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  taskId: integer('task_id')
    .references(() => task.id)
    .notNull(),
  changedBy: integer('changed_by')
    .references(() => user.id)
    .notNull(),
  changeDescription: text('change_description').notNull(),
  changedAt: timestamp('changed_at').notNull().defaultNow(),
});

export const taskAssignee = pgTable(
  'task_assignee',
  {
    taskId: integer('task_id')
      .references(() => task.id)
      .notNull(),
    assigneeId: integer('assignee_id')
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
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  taskId: integer('task_id').references(() => task.id),
  filename: varchar('filename', { length: 255 }).notNull(),
  filetype: varchar('filetype', { length: 100 }).notNull(),
  filepath: varchar('filepath', { length: 500 }).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

export const taskComment = pgTable('task_comment', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  content: text('content').notNull(),
  taskId: integer('task_id')
    .references(() => task.id)
    .notNull(),
  authorId: integer('author_id')
    .references(() => user.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
