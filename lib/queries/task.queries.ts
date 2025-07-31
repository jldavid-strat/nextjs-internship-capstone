import { queryResult } from '@/types';
import { db } from '../db/connect_db';
import { task } from '../db/schema';
import { eq } from 'drizzle-orm';
import { CreateTask, Task, UpdateTask } from '@/types/db.types';

export async function createTask(taskData: CreateTask): Promise<queryResult> {
  try {
    await db.insert(task).values({
      title: taskData.title,
      description: taskData.description,
      projectId: taskData.projectId,
      status: taskData.status,
      kanbanColumnId: taskData.kanbanColumnId,
      createdAt: new Date(),
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      milestoneId: taskData.milestoneId,
    });
    return { success: true, message: `Task successfully created` };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create task. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}

export async function updateTeam(
  taskId: Task['id'],
  taskData: UpdateTask,
): Promise<queryResult> {
  try {
    await db
      .update(task)
      .set({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        detail: taskData.detail,
        kanbanColumnId: taskData.kanbanColumnId,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        milestoneId: taskData.milestoneId,
        updatedAt: new Date(),
      })
      .where(eq(task.id, taskId));

    return { success: true, message: `Task successfully updated` };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update task. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}

export async function deleteTask(taskId: number): Promise<queryResult> {
  try {
    await db.delete(task).where(eq(task.id, taskId));

    // TODO: also delete the records of team in teamMember

    return { success: true, message: `Task successfully deleted` };
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete task. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}
