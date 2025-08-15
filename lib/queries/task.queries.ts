'use server';

import { QueryResult } from '@/types';
import { db } from '../db/connect_db';
import { taskAssignees, tasks } from '../db/schema/schema';
import { and, eq } from 'drizzle-orm';
import { Project, Task } from '@/types/db.types';
import { TaskSchema } from '../validations';
import { getCurrentUserId } from './user.queries';
import { revalidatePath } from 'next/cache';
import getDataDiff from '../utils/data_diff';
import { ZodError } from 'zod';
import { checkMemberPermission } from './permssions.queries';
import { ACTIONS, RESOURCES } from '@/constants/permissions';

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

    const startDateString = taskData.get('startDate') || null;
    const dueDateString = taskData.get('dueDate') || null;
    console.log(startDateString);
    console.log(dueDateString);
    console.log(kanbanData.kanbanName);
    console.log(kanbanData.kanbanColumnId);
    console.log(kanbanData.projectId);

    const validatedData = InsertTaskSchema.parse({
      title: taskData.get('title') as string,
      description: taskData.get('description') as string,
      detail: taskData.get('detail') as string,
      priority: taskData.get('priority') as string,

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
    // await db.insert(tasks).values(validatedData).returning({ taskId: tasks.id });

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

// return type : Promise<QueryResult<Partial<Task[]>>>
export async function getTaskListByStatus(projectId: Project['id'], status: string) {
  try {
    const taskList = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        priority: tasks.priority,
        detail: tasks.detail,
        startDate: tasks.startDate,
        dueDate: tasks.dueDate,
      })
      .from(tasks)
      .where(and(eq(tasks.projectId, projectId), eq(tasks.status, status)));

    return { success: true, message: `Successfully fetched task list`, data: taskList };
  } catch (error) {
    return {
      success: false,
      message: `Failed to fetch task list`,
      error: JSON.stringify(error),
    };
  }
}

export async function getTaskById(taskId: Task['id'], projectId: Project['id']) {
  try {
    const task = await db.query.tasks.findFirst({
      where: (tasks, { and, eq }) => and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)),
    });

    return { success: true, message: `Successfully fetched task list`, data: task };
  } catch (error) {
    return {
      success: false,
      message: `Failed to fetch task list`,
      error: JSON.stringify(error),
    };
  }
}
