/*  == INFERRED TYPES FROM DB SCHEMA == */

import { projects, tasks, taskComments, teams, users } from '@/lib/db/schema';

export type Project = typeof projects.$inferSelect;
export type CreateProject = typeof projects.$inferInsert;
export type UpdateProject = Partial<typeof projects.$inferInsert>;

export type TaskComment = typeof taskComments.$inferSelect;
export type CreateTaskComment = typeof taskComments.$inferInsert;
export type UpdateTaskComment = Partial<typeof taskComments.$inferInsert>;

export type Team = typeof teams.$inferSelect;
export type CreateTeam = typeof teams.$inferInsert;
export type UpdateTeam = Partial<typeof teams.$inferInsert>;

export type Task = typeof tasks.$inferSelect;
export type CreateTask = typeof tasks.$inferInsert;
export type UpdateTask = Partial<typeof tasks.$inferInsert>;

export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;
export type UpdateUser = Partial<typeof users.$inferInsert>;
