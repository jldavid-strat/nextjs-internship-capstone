/*  == INFERRED TYPES FROM DB SCHEMA == */

import { project, task, taskComment, team, user } from '@/lib/db/schema';

export type Project = typeof project.$inferSelect;
export type CreateProject = typeof project.$inferInsert;
export type UpdateProject = Partial<typeof project.$inferInsert>;

export type TaskComment = typeof taskComment.$inferSelect;
export type CreateTaskComment = typeof taskComment.$inferInsert;
export type UpdateTaskComment = Partial<typeof taskComment.$inferInsert>;

export type Team = typeof team.$inferSelect;
export type CreateTeam = typeof team.$inferInsert;
export type UpdateTeam = Partial<typeof team.$inferInsert>;

export type Task = typeof task.$inferSelect;
export type CreateTask = typeof task.$inferInsert;
export type UpdateTask = Partial<typeof task.$inferInsert>;

export type User = typeof user.$inferSelect;
export type CreateUser = typeof user.$inferInsert;
export type UpdateUser = Partial<typeof user.$inferInsert>;
