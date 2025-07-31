import { relations } from 'drizzle-orm';
import * as table from './schema';

// TODO: recheck relationships
export const userRelations = relations(table.users, ({ one, many }) => ({
  jobPosition: one(table.jobPositions, {
    fields: [table.users.jobPositionId],
    references: [table.jobPositions.id],
  }),
  ownedProjects: many(table.projects),
  projectMemberships: many(table.projectMembers),
  teamMemberships: many(table.teamMembers),
  createdTeams: many(table.teams),
  taskAssignments: many(table.taskAssignees),
  taskComments: many(table.taskComments),
  taskHistories: many(table.taskHistory),
}));

export const projectRelations = relations(table.projects, ({ one, many }) => ({
  owner: one(table.users, {
    fields: [table.projects.ownerId],
    references: [table.users.id],
  }),
  statusChanger: one(table.users, {
    fields: [table.projects.statusChangedBy],
    references: [table.users.id],
  }),
  members: many(table.projectMembers),
  teams: many(table.teams),
  tasks: many(table.tasks),
  discussions: many(table.projectDiscussions),
  milestones: many(table.milestones),
  kanbanColumns: many(table.kanbanColumns),
}));

export const projectMemberRelations = relations(table.projectMembers, ({ one }) => ({
  user: one(table.users, {
    fields: [table.projectMembers.userId],
    references: [table.users.id],
  }),
  project: one(table.projects, {
    fields: [table.projectMembers.projectId],
    references: [table.projects.id],
  }),
}));

export const teamRelations = relations(table.teams, ({ one, many }) => ({
  creator: one(table.users, {
    fields: [table.teams.createdBy],
    references: [table.users.id],
  }),
  members: many(table.teamMembers),
}));

export const teamMemberRelations = relations(table.teamMembers, ({ one }) => ({
  user: one(table.users, {
    fields: [table.teamMembers.userId],
    references: [table.users.id],
  }),
  team: one(table.teams, {
    fields: [table.teamMembers.teamId],
    references: [table.teams.id],
  }),
}));

export const taskRelations = relations(table.tasks, ({ one, many }) => ({
  project: one(table.projects, {
    fields: [table.tasks.projectId],
    references: [table.projects.id],
  }),
  kanbanColumn: one(table.kanbanColumns, {
    fields: [table.tasks.kanbanColumnId],
    references: [table.kanbanColumns.id],
  }),
  milestone: one(table.milestones, {
    fields: [table.tasks.milestoneId],
    references: [table.milestones.id],
  }),
  labels: many(table.taskLabels),
  assignees: many(table.taskAssignees),
  comments: many(table.taskComments),
  attachments: many(table.taskAttachments),
  history: many(table.taskHistory),
}));

export const milestoneRelations = relations(table.milestones, ({ one, many }) => ({
  project: one(table.projects, {
    fields: [table.milestones.projectId],
    references: [table.projects.id],
  }),
  tasks: many(table.tasks),
}));

export const kanbanColumnRelations = relations(table.kanbanColumns, ({ one, many }) => ({
  project: one(table.projects, {
    fields: [table.kanbanColumns.projectId],
    references: [table.projects.id],
  }),
  tasks: many(table.tasks),
}));

export const taskLabelRelations = relations(table.taskLabels, ({ one }) => ({
  task: one(table.tasks, {
    fields: [table.taskLabels.taskId],
    references: [table.tasks.id],
  }),
  label: one(table.labels, {
    fields: [table.taskLabels.labelId],
    references: [table.labels.id],
  }),
}));

export const taskAssigneeRelations = relations(table.taskAssignees, ({ one }) => ({
  task: one(table.tasks, {
    fields: [table.taskAssignees.taskId],
    references: [table.tasks.id],
  }),
  assignee: one(table.users, {
    fields: [table.taskAssignees.assigneeId],
    references: [table.users.id],
  }),
}));

export const taskCommentRelations = relations(table.taskComments, ({ one }) => ({
  task: one(table.tasks, {
    fields: [table.taskComments.taskId],
    references: [table.tasks.id],
  }),
  author: one(table.users, {
    fields: [table.taskComments.authorId],
    references: [table.users.id],
  }),
}));

export const taskHistoryRelations = relations(table.taskHistory, ({ one }) => ({
  task: one(table.tasks, {
    fields: [table.taskHistory.taskId],
    references: [table.tasks.id],
  }),
  changedBy: one(table.users, {
    fields: [table.taskHistory.changedBy],
    references: [table.users.id],
  }),
}));
