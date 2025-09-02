'use server';
import { ActionResult, QueryResult } from '@/types/types';
import { db } from '@/lib/db/connect_db';
import { taskComments } from '@/lib/db/schema/schema';
import { eq } from 'drizzle-orm';
import { TaskComment, Project, Task, TaskCommentQuery } from '@/types/db.types';
import { getErrorMessage } from '@/lib/utils/error.utils';
import { checkMemberPermission } from '@/lib/queries/permssions.queries';
import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { UnauthorizedError } from '@/constants/error';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import { TaskCommentSchema } from '@/lib/validations/task.validations';
import { users } from '@/migrations/schema';

export async function addTaskComment(
  taskId: Task['id'],
  projectId: Project['id'],
  previosState: unknown,
  taskCommentData: FormData,
): Promise<ActionResult> {
  try {
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.TASK_COMMENTS,
      ACTIONS.CREATE,
    );

    if (!isAuthorize) throw new UnauthorizedError('User is unauthorized to add task comments');

    const validatedData = TaskCommentSchema.parse({
      content: taskCommentData.get('content') as string,
      projectId: projectId,
      taskId: taskId,
      authorId: currentUserId as string,
    });

    await db.insert(taskComments).values({
      ...validatedData,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function updateTaskComment(
  taskId: Task['id'],
  taskCommentId: TaskComment['id'],
  projectId: Project['id'],
  previosState: unknown,
  taskCommentData: FormData,
): Promise<ActionResult> {
  try {
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.TASK_COMMENTS,
      ACTIONS.UPDATE,
    );

    if (!isAuthorize) throw new UnauthorizedError('User is unauthorized to update task comments');

    const validatedData = TaskCommentSchema.parse({
      content: taskCommentData.get('content') as string,
      projectId: projectId,
      taskId: taskId,
      authorId: currentUserId as string,
    });

    await db
      .update(taskComments)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(taskComments.id, taskCommentId));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
export async function deleteTaskComment(taskCommentId: TaskComment['id']): Promise<ActionResult> {
  try {
    await db.delete(taskComments).where(eq(taskComments.id, taskCommentId));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function getTaskComments(
  taskId: Task['id'],
): Promise<QueryResult<TaskCommentQuery[]>> {
  try {
    const taskCommentList = await db
      .select({
        taskCommentId: taskComments.id,
        authorId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        primaryEmailAdress: users.primaryEmailAddress,
        userImgLink: users.imgUrl,
        content: taskComments.content,
        createdAt: taskComments.createdAt,
      })
      .from(taskComments)
      .innerJoin(users, eq(users.id, taskComments.authorId))
      .where(eq(taskComments.taskId, taskId));

    return {
      success: true,
      data: taskCommentList,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
