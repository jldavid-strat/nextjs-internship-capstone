'use server';
import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { db } from '@/lib/db/connect_db';
import { taskAssignees, tasks } from '@/lib/db/schema/schema';
import { checkMemberPermission } from '@/lib/queries/permssions.queries';
import { getMaxPositionByColumnId, getTaskById } from '@/lib/queries/task.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import getDataDiff from '@/lib/utils/data_diff';
import { TaskSchema } from '@/lib/validations';
import { QueryResult } from '@/types';
import { Project, Task } from '@/types/db.types';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';

const InsertTaskSchema = TaskSchema.omit({
  updatedAt: true,
});

// TODO rename to something more descriptive
type CreateTaskProps = {
  kanbanColumnId: string;
  projectId: string;
  kanbanName: string;
};

export async function createTask(
  kanbanData: CreateTaskProps,
  previousState: unknown,
  taskData: FormData,
): Promise<QueryResult> {
  try {
    const currentUserId = await getCurrentUserId();

    const { success: isAuthorize } = await checkMemberPermission(
      currentUserId,
      kanbanData.projectId,
      RESOURCES.TASKS,
      ACTIONS.CREATE,
    );

    if (!isAuthorize) throw new Error('User is unauthorized to create task');
    console.log(currentUserId);

    // default to null if empty
    const currentMaxPosition =
      (await getMaxPositionByColumnId(kanbanData.kanbanColumnId, kanbanData.projectId)) ?? null;

    // default position to zero if empty
    let position = 0;

    // increment position if not empty
    if (currentMaxPosition !== null) position = currentMaxPosition + 1;

    const startDateString = taskData.get('startDate') || null;
    const dueDateString = taskData.get('dueDate') || null;
    console.log(startDateString);
    console.log(dueDateString);
    console.log(kanbanData.kanbanName);
    console.log(kanbanData.kanbanColumnId);
    console.log(kanbanData.projectId);
    console.log('postion', position);

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
      status: kanbanData.kanbanName as string,
      kanbanColumnId: kanbanData.kanbanColumnId as string,
      projectId: kanbanData.projectId as string,
      createdById: currentUserId as string,
      startDate: startDateString,
      dueDate: dueDateString,
    });

    const [newTask] = await db.insert(tasks).values(validatedData).returning({ taskId: tasks.id });

    // assign task to self
    // TODO validate using zod
    console.log('assigning task to self');
    await db.insert(taskAssignees).values({
      taskId: newTask.taskId,
      assigneeId: currentUserId,
      assignedById: currentUserId,
      assignedAt: new Date(),
    });
    console.log('assingned task successfully');

    revalidatePath('/(dashboard)');
    return { success: true, message: `Task successfully created`, data: undefined };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: `Failed to create task. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}

const EditTaskSchema = TaskSchema.partial().pick({
  title: true,
  description: true,
  detail: true,
  priority: true,
  startDate: true,
  dueDate: true,
  updatedAt: true,
});

export async function updateTask(
  queryIds: { taskId: Task['id']; projectId: Project['id'] },
  previousState: unknown,
  taskData: FormData,
): Promise<QueryResult> {
  try {
    const currentUserId = await getCurrentUserId();

    // TODO consider if user is the task creator
    const { success: isAuthorize } = await checkMemberPermission(
      currentUserId,
      queryIds.projectId,
      RESOURCES.TASKS,
      ACTIONS.UPDATE,
    );

    if (!isAuthorize) throw new Error('User is unauthorized to create task');
    const startDateString = taskData.get('startDate') || null;
    const dueDateString = taskData.get('dueDate') || null;

    const { success, data: currentTask } = await getTaskById(queryIds.taskId, queryIds.projectId);
    console.log(currentTask);
    if (!success || !currentTask) {
      throw new Error('Something went wrong, Please try again');
    }
    const originalTaskData = {
      title: currentTask.title as string,
      description: currentTask.description as string,
      detail: currentTask.detail as string,
      priority: currentTask.priority as string,
      startDate: currentTask.startDate as string,
      dueDate: currentTask.dueDate as string,
    };

    const currentTaskData = {
      title: taskData.get('title') as string,
      description: taskData.get('description') as string,
      detail: taskData.get('detail') as string,
      priority: taskData.get('priority') as string,
      startDate: startDateString as string,
      dueDate: dueDateString as string,
    };
    const changes = getDataDiff(originalTaskData, currentTaskData);

    if (changes === null) throw new Error('No changes made');

    const validatedData = EditTaskSchema.parse({
      ...changes,
      updatedAt: new Date(),
    });

    console.log(validatedData);

    await db
      .update(tasks)
      .set(validatedData)
      .where(and(eq(tasks.id, queryIds.taskId), eq(tasks.projectId, queryIds.projectId)));

    return { success: true, message: `Task successfully updated`, data: undefined };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: `Failed to update task`,
        error: error.message,
      };
    }
    return {
      success: false,
      message: `Failed to update task. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}

export async function deleteTask(taskId: Task['id']): Promise<QueryResult> {
  try {
    await db.delete(tasks).where(eq(tasks.id, taskId));

    // TODO: also delete the records of team in teamMember

    return { success: true, message: `Task successfully deleted`, data: undefined };
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete task. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}
