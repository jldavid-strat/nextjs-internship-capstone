import { DatabaseOperationError } from '@/constants/error';
import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { db, DBTransaction } from '@/lib/db/connect_db';
import { taskLabels } from '@/lib/db/schema/schema';
import { checkMemberPermission } from '@/lib/queries/permssions.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import { getErrorMessage } from '@/lib/utils/error.utils';
import { TaskLabelSchema } from '@/lib/validations/task.validations';
import { Project, ProjectLabel, Task } from '@/types/db.types';
import { ActionResult } from '@/types/types';
import { and, eq, notInArray } from 'drizzle-orm';

export async function addTaskLabels(
  taskId: Task['id'],
  projectId: Project['id'],
  taskLabelIds: Array<ProjectLabel['id']>,
  dbTransaction?: DBTransaction,
): Promise<ActionResult> {
  try {
    const dbContext = dbTransaction ?? db;
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.TASK_LABELS,
      ACTIONS.CREATE,
    );

    if (!isAuthorize) throw new Error('User is not authorized to add task labels');

    const validatedData = TaskLabelSchema.parse({
      labels: taskLabelIds,
    });

    // transform assignee for multiple db insertion
    const toInsert = validatedData.labels.map((projectLabelId) => ({
      taskId: taskId,
      projectLabelId: projectLabelId,
    }));

    console.info(toInsert);

    await dbContext.insert(taskLabels).values(toInsert);
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function updateTaskLabels(
  taskId: Task['id'],
  projectId: Project['id'],
  taskLabelIds: Array<ProjectLabel['id']>,
): Promise<ActionResult> {
  try {
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.TASK_LABELS,
      ACTIONS.UPDATE,
    );

    if (!isAuthorize) throw new Error('User is not authorized to update tasks ');

    const transactionResult = await db.transaction(async (tx) => {
      // insert new labels (ignore conflicts on existing pairs)
      if (taskLabelIds.length > 0) {
        const validatedData = TaskLabelSchema.parse({
          labels: taskLabelIds,
        });

        await tx
          .insert(taskLabels)
          .values(
            validatedData.labels.map((projectLabelId) => ({
              taskId: taskId,
              projectLabelId: projectLabelId,
            })),
          )
          .onConflictDoNothing();
      }

      // delete labels not in the new set
      await tx
        .delete(taskLabels)
        .where(
          and(eq(taskLabels.taskId, taskId), notInArray(taskLabels.projectLabelId, taskLabelIds)),
        );

      return {
        success: true,
      };
    });
    if (!transactionResult.success)
      throw new DatabaseOperationError('Failed to update task labels');
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
