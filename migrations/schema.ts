import { pgTable, foreignKey, bigint, varchar, uuid, timestamp, text, index, unique, integer, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const memberRoleName = pgEnum("member_role_name", ['owner', 'admin', 'viewer', 'member'])
export const projectStatus = pgEnum("project_status", ['active', 'completed', 'archived', 'on_going', 'cancelled'])
export const taskPriority = pgEnum("task_priority", ['none', 'low', 'medium', 'high'])
export const taskStatus = pgEnum("task_status", ['none', 'in_progress', 'planning', 'review', 'done'])


export const milestones = pgTable("milestones", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "milestones_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	milestoneName: varchar("milestone_name", { length: 255 }).notNull(),
	projectId: uuid("project_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	achievedAt: timestamp("achieved_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "milestones_project_id_projects_id_fk"
		}),
]);

export const projectDiscussions = pgTable("project_discussions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	closedAt: timestamp("closed_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_discussions_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "project_discussions_created_by_users_id_fk"
		}),
]);

export const projects = pgTable("projects", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 300 }).notNull(),
	description: varchar({ length: 300 }),
	status: projectStatus().default('active').notNull(),
	statusChangedAt: timestamp("status_changed_at", { mode: 'string' }),
	statusChangedBy: uuid("status_changed_by"),
	ownerId: uuid("owner_id").notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("project_id_idx").using("btree", table.id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.statusChangedBy],
			foreignColumns: [users.id],
			name: "projects_status_changed_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "projects_owner_id_users_id_fk"
		}),
]);

export const projectTeams = pgTable("project_teams", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	teamName: varchar("team_name", { length: 300 }).notNull(),
	description: varchar({ length: 300 }),
	createdById: uuid("created_by_id").notNull(),
	color: varchar({ length: 7 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_teams_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [users.id],
			name: "project_teams_created_by_id_users_id_fk"
		}),
]);

export const labels = pgTable("labels", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "labels_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	color: varchar({ length: 7 }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("label_id_idx").using("btree", table.id.asc().nullsLast().op("int8_ops")),
	unique("labels_name_unique").on(table.name),
]);

export const projectDiscussionComments = pgTable("project_discussion_comments", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "project_discussion_comments_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	authorId: uuid("author_id").notNull(),
	projectDiscussionId: uuid("project_discussion_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	parentCommentId: bigint("parent_comment_id", { mode: "number" }),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "project_discussion_comments_author_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.projectDiscussionId],
			foreignColumns: [projectDiscussions.id],
			name: "project_discussion_comments_project_discussion_id_project_discu"
		}),
	foreignKey({
			columns: [table.parentCommentId],
			foreignColumns: [table.id],
			name: "project_discussion_comments_parent_comment_id_fk"
		}),
]);

export const taskHistory = pgTable("task_history", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "task_history_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	taskId: bigint("task_id", { mode: "number" }).notNull(),
	changedBy: uuid("changed_by").notNull(),
	changeDescription: text("change_description").notNull(),
	changedAt: timestamp("changed_at", { mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "task_history_task_id_tasks_id_fk"
		}),
	foreignKey({
			columns: [table.changedBy],
			foreignColumns: [users.id],
			name: "task_history_changed_by_users_id_fk"
		}),
]);

export const taskComments = pgTable("task_comments", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "task_comments_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	content: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	taskId: bigint("task_id", { mode: "number" }).notNull(),
	authorId: uuid("author_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	parentCommentId: bigint("parent_comment_id", { mode: "number" }),
}, (table) => [
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "task_comments_task_id_tasks_id_fk"
		}),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "task_comments_author_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.parentCommentId],
			foreignColumns: [table.id],
			name: "task_comments_parent_column_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clerkId: varchar("clerk_id").notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }).notNull(),
	imgUrl: varchar("img_url").notNull(),
	primaryEmailAddress: varchar("primary_email_address", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("clerk_id_idx").using("btree", table.clerkId.asc().nullsLast().op("text_ops")),
	unique("users_clerk_id_unique").on(table.clerkId),
]);

export const tasks = pgTable("tasks", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "tasks_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	title: varchar({ length: 300 }).notNull(),
	description: varchar({ length: 300 }),
	detail: text(),
	projectId: uuid("project_id").notNull(),
	kanbanColumnId: integer("kanban_column_id").notNull(),
	milestoneId: integer("milestone_id"),
	status: taskStatus().default('none').notNull(),
	priority: taskPriority().default('none').notNull(),
	dueDate: timestamp("due_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	startDate: timestamp("start_date", { mode: 'string' }),
}, (table) => [
	index("task_id_idx").using("btree", table.id.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "tasks_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.kanbanColumnId],
			foreignColumns: [kanbanColumns.id],
			name: "tasks_kanban_column_id_kanban_columns_id_fk"
		}),
	foreignKey({
			columns: [table.milestoneId],
			foreignColumns: [milestones.id],
			name: "tasks_milestone_id_milestones_id_fk"
		}),
]);

export const kanbanColumns = pgTable("kanban_columns", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "kanban_columns_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 300 }),
	projectId: uuid("project_id").notNull(),
	position: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("kanban_column_id_idx").using("btree", table.id.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "kanban_columns_project_id_projects_id_fk"
		}),
]);

export const taskAttachments = pgTable("task_attachments", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "task_attachments_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	taskId: bigint("task_id", { mode: "number" }),
	filename: varchar({ length: 255 }).notNull(),
	filetype: varchar({ length: 100 }).notNull(),
	filepath: text().notNull(),
	uploadedById: uuid("uploaded_by_id").notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "task_attachments_task_id_tasks_id_fk"
		}),
	foreignKey({
			columns: [table.uploadedById],
			foreignColumns: [users.id],
			name: "task_attachments_uploaded_by_id_users_id_fk"
		}),
]);

export const taskLabels = pgTable("task_labels", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	taskId: bigint("task_id", { mode: "number" }).notNull(),
	labelId: integer("label_id").notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "task_labels_task_id_tasks_id_fk"
		}),
	foreignKey({
			columns: [table.labelId],
			foreignColumns: [labels.id],
			name: "task_labels_label_id_labels_id_fk"
		}),
	primaryKey({ columns: [table.taskId, table.labelId], name: "custom_task_label_pk"}),
]);

export const taskAssignees = pgTable("task_assignees", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	taskId: bigint("task_id", { mode: "number" }).notNull(),
	assigneeId: uuid("assignee_id").notNull(),
	assignedAt: timestamp("assigned_at", { mode: 'string' }).defaultNow(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "task_assignees_task_id_tasks_id_fk"
		}),
	foreignKey({
			columns: [table.assigneeId],
			foreignColumns: [users.id],
			name: "task_assignees_assignee_id_users_id_fk"
		}),
	primaryKey({ columns: [table.taskId, table.assigneeId], name: "custom_task_assignee_pk"}),
]);

export const projectMembers = pgTable("project_members", {
	userId: uuid("user_id").notNull(),
	projectId: uuid("project_id").notNull(),
	projectTeamId: uuid("project_team_id"),
	projectMemberRole: memberRoleName().default('member').notNull(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "project_members_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_members_project_id_projects_id_fk"
		}),
	foreignKey({
			columns: [table.projectTeamId],
			foreignColumns: [projectTeams.id],
			name: "project_members_project_team_id_project_teams_id_fk"
		}),
	primaryKey({ columns: [table.userId, table.projectId], name: "custom_project_member_pk"}),
]);
