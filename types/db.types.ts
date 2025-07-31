/*  == INFERRED TYPES FROM DB SCHEMA == */

import { project, task, taskComment, team, user } from '@/lib/db/schema';

export type SelectProject = typeof project.$inferSelect;
export type InsertProject = typeof project.$inferInsert;
export type UpdateProject = Partial<typeof project.$inferInsert>;

export type InsertTaskComment = typeof taskComment.$inferInsert;
export type SelectTaskComment = typeof taskComment.$inferSelect;
export type UpdateTaskComment = Partial<typeof taskComment.$inferInsert>;

export type SelectTeam = typeof team.$inferSelect;
export type InsertTeam = typeof team.$inferInsert;
export type UpdateTeam = Partial<typeof team.$inferInsert>;

export type InsertTask = typeof task.$inferInsert;
export type UpdateTask = Partial<typeof task.$inferInsert>;

export type SelectUser = typeof user.$inferSelect;
export type InsertUser = typeof user.$inferInsert;
export type UpdateUser = Partial<typeof user.$inferInsert>;
