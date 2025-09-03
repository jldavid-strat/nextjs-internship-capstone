import { getCurrentUserId } from '@/lib/queries/user.queries';
import { db } from '../db/connect_db';
import { projects, tasks } from '../db/schema/schema';
import { projectMembers, taskAssignees } from '@/migrations/schema';
import { countDistinct, eq, sql } from 'drizzle-orm';

export async function getDashboardStats() {
  try {
    const currentUserId = await getCurrentUserId();

    // get completed tasks assigned to user
    const getCompletedTaskCountCase = sql<number>`
        SUM(CASE WHEN ${tasks.isCompleted} = true THEN 1 ELSE 0 END)
    `;

    // get pending tasks assigned to user
    const getPendingTaskCountCase = sql<number>`
        SUM(CASE WHEN ${tasks.isCompleted} = false THEN 1 ELSE 0 END)
        `;

    // get active projects the user is a member of
    const getActiveProjectCountCase = sql<number>`
        SUM(CASE WHEN ${projects.status} = 'active' THEN 1 ELSE 0 END)
    `;
    const [dashboardStats] = await db
      .select({
        activeProjectCount: getActiveProjectCountCase,
        memberCount: countDistinct(projectMembers.userId),
        completedTaskCount: getCompletedTaskCountCase,
        pendingTaskCount: getPendingTaskCountCase,
      })
      .from(projects)
      .leftJoin(projectMembers, eq(projectMembers.projectId, projects.id))
      .leftJoin(tasks, eq(tasks.projectId, projects.id))
      .leftJoin(taskAssignees, eq(taskAssignees.taskId, tasks.id))
      .where(eq(projectMembers.userId, currentUserId));

    return dashboardStats;
  } catch (error) {
    console.error(error);
  }
}
