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
  foreignKey,
  date,
  boolean,
  uniqueIndex,
  jsonb,
} from 'drizzle-orm/pg-core';
import { memberRoleEnum, projectStatusEnum, taskPriorityEnum } from './enums';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkId: varchar('clerk_id').unique().notNull(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    imgLink: varchar('img_url').notNull(),
    primaryEmailAddress: varchar('primary_email_address', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [index('user_id_idx').on(table.id)],
);

export const rolePermissions = pgTable('role_permissions', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  role: memberRoleEnum().notNull(),
  permissions: jsonb('permissions').notNull(),
});

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 300 }).notNull(),
    description: varchar('description', { length: 300 }),
    status: projectStatusEnum().default('active').notNull(),
    statusChangedAt: timestamp('status_changed_at'),
    statusChangedById: uuid('status_changed_by_id').references(() => users.id),
    isArchived: boolean('is_archived').default(false).notNull(),
    ownerId: uuid('owner_id')
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    dueDate: date('due_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [index('project_id_idx').on(table.id)],
);

// [CONSIDER] dynamic project permission list
// export const projectPermissions = pgTable(
//   'project_permissions',
//   {
//     projectId: uuid('project_id')
//       .references(() => projects.id)
//       .notNull(),
//     role: memberRoleEnum().notNull(),
//     permissions: jsonb('permissions').notNull(),
//     createdAt: timestamp('created_at').defaultNow(),
//     updatedAt: timestamp('updated_at').defaultNow(),
//   },
//   (table) => [
//     primaryKey({
//       name: 'project_role_unique_idx',
//       columns: [table.projectId, table.role],
//     }),
//   ],
// );

export const projectMembers = pgTable(
  'project_members',
  {
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    projectTeamId: uuid('project_team_id').references(() => projectTeams.id, {
      onDelete: 'restrict',
    }),

    // [CONSIDER] adding addedBy columns
    role: memberRoleEnum().notNull().default('member'),
    joinedAt: timestamp('joined_at').defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'custom_project_member_pk',
      columns: [table.userId, table.projectId],
    }),
  ],
);

export const projectMemberInvitaion = pgTable('project_member_inviation', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  inviteeId: uuid('invitee_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  invitedById: uuid('invitee_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  role: memberRoleEnum().notNull().default('member'),
  invitedAt: timestamp('joined_at').defaultNow(),
});

export const projectTeams = pgTable('project_teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  teamName: varchar('team_name', { length: 300 }).notNull(),
  description: varchar('description', { length: 300 }),

  // [CONSIDER]
  // set to null if user deleted is the team leader
  // and assign others team members to be team_leader in server action
  leaderId: uuid('leader_id').references(() => users.id, { onDelete: 'set null' }),

  createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  color: varchar('color', { length: 7 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
});

export const projectDiscussions = pgTable('project_discussions', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  closedAt: timestamp('closed_at'),
});

export const projectDiscussionComments = pgTable(
  'project_discussion_comments',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    authorId: uuid('author_id')
      .references(() => users.id)
      .notNull(),
    projectDiscussionId: uuid('project_discussion_id')
      .references(() => projectDiscussions.id, { onDelete: 'cascade' })
      .notNull(),
    parentCommentId: bigint('parent_comment_id', { mode: 'number' }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [
    foreignKey({
      columns: [table.parentCommentId],
      foreignColumns: [table.id],
      name: 'project_discussion_comments_parent_comment_id_fk',
    }).onDelete('set null'),
  ],
);

export const milestones = pgTable('milestones', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  milestoneName: varchar('milestone_name', { length: 255 }).notNull(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const kanbanColumns = pgTable(
  'kanban_columns',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
  },
  (table) => [
    index('kanban_column_id_idx').on(table.id),
    uniqueIndex('kanban_name_unique_idx').on(table.name),
  ],
);

export const projectKanbanColumns = pgTable('project_kanban_columns', {
  id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
  kanbanColumnId: uuid('kanban_column_id')
    .references(() => kanbanColumns.id, { onDelete: 'cascade' })
    .notNull(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  description: varchar('description', { length: 300 }),
  color: varchar('color', { length: 300 }),

  // position order within in the project
  position: integer('position').notNull(),

  // determines if kanban column is user created
  isCustom: boolean('is_custom').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
});

export const labels = pgTable(
  'labels',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 255 }).notNull().unique(),
  },
  (table) => [index('label_id_idx').on(table.id)],
);

export const tasks = pgTable(
  'tasks',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    title: varchar('title', { length: 300 }).notNull(),
    description: varchar('description', { length: 300 }),

    // will take text in markdown format
    detail: text('detail'),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),

    // [NOTE] manually handle task deletion when a custom kanban column is removed
    kanbanColumnId: uuid('kanban_column_id')
      .references(() => kanbanColumns.id, { onDelete: 'cascade' })
      .notNull(),
    milestoneId: integer('milestone_id').references(() => milestones.id, { onDelete: 'restrict' }),
    status: varchar('status').notNull(),
    position: integer('position').notNull(),
    priority: taskPriorityEnum().default('none').notNull(),
    isCompleted: boolean('is_compeleted').notNull(),
    createdById: uuid('created_by_id')
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    isNotAssigned: boolean('is_not_assigned').notNull().default(false),
    dueDate: date('due_date'),
    startDate: date('start_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [index('task_id_idx').on(table.id)],
);

export const projectLabels = pgTable('project_labels', {
  id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
  labelId: bigint('label_id', { mode: 'number' })
    .references(() => labels.id, { onDelete: 'cascade' })
    .notNull(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  color: varchar('color', { length: 7 }),
  isCustom: boolean('is_custom').notNull(),
  updatedAt: timestamp('updated_at'),
});

// join table for mulitple labels in task
// project_labels -> task_labels -> task
export const taskLabels = pgTable(
  'task_labels',
  {
    taskId: bigint('task_id', { mode: 'number' })
      .references(() => tasks.id, { onDelete: 'cascade' })
      .notNull(),

    // [NOTE] manually delete task labels when a project label is deleted
    labelId: bigint('label_id', { mode: 'number' })
      .references(() => labels.id)
      .notNull(),
  },
  (table) => [
    primaryKey({ name: 'custom_task_labels_pk', columns: [table.taskId, table.labelId] }),
  ],
);

export const taskHistory = pgTable('task_history', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  taskId: bigint('task_id', { mode: 'number' })
    .references(() => tasks.id)
    .notNull(),
  changedBy: uuid('changed_by').references(() => users.id, { onDelete: 'set null' }),
  changeDescription: text('change_description').notNull(),
  changedAt: timestamp('changed_at').notNull().defaultNow(),
});

export const taskAssignees = pgTable(
  'task_assignees',
  {
    taskId: bigint('task_id', { mode: 'number' })
      .references(() => tasks.id, { onDelete: 'cascade' })
      .notNull(),
    assigneeId: uuid('assignee_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    assignedById: uuid('assigned_by_id').references(() => users.id, { onDelete: 'set null' }),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      name: 'custom_task_assignee_pk',
      columns: [table.taskId, table.assigneeId],
    }),
  ],
);

export const taskAttachments = pgTable('task_attachments', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  taskId: bigint('task_id', { mode: 'number' }).references(() => tasks.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  filetype: varchar('filetype', { length: 100 }).notNull(),
  filepath: text('filepath').notNull(),
  uploadedById: uuid('uploaded_by_id')
    .references(() => users.id)
    .notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

// TODO: add ability for comments to have replies
export const taskComments = pgTable(
  'task_comments',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    content: text('content').notNull(),
    taskId: bigint('task_id', { mode: 'number' })
      .references(() => tasks.id, { onDelete: 'cascade' })
      .notNull(),

    parentCommentId: bigint('parent_comment_id', { mode: 'number' }),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [
    foreignKey({
      columns: [table.parentCommentId],
      foreignColumns: [table.id],
      name: 'task_comments_parent_column_id_fk',
    }).onDelete('set null'),
  ],
);
