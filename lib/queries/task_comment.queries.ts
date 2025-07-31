import { queryResult } from '@/types';
import { db } from '../db/connect_db';
import { tasks, taskComments, taskLabels } from '../db/schema';
import { eq } from 'drizzle-orm';
import { TaskComment, CreateTaskComment, UpdateTaskComment } from '@/types/db.types';

export async function createTask(
  taskCommentData: CreateTaskComment,
): Promise<queryResult> {
  try {
    await db.insert(taskComments).values({
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
  taskCommentId: TaskComment['id'],
  taskCommentData: UpdateTaskComment,
): Promise<queryResult> {
  try {
    await db
      .update(taskComments)
      .set({
        content: taskCommentData.content,
        updatedAt: new Date(),
      })
      .where(eq(taskComments.id, taskCommentId));

    return { success: true, message: `Task comment successfully updated` };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update task comment`,
      error: JSON.stringify(error),
    };
  }
}
export async function deleteTaskComment(
  taskCommentId: TaskComment['id'],
): Promise<queryResult> {
  try {
    await db.delete(taskComments).where(eq(taskComments.id, taskCommentId));

    return { success: true, message: `Task comment successfully deleted` };
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete task comment`,
      error: JSON.stringify(error),
    };
  }
}

// TODO: retrieve all comments from a specific task
// export async function getTaskComments(
//   taskId: SelectTask['id'],
//   taskCommentId: SelectTaskComment['id'],
// ): Promise<queryResult<SelectTaskComment[]>> {
//   try {
//     // const taskComments = await db
//     //   .select()
//     //   .from(taskComment)
//     //   .innerJoin(task, eq(taskId, taskCommentId))
//     //   .where(eq());
//     const taskComments = await db.query.task.findMany({
//       where: eq(task.id, taskId),
//       with: {
//         taskComment: {
//           where: (taskComment, { eq }) => eq(taskComment., taskCommentId),
//         },
//       },
//     });

//     return {
//       success: true,
//       message: `Task comment successfully retrieved`,
//       data: taskComments,
//     };
//   } catch (error) {
//     return {
//       success: false,
//       message: `Failed to delete task comment`,
//       error: JSON.stringify(error),
//     };
//   }
// }
