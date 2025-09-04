'use server';
import { db } from '@/lib/db/connect_db';
import { projectMembers, projects, taskAssignees, tasks } from '@/lib/db/schema/schema';
import { getErrorMessage } from '@/lib/utils/error.utils';
import { User } from '@/types/db.types';
import { CalendarEvent, QueryResult } from '@/types/types';
import { and, eq, isNotNull } from 'drizzle-orm';

export async function getCalenderEvents(userId: User['id']): Promise<QueryResult<CalendarEvent[]>> {
  try {
    // get all active projects where user is a member
    const projectResults = await db
      .select({
        id: projects.id,
        project_id: projects.id,
        title: projects.title,
        createdAt: projects.createdAt,
        dueDate: projects.dueDate,
      })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(
        and(
          eq(projectMembers.userId, userId),
          eq(projects.status, 'active'),
          isNotNull(projects.dueDate),
        ),
      );

    // get all pending tasks the user is assigned to
    const taskResults = await db
      .select({
        id: tasks.id,
        project_id: tasks.projectId,
        title: tasks.title,
        startDate: tasks.startDate,
        dueDate: tasks.dueDate,
      })
      .from(tasks)
      .innerJoin(taskAssignees, eq(tasks.id, taskAssignees.taskId))
      .where(
        and(
          eq(taskAssignees.assigneeId, userId),
          eq(tasks.isCompleted, false),
          isNotNull(tasks.startDate),
          isNotNull(tasks.dueDate),
        ),
      );

    // map it to satisfy Calendar Event type
    const calendarEvents: CalendarEvent[] = [
      ...projectResults.map((p) => ({
        id: p.id,
        project_id: p.project_id,
        title: p.title,
        start: p.createdAt!,
        end: new Date(p.dueDate!),
      })),
      ...taskResults.map((t) => ({
        id: t.id,
        project_id: t.project_id,
        title: t.title,
        start: new Date(t.startDate!),
        end: new Date(t.dueDate!),
      })),
    ];

    console.log('taskResults', taskResults);
    console.log('taskResults', projectResults);

    return {
      success: true,
      data: calendarEvents,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
