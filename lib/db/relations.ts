import { relations } from 'drizzle-orm';
import * as table from './schema';

// TODO: Task 3.1 recheck relationships
export const userRelations = relations(table.user, ({ one, many }) => ({
  jobPosition: one(table.jobPosition, {
    fields: [table.user.jobPositionId],
    references: [table.jobPosition.id],
  }),
  ownedProjects: many(table.project),
  projectMemberships: many(table.projectMember),
  teamMemberships: many(table.teamMember),
  createdTeams: many(table.team),
  taskAssignments: many(table.taskAssignee),
  taskComments: many(table.taskComment),
  taskHistories: many(table.taskHistory),
}));

export const projectRelations = relations(table.project, ({ one, many }) => ({
  owner: one(table.user, {
    fields: [table.project.ownerId],
    references: [table.user.id],
  }),
  statusChanger: one(table.user, {
    fields: [table.project.statusChangedBy],
    references: [table.user.id],
  }),
  members: many(table.projectMember),
  teams: many(table.team),
  tasks: many(table.task),
  discussions: many(table.projectDiscussion),
  milestones: many(table.milestone),
  kanbanColumns: many(table.kanbanColumn),
}));

export const projectMemberRelations = relations(table.projectMember, ({ one }) => ({
  user: one(table.user, {
    fields: [table.projectMember.userId],
    references: [table.user.id],
  }),
  project: one(table.project, {
    fields: [table.projectMember.projectId],
    references: [table.project.id],
  }),
}));

export const teamRelations = relations(table.team, ({ one, many }) => ({
  project: one(table.project, {
    fields: [table.team.projectId],
    references: [table.project.id],
  }),
  creator: one(table.user, {
    fields: [table.team.createdBy],
    references: [table.user.id],
  }),
  members: many(table.teamMember),
}));

export const teamMemberRelations = relations(table.teamMember, ({ one }) => ({
  user: one(table.user, {
    fields: [table.teamMember.userId],
    references: [table.user.id],
  }),
  team: one(table.team, {
    fields: [table.teamMember.teamId],
    references: [table.team.id],
  }),
}));

export const taskRelations = relations(table.task, ({ one, many }) => ({
  project: one(table.project, {
    fields: [table.task.projectId],
    references: [table.project.id],
  }),
  kanbanColumn: one(table.kanbanColumn, {
    fields: [table.task.kanbanColumnId],
    references: [table.kanbanColumn.id],
  }),
  milestone: one(table.milestone, {
    fields: [table.task.milestoneId],
    references: [table.milestone.id],
  }),
  labels: many(table.taskLabel),
  assignees: many(table.taskAssignee),
  comments: many(table.taskComment),
  attachments: many(table.taskAttachment),
  history: many(table.taskHistory),
}));

export const milestoneRelations = relations(table.milestone, ({ one, many }) => ({
  project: one(table.project, {
    fields: [table.milestone.projectId],
    references: [table.project.id],
  }),
  tasks: many(table.task),
}));

export const kanbanColumnRelations = relations(table.kanbanColumn, ({ one, many }) => ({
  project: one(table.project, {
    fields: [table.kanbanColumn.projectId],
    references: [table.project.id],
  }),
  tasks: many(table.task),
}));

export const taskLabelRelations = relations(table.taskLabel, ({ one }) => ({
  task: one(table.task, {
    fields: [table.taskLabel.taskId],
    references: [table.task.id],
  }),
  label: one(table.label, {
    fields: [table.taskLabel.labelId],
    references: [table.label.id],
  }),
}));

export const taskAssigneeRelations = relations(table.taskAssignee, ({ one }) => ({
  task: one(table.task, {
    fields: [table.taskAssignee.taskId],
    references: [table.task.id],
  }),
  assignee: one(table.user, {
    fields: [table.taskAssignee.assigneeId],
    references: [table.user.id],
  }),
}));

export const taskCommentRelations = relations(table.taskComment, ({ one }) => ({
  task: one(table.task, {
    fields: [table.taskComment.taskId],
    references: [table.task.id],
  }),
  author: one(table.user, {
    fields: [table.taskComment.authorId],
    references: [table.user.id],
  }),
}));

export const taskHistoryRelations = relations(table.taskHistory, ({ one }) => ({
  task: one(table.task, {
    fields: [table.taskHistory.taskId],
    references: [table.task.id],
  }),
  changedBy: one(table.user, {
    fields: [table.taskHistory.changedBy],
    references: [table.user.id],
  }),
}));
