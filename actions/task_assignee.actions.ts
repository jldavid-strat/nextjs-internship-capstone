import { DatabaseOperationError } from '@/constants/error';
import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { db, DBTransaction } from '@/lib/db/connect_db';
import { taskAssignees } from '@/lib/db/schema/schema';
import { checkMemberPermission } from '@/lib/queries/permssions.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import { getErrorMessage } from '@/lib/utils/error.utils';
import { AssignTaskSchema } from '@/lib/validations/task.validations';
import { Project, Task, User } from '@/types/db.types';
import { ActionResult, TaskAssignee } from '@/types/types';
import { and, eq, notInArray } from 'drizzle-orm';

export async function assignTask(
  taskId: Task['id'],
  projectId: Project['id'],
  assignees: Array<User['id']>,
  dbTransaction?: DBTransaction,
): Promise<ActionResult> {
  try {
    const dbContext = dbTransaction ?? db;
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.TASKS,
      ACTIONS.ASSIGN,
    );

    if (!isAuthorize) throw new Error('User is not authorized to assign tasks ');

    const validatedData = AssignTaskSchema.parse({
      assignees: assignees,
    });

    // transform assignee for multiple db insertion
    const toInsert = validatedData.assignees.map((a) => ({
      taskId: taskId,
      assigneeId: a,
      assignedById: currentUserId,
    }));

    // console.info('toInsert', toInsert);

    await dbContext.insert(taskAssignees).values(toInsert);
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

export async function updateTaskAssignees(
  taskId: Task['id'],
  projectId: Project['id'],
  taskAssigneeIds: Array<User['id']>,
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
      if (taskAssigneeIds.length > 0) {
        const validatedData = AssignTaskSchema.parse({
          assignees: taskAssigneeIds,
        });

        await tx
          .insert(taskAssignees)
          .values(
            validatedData.assignees.map((userId) => ({
              taskId: taskId,
              assigneeId: userId,
              assignedById: currentUserId,
            })),
          )
          .onConflictDoNothing();
      }

      // delete labels not in the new set
      await tx
        .delete(taskAssignees)
        .where(
          and(
            eq(taskAssignees.taskId, taskId),
            notInArray(taskAssignees.assigneeId, taskAssigneeIds),
          ),
        );

      return {
        success: true,
      };
    });
    if (!transactionResult.success)
      throw new DatabaseOperationError('Failed to update task assignees');
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
