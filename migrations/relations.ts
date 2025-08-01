import { relations } from 'drizzle-orm/relations';
import {
  projects,
  milestones,
  projectDiscussions,
  users,
  projectTeams,
  projectDiscussionComments,
  tasks,
  taskHistory,
  taskComments,
  kanbanColumns,
  taskAttachments,
  taskLabels,
  labels,
  taskAssignees,
  projectMembers,
} from './schema';

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  project: one(projects, {
    fields: [milestones.projectId],
    references: [projects.id],
  }),
  tasks: many(tasks),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  milestones: many(milestones),
  projectDiscussions: many(projectDiscussions),
  user_statusChangedBy: one(users, {
    fields: [projects.statusChangedBy],
    references: [users.id],
    relationName: 'projects_statusChangedBy_users_id',
  }),
  user_ownerId: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
    relationName: 'projects_ownerId_users_id',
  }),
  projectTeams: many(projectTeams),
  tasks: many(tasks),
  kanbanColumns: many(kanbanColumns),
  projectMembers: many(projectMembers),
}));

export const projectDiscussionsRelations = relations(
  projectDiscussions,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [projectDiscussions.projectId],
      references: [projects.id],
    }),
    user: one(users, {
      fields: [projectDiscussions.createdBy],
      references: [users.id],
    }),
    projectDiscussionComments: many(projectDiscussionComments),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  projectDiscussions: many(projectDiscussions),
  projects_statusChangedBy: many(projects, {
    relationName: 'projects_statusChangedBy_users_id',
  }),
  projects_ownerId: many(projects, {
    relationName: 'projects_ownerId_users_id',
  }),
  projectTeams: many(projectTeams),
  projectDiscussionComments: many(projectDiscussionComments),
  taskHistories: many(taskHistory),
  taskComments: many(taskComments),
  taskAttachments: many(taskAttachments),
  taskAssignees: many(taskAssignees),
  projectMembers: many(projectMembers),
}));

export const projectTeamsRelations = relations(projectTeams, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectTeams.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectTeams.createdById],
    references: [users.id],
  }),
  projectMembers: many(projectMembers),
}));

export const projectDiscussionCommentsRelations = relations(
  projectDiscussionComments,
  ({ one, many }) => ({
    user: one(users, {
      fields: [projectDiscussionComments.authorId],
      references: [users.id],
    }),
    projectDiscussion: one(projectDiscussions, {
      fields: [projectDiscussionComments.projectDiscussionId],
      references: [projectDiscussions.id],
    }),
    projectDiscussionComment: one(projectDiscussionComments, {
      fields: [projectDiscussionComments.parentCommentId],
      references: [projectDiscussionComments.id],
      relationName:
        'projectDiscussionComments_parentCommentId_projectDiscussionComments_id',
    }),
    projectDiscussionComments: many(projectDiscussionComments, {
      relationName:
        'projectDiscussionComments_parentCommentId_projectDiscussionComments_id',
    }),
  }),
);

export const taskHistoryRelations = relations(taskHistory, ({ one }) => ({
  task: one(tasks, {
    fields: [taskHistory.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskHistory.changedBy],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  taskHistories: many(taskHistory),
  taskComments: many(taskComments),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  kanbanColumn: one(kanbanColumns, {
    fields: [tasks.kanbanColumnId],
    references: [kanbanColumns.id],
  }),
  milestone: one(milestones, {
    fields: [tasks.milestoneId],
    references: [milestones.id],
  }),
  taskAttachments: many(taskAttachments),
  taskLabels: many(taskLabels),
  taskAssignees: many(taskAssignees),
}));

export const taskCommentsRelations = relations(taskComments, ({ one, many }) => ({
  task: one(tasks, {
    fields: [taskComments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskComments.authorId],
    references: [users.id],
  }),
  taskComment: one(taskComments, {
    fields: [taskComments.parentCommentId],
    references: [taskComments.id],
    relationName: 'taskComments_parentCommentId_taskComments_id',
  }),
  taskComments: many(taskComments, {
    relationName: 'taskComments_parentCommentId_taskComments_id',
  }),
}));

export const kanbanColumnsRelations = relations(kanbanColumns, ({ one, many }) => ({
  tasks: many(tasks),
  project: one(projects, {
    fields: [kanbanColumns.projectId],
    references: [projects.id],
  }),
}));

export const taskAttachmentsRelations = relations(taskAttachments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAttachments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskAttachments.uploadedById],
    references: [users.id],
  }),
}));

export const taskLabelsRelations = relations(taskLabels, ({ one }) => ({
  task: one(tasks, {
    fields: [taskLabels.taskId],
    references: [tasks.id],
  }),
  label: one(labels, {
    fields: [taskLabels.labelId],
    references: [labels.id],
  }),
}));

export const labelsRelations = relations(labels, ({ many }) => ({
  taskLabels: many(taskLabels),
}));

export const taskAssigneesRelations = relations(taskAssignees, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAssignees.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskAssignees.assigneeId],
    references: [users.id],
  }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  projectTeam: one(projectTeams, {
    fields: [projectMembers.projectTeamId],
    references: [projectTeams.id],
  }),
}));
