import { Task } from '@/types/db.types';
import { db } from '../db/connect_db';
import { taskAssignees, users } from '../db/schema/schema';
import { eq } from 'drizzle-orm';

// gets user data of assignees
export async function getTaskAssignees(taskId: Task['id']) {
  try {
    const taskAssigneeList = await db
      .select({ assigneeUserData: { ...users } })
      .from(taskAssignees)
      .innerJoin(users, eq(users.id, taskAssignees.assigneeId))
      .where(eq(taskAssignees.taskId, taskId));

    return taskAssigneeList.map((ta) => ta.assigneeUserData);
  } catch (error) {
    console.error(error);
  }
}
