import { relations } from 'drizzle-orm';
import * as table from './schema';

// TODO: Task 3.1 recheck relationships
export const userRelations = relations(table.user, ({ one, many }) => ({
  jobPosition: one(table.jobPosition, {
    fields: [table.user.jobPositionId],
    references: [table.jobPosition.id],
  }),
  teamMemberships: many(table.teamMember),
}));

export const teamRelations = relations(table.team, ({ many }) => ({
  members: many(table.teamMember),
  projects: many(table.project),
}));

export const teamMemberRelations = relations(table.teamMember, ({ one, many }) => ({
  user: one(table.user, {
    fields: [table.teamMember.memberId],
    references: [table.user.id],
  }),
  team: one(table.team, {
    fields: [table.teamMember.teamId],
    references: [table.team.id],
  }),
  role: one(table.memberRole, {
    fields: [table.teamMember.memberRoleId],
    references: [table.memberRole.id],
  }),
  assignedTasks: many(table.taskAssignee),
  taskComments: many(table.taskComment),
  taskHistoryEntries: many(table.taskHistory),
}));

export const projectRelations = relations(table.project, ({ one, many }) => ({
  team: one(table.team, {
    fields: [table.project.teamId],
    references: [table.team.id],
  }),
  tasks: many(table.task),
  columnLists: many(table.columnList),
  milestones: many(table.milestone),
}));

export const taskRelations = relations(table.task, ({ one, many }) => ({
  project: one(table.project, {
    fields: [table.task.projectId],
    references: [table.project.id],
  }),
  labels: many(table.taskLabel),
  assignees: many(table.taskAssignee),
  comments: many(table.taskComment),
  attachments: many(table.taskAttachment),
  historyEntries: many(table.taskHistory),
  columnPositions: many(table.columnTaskList),
}));

export const labelRelations = relations(table.label, ({ many }) => ({
  tasks: many(table.taskLabel),
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
  assignee: one(table.teamMember, {
    fields: [table.taskAssignee.assigneeId],
    references: [table.teamMember.memberId],
  }),
}));

export const columnListRelations = relations(table.columnList, ({ one, many }) => ({
  project: one(table.project, {
    fields: [table.columnList.projectId],
    references: [table.project.id],
  }),
  tasks: many(table.columnTaskList),
}));
