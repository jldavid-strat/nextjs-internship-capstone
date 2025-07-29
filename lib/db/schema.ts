import {
  pgTable,
  integer,
  varchar,
  text,
  timestamp,
  primaryKey,
  uniqueIndex,
  bigserial,
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
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    clerkId: varchar('clerk_id').unique().notNull(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    imgUrl: varchar('img_url').notNull(),
    emailAddress: varchar('email', { length: 255 }).notNull(),
    jobPositionId: bigserial('job_position_id', { mode: 'number' }).references(
      () => jobPosition.id,
    ),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [index('clerk_id_idx').on(table.clerkId)],
);

export const jobPosition = pgTable(
  'job_position',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: jobPositionNameEnum('name').notNull(),
  },
  (table) => [index('job_position_id').on(table.id)],
);

export const project = pgTable(
  'project',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    status: projectStatusEnum('status').notNull().default('active'),
    statusChangedAt: timestamp('status_changed_at'),
    statusChangedBy: bigserial('status_changed_by', { mode: 'number' }).references(
      () => user.id,
    ),
    ownerId: bigserial('owner_id', { mode: 'number' })
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
    userId: bigserial('user_id', { mode: 'number' })
      .references(() => user.id)
      .notNull(),
    projectId: bigserial('project_id', { mode: 'number' })
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
    uniqueIndex('project_member_unique_idx').on(table.userId, table.projectId),
  ],
);

export const projectDiscussion = pgTable('project_discussion', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  projectId: bigserial('project_id', { mode: 'number' })
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
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    projectId: bigserial('project_id', { mode: 'number' }).references(() => project.id),
    color: varchar('color', { length: 7 }),
    createdBy: bigserial('created_by', { mode: 'number' })
      .references(() => user.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [index('team_id_idx').on(table.id)],
);

export const teamMember = pgTable(
  'team_member',
  {
    userId: bigserial('user_id', { mode: 'number' })
      .references(() => user.id)
      .notNull(),
    teamId: bigserial('team_id', { mode: 'number' })
      .references(() => team.id)
      .notNull(),
    teamMemberRole: memberRoleEnum('team_member_role').notNull().default('member'),
    joinedAt: timestamp('joined_at').defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'custom_project_member_pk',
      columns: [table.userId, table.teamId],
    }),
    uniqueIndex('team_member_unique_idx').on(table.userId, table.teamId),
  ],
);

export const milestone = pgTable('milestone', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  milestoneName: varchar('milestone_name', { length: 255 }).notNull(),
  projectId: bigserial('project_id', { mode: 'number' })
    .references(() => project.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  achievedAt: timestamp('achieved_at'),
});

export const kanbanColumn = pgTable(
  'kanban_column',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    projectId: bigserial('project_id', { mode: 'number' })
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
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    color: varchar('color', { length: 7 }),
  },
  (table) => [index('label_id_idx').on(table.id)],
);
// consider: create detail column (as markdown) for entering details about the task
export const task = pgTable(
  'task',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    detail: text('detail'),
    projectId: bigserial('project_id', { mode: 'number' })
      .references(() => project.id)
      .notNull(),
    kanbanColumnId: integer('kanban_column_id')
      .references(() => kanbanColumn.id)
      .notNull(),
    milestoneId: bigserial('milestone_id', { mode: 'number' }).references(
      () => milestone.id,
    ),
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
    taskId: bigserial('task_id', { mode: 'number' })
      .references(() => task.id)
      .notNull(),
    labelId: bigserial('label_id', { mode: 'number' })
      .references(() => label.id)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.taskId, table.labelId] })],
);

export const taskHistory = pgTable('task_history', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  taskId: bigserial('task_id', { mode: 'number' })
    .references(() => task.id)
    .notNull(),
  changedBy: bigserial('changed_by', { mode: 'number' })
    .references(() => user.id)
    .notNull(),
  changeDescription: text('change_description').notNull(),
  changedAt: timestamp('changed_at').notNull().defaultNow(),
});

export const taskAssignee = pgTable(
  'task_assignee',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    taskId: bigserial('task_id', { mode: 'number' })
      .references(() => task.id)
      .notNull(),
    assigneeId: bigserial('assignee_id', { mode: 'number' })
      .references(() => user.id)
      .notNull(),
    assignedAt: timestamp('assigned_at').defaultNow(),
  },
  (table) => [uniqueIndex('task_assignee_idx').on(table.taskId, table.assigneeId)],
);

export const taskAttachment = pgTable('task_attachment', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  taskId: bigserial('task_id', { mode: 'number' }).references(() => task.id),
  filename: varchar('filename', { length: 255 }).notNull(),
  filetype: varchar('filetype', { length: 100 }).notNull(),
  filepath: varchar('filepath', { length: 500 }).notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

export const taskComment = pgTable('task_comment', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  content: text('content').notNull(),
  taskId: bigserial('task_id', { mode: 'number' })
    .references(() => task.id)
    .notNull(),
  authorId: bigserial('author_id', { mode: 'number' })
    .references(() => user.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
