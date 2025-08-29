import { relations } from "drizzle-orm/relations";
import { users, projects, projectDiscussionComments, taskAttachments, tasks, taskHistory } from "./schema";

export const projectsRelations = relations(projects, ({one}) => ({
	user: one(users, {
		fields: [projects.statusChangedById],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	projects: many(projects),
	projectDiscussionComments: many(projectDiscussionComments),
	taskAttachments: many(taskAttachments),
}));

export const projectDiscussionCommentsRelations = relations(projectDiscussionComments, ({one}) => ({
	user: one(users, {
		fields: [projectDiscussionComments.authorId],
		references: [users.id]
	}),
}));

export const taskAttachmentsRelations = relations(taskAttachments, ({one}) => ({
	user: one(users, {
		fields: [taskAttachments.uploadedById],
		references: [users.id]
	}),
}));

export const taskHistoryRelations = relations(taskHistory, ({one}) => ({
	task: one(tasks, {
		fields: [taskHistory.taskId],
		references: [tasks.id]
	}),
}));

export const tasksRelations = relations(tasks, ({many}) => ({
	taskHistories: many(taskHistory),
}));