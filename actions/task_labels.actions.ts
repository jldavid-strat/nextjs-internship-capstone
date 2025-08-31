import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { db, DBTransaction } from '@/lib/db/connect_db';
import { taskLabels } from '@/lib/db/schema/schema';
import { checkMemberPermission } from '@/lib/queries/permssions.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import { getErrorMessage } from '@/lib/utils/error.utils';
import { AddTaskLabelSchema } from '@/lib/validations/task.validations';
import { Label, Project, Task } from '@/types/db.types';
import { ActionResult } from '@/types/types';

export async function addTaskLabels(
  taskId: Task['id'],
  projectId: Project['id'],
  taskLabelIds: Array<Label['id']>,
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

    if (!isAuthorize) throw new Error('User is not authorized to assign tasks ');

    const validatedData = AddTaskLabelSchema.parse({
      labels: taskLabelIds,
    });

    // transform assignee for multiple db insertion
    const toInsert = validatedData.labels.map((labelId) => ({
      taskId: taskId,
      labelId: labelId,
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
