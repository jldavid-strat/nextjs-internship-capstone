import { Task } from '@/types/db.types';
import { db } from '../db/connect_db';
import { taskAssignees, tasks, users } from '../db/schema/schema';
import { eq } from 'drizzle-orm';

// gets user data of assignees
export async function getTaskAssignees(taskId: Task['id']) {
  try {
    const taskAssigneeList = await db
      .select({ assigneeUserData: { ...users } })
      .from(taskAssignees)
      .innerJoin(tasks, eq(tasks.id, taskAssignees.taskId))
      .innerJoin(users, eq(users.id, taskAssignees.assigneeId))
      .where(eq(tasks.id, taskId));

    return taskAssigneeList;
  } catch (error) {
    console.error(error);
  }
}
