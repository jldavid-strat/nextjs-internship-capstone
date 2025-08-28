import { relations } from "drizzle-orm/relations";
import { users, projects, projectDiscussions, projectDiscussionComments, projectTeams, tasks, taskAttachments, milestones, kanbanColumns, taskComments, taskHistory, taskLabels, labels, taskAssignees, projectMembers, projectKanbanColumns } from "./schema";

export const projectsRelations = relations(projects, ({one, many}) => ({
	user_ownerId: one(users, {
		fields: [projects.ownerId],
		references: [users.id],
		relationName: "projects_ownerId_users_id"
	}),
	user_statusChangedById: one(users, {
		fields: [projects.statusChangedById],
		references: [users.id],
		relationName: "projects_statusChangedById_users_id"
	}),
	projectDiscussions: many(projectDiscussions),
	projectTeams: many(projectTeams),
	milestones: many(milestones),
	tasks: many(tasks),
	projectMembers: many(projectMembers),
	projectKanbanColumns: many(projectKanbanColumns),
}));

export const usersRelations = relations(users, ({many}) => ({
	projects_ownerId: many(projects, {
		relationName: "projects_ownerId_users_id"
	}),
	projects_statusChangedById: many(projects, {
		relationName: "projects_statusChangedById_users_id"
	}),
	projectDiscussions: many(projectDiscussions),
	projectDiscussionComments: many(projectDiscussionComments),
	projectTeams_createdById: many(projectTeams, {
		relationName: "projectTeams_createdById_users_id"
	}),
	projectTeams_leaderId: many(projectTeams, {
		relationName: "projectTeams_leaderId_users_id"
	}),
	taskAttachments: many(taskAttachments),
	tasks: many(tasks),
	taskComments: many(taskComments),
	taskHistories: many(taskHistory),
	taskAssignees_assignedById: many(taskAssignees, {
		relationName: "taskAssignees_assignedById_users_id"
	}),
	taskAssignees_assigneeId: many(taskAssignees, {
		relationName: "taskAssignees_assigneeId_users_id"
	}),
	projectMembers: many(projectMembers),
}));

export const projectDiscussionsRelations = relations(projectDiscussions, ({one, many}) => ({
	project: one(projects, {
		fields: [projectDiscussions.projectId],
		references: [projects.id]
	}),
	user: one(users, {
		fields: [projectDiscussions.createdById],
		references: [users.id]
	}),
	projectDiscussionComments: many(projectDiscussionComments),
}));

export const projectDiscussionCommentsRelations = relations(projectDiscussionComments, ({one, many}) => ({
	user: one(users, {
		fields: [projectDiscussionComments.authorId],
		references: [users.id]
	}),
	projectDiscussionComment: one(projectDiscussionComments, {
		fields: [projectDiscussionComments.parentCommentId],
		references: [projectDiscussionComments.id],
		relationName: "projectDiscussionComments_parentCommentId_projectDiscussionComments_id"
	}),
	projectDiscussionComments: many(projectDiscussionComments, {
		relationName: "projectDiscussionComments_parentCommentId_projectDiscussionComments_id"
	}),
	projectDiscussion: one(projectDiscussions, {
		fields: [projectDiscussionComments.projectDiscussionId],
		references: [projectDiscussions.id]
	}),
}));

export const projectTeamsRelations = relations(projectTeams, ({one, many}) => ({
	project: one(projects, {
		fields: [projectTeams.projectId],
		references: [projects.id]
	}),
	user_createdById: one(users, {
		fields: [projectTeams.createdById],
		references: [users.id],
		relationName: "projectTeams_createdById_users_id"
	}),
	user_leaderId: one(users, {
		fields: [projectTeams.leaderId],
		references: [users.id],
		relationName: "projectTeams_leaderId_users_id"
	}),
	projectMembers: many(projectMembers),
}));

export const taskAttachmentsRelations = relations(taskAttachments, ({one}) => ({
	task: one(tasks, {
		fields: [taskAttachments.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [taskAttachments.uploadedById],
		references: [users.id]
	}),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	taskAttachments: many(taskAttachments),
	milestone: one(milestones, {
		fields: [tasks.milestoneId],
		references: [milestones.id]
	}),
	user: one(users, {
		fields: [tasks.createdById],
		references: [users.id]
	}),
	project: one(projects, {
		fields: [tasks.projectId],
		references: [projects.id]
	}),
	kanbanColumn: one(kanbanColumns, {
		fields: [tasks.kanbanColumnId],
		references: [kanbanColumns.id]
	}),
	taskComments: many(taskComments),
	taskHistories: many(taskHistory),
	taskLabels: many(taskLabels),
	taskAssignees: many(taskAssignees),
}));

export const milestonesRelations = relations(milestones, ({one, many}) => ({
	project: one(projects, {
		fields: [milestones.projectId],
		references: [projects.id]
	}),
	tasks: many(tasks),
}));

export const kanbanColumnsRelations = relations(kanbanColumns, ({many}) => ({
	tasks: many(tasks),
	projectKanbanColumns: many(projectKanbanColumns),
}));

export const taskCommentsRelations = relations(taskComments, ({one, many}) => ({
	task: one(tasks, {
		fields: [taskComments.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [taskComments.authorId],
		references: [users.id]
	}),
	taskComment: one(taskComments, {
		fields: [taskComments.parentCommentId],
		references: [taskComments.id],
		relationName: "taskComments_parentCommentId_taskComments_id"
	}),
	taskComments: many(taskComments, {
		relationName: "taskComments_parentCommentId_taskComments_id"
	}),
}));

export const taskHistoryRelations = relations(taskHistory, ({one}) => ({
	task: one(tasks, {
		fields: [taskHistory.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [taskHistory.changedBy],
		references: [users.id]
	}),
}));

export const taskLabelsRelations = relations(taskLabels, ({one}) => ({
	task: one(tasks, {
		fields: [taskLabels.taskId],
		references: [tasks.id]
	}),
	label: one(labels, {
		fields: [taskLabels.labelId],
		references: [labels.id]
	}),
}));

export const labelsRelations = relations(labels, ({many}) => ({
	taskLabels: many(taskLabels),
}));

export const taskAssigneesRelations = relations(taskAssignees, ({one}) => ({
	user_assignedById: one(users, {
		fields: [taskAssignees.assignedById],
		references: [users.id],
		relationName: "taskAssignees_assignedById_users_id"
	}),
	task: one(tasks, {
		fields: [taskAssignees.taskId],
		references: [tasks.id]
	}),
	user_assigneeId: one(users, {
		fields: [taskAssignees.assigneeId],
		references: [users.id],
		relationName: "taskAssignees_assigneeId_users_id"
	}),
}));

export const projectMembersRelations = relations(projectMembers, ({one}) => ({
	user: one(users, {
		fields: [projectMembers.userId],
		references: [users.id]
	}),
	project: one(projects, {
		fields: [projectMembers.projectId],
		references: [projects.id]
	}),
	projectTeam: one(projectTeams, {
		fields: [projectMembers.projectTeamId],
		references: [projectTeams.id]
	}),
}));

export const projectKanbanColumnsRelations = relations(projectKanbanColumns, ({one}) => ({
	kanbanColumn: one(kanbanColumns, {
		fields: [projectKanbanColumns.kanbanColumnId],
		references: [kanbanColumns.id]
	}),
	project: one(projects, {
		fields: [projectKanbanColumns.projectId],
		references: [projects.id]
	}),
}));