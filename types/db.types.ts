/*  == INFERRED TYPES FROM DB SCHEMA == */

import {
  projects,
  tasks,
  taskComments,
  users,
  projectKanbanColumns,
  projectMembers,
  projectLabels,
  labels,
  kanbanColumns,
} from '@/lib/db/schema/schema';

export type Project = typeof projects.$inferSelect;
export type CreateProject = typeof projects.$inferInsert;
export type UpdateProject = Partial<typeof projects.$inferInsert>;

export type ProjectMember = typeof projectMembers.$inferSelect;

export type ProjectMemberData = {
  userId: User['id'];
  firstName: User['firstName'];
  lastName: User['lastName'];
  primaryEmailAddress: User['primaryEmailAddress'];
  userImgLink: User['imgLink'];
  role: ProjectMember['role'];
  joinedAt: ProjectMember['joinedAt'];
};

export type TaskComment = typeof taskComments.$inferSelect;
export type CreateTaskComment = typeof taskComments.$inferInsert;
export type UpdateTaskComment = Partial<typeof taskComments.$inferInsert>;

export type Task = typeof tasks.$inferSelect;
export type CreateTask = typeof tasks.$inferInsert;
export type UpdateTask = Partial<typeof tasks.$inferInsert>;

export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;
export type UpdateUser = Partial<typeof users.$inferInsert>;

export type KanbanColumn = typeof kanbanColumns.$inferSelect;
export type ProjectKanbanColumn = typeof projectKanbanColumns.$inferSelect;

export type ProjectLabel = typeof projectLabels.$inferSelect;
export type Label = typeof labels.$inferSelect;

export interface ProjectLabelData extends ProjectLabel {
  labelName: Label['name'];
  taskId: Task['id'];
}

export type TaskCommentQuery = {
  taskCommentId: TaskComment['id'];
  authorId: User['id'];
  firstName: User['firstName'];
  lastName: User['lastName'];
  primaryEmailAdress: User['primaryEmailAddress'];
  userImgLink: User['imgLink'];
  content: TaskComment['content'];
  createdAt: TaskComment['createdAt'];
};

export type ProjectLabels = ProjectLabelData;
