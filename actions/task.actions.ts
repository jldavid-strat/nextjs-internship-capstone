'use server';
import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { db } from '@/lib/db/connect_db';
import { tasks } from '@/lib/db/schema/schema';
import { checkMemberPermission } from '@/lib/queries/permssions.queries';
import { getMaxNumPositionByColumnId, getTaskById } from '@/lib/queries/task.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import getDataDiff from '@/lib/utils/data_diff';
import { EditTaskInfoSchema, InsertTaskSchema } from '@/lib/validations/task.validations';
import { MoveTaskDataType, ActionResult } from '@/types/types';
import { Project, ProjectLabel, Task, User } from '@/types/db.types';
import { and, eq, inArray, sql, SQL } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCompletedColumnId, getProjectColumnByName } from '@/lib/queries/kanban_column.queries';
import { serverEvents } from '@/lib/events/event-emitter';
import { CreateTaskProps } from '@/components/forms/add-task-modal-form';
import { DatabaseOperationError, UnauthorizedError } from '@/constants/error';
import { getErrorMessage } from '@/lib/utils/error.utils';
import { addTaskLabels, updateTaskLabels } from './task_labels.actions';
import { assignTask, updateTaskAssignees } from './task_assignee.actions';
import { getTaskLabels } from '@/lib/queries/task-label.queries';

export async function createTask(
  kanbanData: CreateTaskProps,
  previousState: unknown,
  taskData: FormData,
): Promise<ActionResult> {
  try {
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      kanbanData.projectId,
      RESOURCES.TASKS,
      ACTIONS.CREATE,
    );

    const { projectId, kanbanName, projectColumnId } = kanbanData;

    if (!isAuthorize) throw new UnauthorizedError('User is unauthorized to create task');

    const transactionResult = await db.transaction(async (tx) => {
      // get the actual kanban column by status

      // default to null if empty
      const currentMaxPosition =
        (await getMaxNumPositionByColumnId(kanbanData.projectColumnId, kanbanData.projectId, tx)) ??
        null;

      // default position to zero if empty
      let position = 0;

      // increment position if not empty
      if (currentMaxPosition !== null) position = currentMaxPosition + 1;

      const startDateString = taskData.get('startDate') || null;
      const dueDateString = taskData.get('dueDate') || null;

      const taskLabelIds = JSON.parse(taskData.get('labels') as string) as ProjectLabel['id'][];
      const taskAssigneeIds = JSON.parse(taskData.get('assignees') as string) as User['id'][];

      const isNotAssigned = taskAssigneeIds.length === 0;
      const hasLabels = taskLabelIds.length === 0;

      const validatedData = InsertTaskSchema.parse({
        title: taskData.get('title') as string,
        description: taskData.get('description') as string,
        detail: taskData.get('detail') as string,
        priority: taskData.get('priority') as string,
        position: position,

        // only set true if task is in 'completed' column
        isCompleted: kanbanData.kanbanName.toLowerCase() === 'completed' ? true : false,

        // enforce to be null for now
        milestoneId: null,
        status: kanbanName as string,
        projectKanbanColumnId: projectColumnId,
        projectId: projectId as string,
        createdById: currentUserId as string,
        startDate: startDateString,
        dueDate: dueDateString,
      });

      console.log('taskLabelIds', taskLabelIds);
      console.log('taskAssigneeIds', taskAssigneeIds);
      console.log('validatedData', validatedData);

      const [newTask] = await db
        .insert(tasks)
        .values({
          ...validatedData,
          isNotAssigned: isNotAssigned,
          projectkanbanColumnId: projectColumnId,
        })
        .returning({ taskId: tasks.id });

      if (hasLabels) {
        // add labels
        console.log('add labels');
        await addTaskLabels(newTask.taskId, projectId, taskLabelIds, tx);
      }

      if (!isNotAssigned) {
        console.log('add assginees');
        // assign task to members
        await assignTask(newTask.taskId, projectId, taskAssigneeIds, tx);
      }

      revalidatePath(`/projects/${projectId}`);
      return { success: true };
    });

    if (!transactionResult.success) throw new DatabaseOperationError('Failed to add task');
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function updateTaskInfo(
  queryIds: { taskId: Task['id']; projectId: Project['id'] },
  previousState: unknown,
  taskData: FormData,
): Promise<ActionResult> {
  try {
    const currentUserId = await getCurrentUserId();

    // TODO consider if user is the task creator
    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      queryIds.projectId,
      RESOURCES.TASKS,
      ACTIONS.UPDATE,
    );

    if (!isAuthorize) throw new Error('User is unauthorized to update task info');
    const { success, data: currentTask } = await getTaskById(queryIds.taskId);

    console.log(currentTask);
    if (!success || !currentTask) {
      throw new Error('Something went wrong, Please try again');
    }

    const startDateString = taskData.get('startDate') || null;
    const dueDateString = taskData.get('dueDate') || null;

    const taskLabelIds = JSON.parse(taskData.get('labels') as string) as ProjectLabel['id'][];
    const taskAssigneeIds = JSON.parse(taskData.get('assignees') as string) as User['id'][];

    console.log('taskLabelIds', taskLabelIds);
    console.log('taskAssigneeIds', taskAssigneeIds);

    const isNotAssigned = taskAssigneeIds.length === 0;

    const originalProjectColumn = await getProjectColumnByName(
      queryIds.projectId,
      currentTask.status,
    );

    if (!originalProjectColumn) throw new Error('Something went wrong, Please try again');

    const originalTaskData = {
      title: currentTask.title as string,
      description: currentTask.description as string,
      detail: currentTask.detail as string,
      priority: currentTask.priority as string,
      startDate: currentTask.startDate as string,
      status: currentTask.status as string,
      dueDate: currentTask.dueDate as string,
    };

    const currentTaskData = {
      title: taskData.get('title') as string,
      description: taskData.get('description') as string,
      detail: taskData.get('detail') as string,
      priority: taskData.get('priority') as string,
      status: taskData.get('status') as string,
      startDate: startDateString as string,
      dueDate: dueDateString as string,
    };

    const changes = getDataDiff(originalTaskData, currentTaskData);

    console.log('changes', changes);

    // dont throw error for now
    if (changes === null) console.info('[UPDATING TASK]: No changes made');

    const validatedData = EditTaskInfoSchema.parse({
      ...currentTaskData,
    });

    let newKanbanName = validatedData.status.toLowerCase();

    console.log('validatedData', validatedData);

    // if status is changed move the task the new column
    if (changes?.status) {
      console.log('moving task to new column...');
      const targetProjectColumn = await getProjectColumnByName(
        queryIds.projectId,
        validatedData.status,
      );

      if (!targetProjectColumn) {
        throw new Error('Something went wrong, Please try again');
      }

      await moveTask({
        taskId: queryIds.taskId,
        sourceColumnId: originalProjectColumn.projectColumnId,
        targetColumnId: targetProjectColumn.projectColumnId,
        projectId: queryIds.projectId,
        newPosition: 0,
      });

      newKanbanName = targetProjectColumn.name;
    }

    console.log('updating task labels...');

    const { success: isUpdateLabelSuccess } = await updateTaskLabels(
      queryIds.taskId,
      queryIds.projectId,
      taskLabelIds,
    );

    if (!isUpdateLabelSuccess) throw new DatabaseOperationError('Failed to update task');

    console.log('updating task assignees...');

    const { success: isUpdateAssigneeSuccess } = await updateTaskAssignees(
      queryIds.taskId,
      queryIds.projectId,
      taskAssigneeIds,
    );

    if (!isUpdateAssigneeSuccess) throw new DatabaseOperationError('Failed to update task');

    console.log('updating task...');
    await db
      .update(tasks)
      .set({
        ...validatedData,
        isCompleted: newKanbanName === 'complteted',
        isNotAssigned: isNotAssigned,
      })
      .where(and(eq(tasks.id, queryIds.taskId), eq(tasks.projectId, queryIds.projectId)));

    console.log('updated task successfully...');
    // revalidatePath(`/(dashboard)`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// export async function deleteTask(taskId: Task['id']): Promise<QueryResult> {
//   try {
//     await db.delete(tasks).where(eq(tasks.id, taskId));

//     // TODO: also delete the records of team in teamMember

//     return { success: true, message: `Task successfully deleted`, data: undefined };
//   } catch (error) {
//     return {
//       success: false,
//       message: `Failed to delete task. Error ${error}`,
//       error: JSON.stringify(error),
//     };
//   }
// }

// moves task to another column
// TODO add validations

export async function moveTask(moveTaskData: MoveTaskDataType) {
  try {
    const { taskId, sourceColumnId, targetColumnId, projectId, newPosition } = moveTaskData;

    // retrieve tasks that need position updates
    const affectedTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.projectId, projectId),
          inArray(tasks.projectkanbanColumnId, [sourceColumnId, targetColumnId]),
        ),
      );

    // get new positions for all affected tasks
    const positionUpdates = getNewTaskPositions(affectedTasks, moveTaskData);

    if (!positionUpdates) throw new Error('Something went wrong. Please try again');

    // a way to update multiple rows with different values
    // retrieved from: https://orm.drizzle.team/docs/guides/update-many-with-different-value
    const taskSqlChunks: SQL[] = [];
    const taskIds: Array<Task['id']> = [];

    taskSqlChunks.push(sql`(case`);
    for (const update of positionUpdates) {
      taskSqlChunks.push(sql`when ${tasks.id} = ${update?.taskId} then ${update?.newTaskPosition}`);
      taskIds.push(update.taskId);
    }
    taskSqlChunks.push(sql`else ${tasks.position}`);
    taskSqlChunks.push(sql`end)`);

    const TaskPositionCaseSql: SQL = sql.join(taskSqlChunks, sql.raw(' '));

    // if task is moved to another column
    if (sourceColumnId !== targetColumnId) {
      const completedColumnId = await getCompletedColumnId(projectId);
      const updateKanbanColumnCase = sql`case 
      when ${tasks.id} = ${taskId} then ${targetColumnId} 
      else ${tasks.projectkanbanColumnId} 
    end`;
      // update task position and kanban column id
      await db
        .update(tasks)
        .set({
          position: TaskPositionCaseSql,
          // only update the kanban column of moved task
          projectkanbanColumnId: updateKanbanColumnCase,
          isCompleted: targetColumnId === completedColumnId,
          updatedAt: new Date(),
        })
        .where(inArray(tasks.id, taskIds));
    }
    // only update task positions
    else {
      await db
        .update(tasks)
        .set({ position: TaskPositionCaseSql })
        .where(inArray(tasks.id, taskIds));
    }
    console.log('emiting task move event');
    // emit event to update task list
    serverEvents.emit('task-moved', {
      type: 'task-moved',
      taskId: taskId,
      sourceColumnId: sourceColumnId,
      targetColumnId: targetColumnId,
      newPosition: newPosition,
      projectId: projectId,
    });
    console.log('task move event triggered');
    return {
      success: true,
      message: 'Task has been move successfully',
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: JSON.stringify(error),
    };
  }
}

function getNewTaskPositions(allTasks: Task[], moveData: MoveTaskDataType) {
  try {
    const { taskId, sourceColumnId, targetColumnId, newPosition } = moveData;

    const taskToMove = allTasks.find((t) => t.id === taskId);
    if (!taskToMove) return [];

    // reorder task in the same column
    if (sourceColumnId === targetColumnId) {
      const columnTasks = allTasks.filter((t) => t.projectkanbanColumnId === sourceColumnId);
      const taskToMove = columnTasks.find((t) => t.id === taskId)!;

      // remove the task from original position and then insert it at new position
      const reorderedTasks = columnTasks
        .filter((t) => t.id !== taskId)
        .sort((a, b) => a.position - b.position)
        .toSpliced(newPosition, 0, taskToMove)
        .map((t, index) => ({
          taskId: t.id,
          oldTaskPosition: t.position,
          newTaskPosition: index,
          currentColumnId: sourceColumnId,
        }))

        // excludes unnecesary changes to tasks where position is unchanged
        .filter((update) => {
          return update.oldTaskPosition !== update.newTaskPosition;
        });

      return reorderedTasks;
    }

    // moved task to another column
    else {
      const sourceColumnTasks = allTasks
        .filter((t) => t.projectkanbanColumnId === sourceColumnId && t.id !== taskId)
        .sort((a, b) => a.position - b.position)
        .map((t, index) => ({
          taskId: t.id,
          oldTaskPosition: t.position,
          newTaskPosition: index,
          currentColumnId: sourceColumnId,
        }));

      const allTargetColumnTasks = allTasks
        .filter((t) => t.projectkanbanColumnId === targetColumnId)
        .sort((a, b) => a.position - b.position);

      const position = Math.min(Math.max(newPosition, 0), allTargetColumnTasks.length);

      const targetColumnTasks = [...allTargetColumnTasks];
      targetColumnTasks.splice(position, 0, {
        ...taskToMove,
        projectkanbanColumnId: targetColumnId,
      });

      const targetUpdates = targetColumnTasks.map((t, index) => ({
        taskId: t.id,
        oldTaskPosition: t.position,
        newTaskPosition: index,
        currentColumnId: targetColumnId,
      }));

      return [...sourceColumnTasks, ...targetUpdates];
    }
  } catch (error) {
    console.error(error);
  }
}
