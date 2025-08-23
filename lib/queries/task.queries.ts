import 'server-only';
import { db } from '../db/connect_db';
import { tasks } from '../db/schema/schema';
import { and, eq, max } from 'drizzle-orm';
import { Project, Task } from '@/types/db.types';

export async function getMaxPositionByColumnId(
  kanbanColumnId: Task['kanbanColumnId'],
  projectId: Task['projectId'],
) {
  try {
    const [result] = await db
      .select({
        maxPosition: max(tasks.position),
      })
      .from(tasks)
      .where(and(eq(tasks.projectId, projectId), eq(tasks.kanbanColumnId, kanbanColumnId)));

    return result.maxPosition;
  } catch (error) {
    console.error(error);
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
      .where(and(eq(tasks.projectId, projectId), eq(tasks.status, status)))
      .orderBy(tasks.position);

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
