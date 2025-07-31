import { queryResult } from '@/types';
import { db } from '../db/connect_db';
import { taskComment } from '../db/schema';
import { eq } from 'drizzle-orm';

type InsertTaskComment = typeof taskComment.$inferInsert;
type UpdateTaskComment = typeof taskComment.$inferInsert;

export async function createTask(
  taskCommentData: InsertTaskComment,
): Promise<queryResult> {
  try {
    await db.insert(taskComment).values({
      authorId: taskCommentData.authorId,
      taskId: taskCommentData.taskId,
      content: taskCommentData.content,
      createdAt: new Date(),
    });
    return { success: true, message: `Task Comment successfully created` };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create task comment. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}

export async function updateTaskComment(
  taskCommentId: number,
  taskCommentData: UpdateTaskComment,
): Promise<queryResult> {
  try {
    await db
      .update(taskComment)
      .set({
        content: taskCommentData.content,
        updatedAt: new Date(),
      })
      .where(eq(taskComment.id, taskCommentId));

    return { success: true, message: `Task comment successfully updated` };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update task comment. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}
