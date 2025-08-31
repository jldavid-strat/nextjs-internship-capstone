import 'server-only';
import { db, DBTransaction } from '../db/connect_db';
import { tasks } from '../db/schema/schema';
import { and, eq, max } from 'drizzle-orm';
import { KanbanColumn, Project, Task } from '@/types/db.types';

export async function getMaxNumPositionByColumnId(
  kanbanColumnId: Task['kanbanColumnId'],
  projectId: Task['projectId'],
  dbTransaction?: DBTransaction,
) {
  try {
    const dbContext = dbTransaction ?? db;
    const [result] = await dbContext
      .select({
        maxNumPosition: max(tasks.position),
      })
      .from(tasks)
      .where(and(eq(tasks.projectId, projectId), eq(tasks.kanbanColumnId, kanbanColumnId)));

    return result.maxNumPosition;
  } catch (error) {
    console.error(error);
  }
}

// return type : Promise<QueryResult<Partial<Task[]>>>
export async function getTaskList(projectId: Project['id'], withColumnId?: KanbanColumn['id']) {
  try {
    const taskList = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.projectId, projectId),
          withColumnId ? eq(tasks.kanbanColumnId, withColumnId) : undefined,
        ),
      )
      .orderBy(tasks.position);

    return { success: true, message: `Successfully fetched task list`, data: taskList };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: `Failed to fetch task list`,
      error: JSON.stringify(error),
    };
  }
}

export async function getTaskById(taskId: Task['id']) {
  try {
    const task = await db.query.tasks.findFirst({
      where: (tasks, { eq }) => eq(tasks.id, taskId),
    });

    return { success: true, message: `Successfully fetched task `, data: task };
  } catch (error) {
    return {
      success: false,
      message: `Failed to fetch task list`,
      error: JSON.stringify(error),
    };
  }
}
