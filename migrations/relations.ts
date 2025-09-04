import { relations } from "drizzle-orm/relations";
import { labels, projectLabels, projects, users, projectMemberInviation, kanbanColumns, projectKanbanColumns, projectDiscussions, projectDiscussionComments, projectTeams, tasks, taskAttachments, milestones, taskComments, taskHistory, taskLabels, taskAssignees, projectMembers } from "./schema";

export const projectLabelsRelations = relations(projectLabels, ({one, many}) => ({
	label: one(labels, {
		fields: [projectLabels.labelId],
		references: [labels.id]
	}),
	project: one(projects, {
		fields: [projectLabels.projectId],
		references: [projects.id]
	}),
	taskLabels: many(taskLabels),
}));

export const labelsRelations = relations(labels, ({many}) => ({
	projectLabels: many(projectLabels),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	projectLabels: many(projectLabels),
	projectMemberInviations: many(projectMemberInviation),
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
	projectKanbanColumns: many(projectKanbanColumns),
	projectDiscussions: many(projectDiscussions),
	projectTeams: many(projectTeams),
	tasks: many(tasks),
	milestones: many(milestones),
	projectMembers: many(projectMembers),
}));

export const projectMemberInviationRelations = relations(projectMemberInviation, ({one}) => ({
	user: one(users, {
		fields: [projectMemberInviation.inviteeId],
		references: [users.id]
	}),
	project: one(projects, {
		fields: [projectMemberInviation.projectId],
		references: [projects.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	projectMemberInviations: many(projectMemberInviation),
	projects_ownerId: many(projects, {
		relationName: "projects_ownerId_users_id"
	}),
	projects_statusChangedById: many(projects, {
		relationName: "projects_statusChangedById_users_id"
	}),
	projectDiscussions: many(projectDiscussions),
	projectDiscussionComments: many(projectDiscussionComments),
	projectTeams_leaderId: many(projectTeams, {
		relationName: "projectTeams_leaderId_users_id"
	}),
	projectTeams_createdById: many(projectTeams, {
		relationName: "projectTeams_createdById_users_id"
	}),
	taskAttachments: many(taskAttachments),
	tasks: many(tasks),
	taskComments: many(taskComments),
	taskHistories: many(taskHistory),
	taskAssignees_assigneeId: many(taskAssignees, {
		relationName: "taskAssignees_assigneeId_users_id"
	}),
	taskAssignees_assignedById: many(taskAssignees, {
		relationName: "taskAssignees_assignedById_users_id"
	}),
	projectMembers: many(projectMembers),
}));

export const projectKanbanColumnsRelations = relations(projectKanbanColumns, ({one, many}) => ({
	kanbanColumn: one(kanbanColumns, {
		fields: [projectKanbanColumns.kanbanColumnId],
		references: [kanbanColumns.id]
	}),
	project: one(projects, {
		fields: [projectKanbanColumns.projectId],
		references: [projects.id]
	}),
	tasks: many(tasks),
}));

export const kanbanColumnsRelations = relations(kanbanColumns, ({many}) => ({
	projectKanbanColumns: many(projectKanbanColumns),
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
	user_leaderId: one(users, {
		fields: [projectTeams.leaderId],
		references: [users.id],
		relationName: "projectTeams_leaderId_users_id"
	}),
	user_createdById: one(users, {
		fields: [projectTeams.createdById],
		references: [users.id],
		relationName: "projectTeams_createdById_users_id"
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
	project: one(projects, {
		fields: [tasks.projectId],
		references: [projects.id]
	}),
	milestone: one(milestones, {
		fields: [tasks.milestoneId],
		references: [milestones.id]
	}),
	user: one(users, {
		fields: [tasks.createdById],
		references: [users.id]
	}),
	projectKanbanColumn: one(projectKanbanColumns, {
		fields: [tasks.projectKanbanColumnId],
		references: [projectKanbanColumns.id]
	}),
	taskComments: many(taskComments),
	taskHistories: many(taskHistory),
	taskLabels: many(taskLabels),
	taskAssignees: many(taskAssignees),
}));

export const milestonesRelations = relations(milestones, ({one, many}) => ({
	tasks: many(tasks),
	project: one(projects, {
		fields: [milestones.projectId],
		references: [projects.id]
	}),
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
	user: one(users, {
		fields: [taskHistory.changedBy],
		references: [users.id]
	}),
	task: one(tasks, {
		fields: [taskHistory.taskId],
		references: [tasks.id]
	}),
}));

export const taskLabelsRelations = relations(taskLabels, ({one}) => ({
	task: one(tasks, {
		fields: [taskLabels.taskId],
		references: [tasks.id]
	}),
	projectLabel: one(projectLabels, {
		fields: [taskLabels.projectLabelId],
		references: [projectLabels.id]
	}),
}));

export const taskAssigneesRelations = relations(taskAssignees, ({one}) => ({
	task: one(tasks, {
		fields: [taskAssignees.taskId],
		references: [tasks.id]
	}),
	user_assigneeId: one(users, {
		fields: [taskAssignees.assigneeId],
		references: [users.id],
		relationName: "taskAssignees_assigneeId_users_id"
	}),
	user_assignedById: one(users, {
		fields: [taskAssignees.assignedById],
		references: [users.id],
		relationName: "taskAssignees_assignedById_users_id"
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