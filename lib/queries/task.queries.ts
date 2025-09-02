import 'server-only';
import { db, DBTransaction } from '../db/connect_db';
import { labels, projectLabels, taskLabels, tasks, users } from '../db/schema/schema';
import { and, eq, inArray, max } from 'drizzle-orm';
import { Project, ProjectKanbanColumn, Task } from '@/types/db.types';
import { taskAssignees } from '@/migrations/schema';
import { TaskAssgineeMap, TaskLabelMap } from '@/types/types';

export async function getMaxNumPositionByColumnId(
  projectColumnId: Task['projectkanbanColumnId'],
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
      .where(and(eq(tasks.projectId, projectId), eq(tasks.projectkanbanColumnId, projectColumnId)));

    return result.maxNumPosition;
  } catch (error) {
    console.error(error);
  }
}

// return type : Promise<QueryResult<Partial<Task[]>>>
export async function getTaskList(
  projectId: Project['id'],
  withColumnId?: ProjectKanbanColumn['id'],
) {
  try {
    const taskList = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.projectId, projectId),
          withColumnId ? eq(tasks.projectkanbanColumnId, withColumnId) : undefined,
        ),
      )
      .orderBy(tasks.position);

    const taskIds = taskList.map((task) => task.id);

    // get labels for each task
    const taskLabelsData = await db
      .select({
        taskId: taskLabels.taskId,
        id: projectLabels.id,
        projectId: projectLabels.projectId,
        color: projectLabels.color,
        isCustom: projectLabels.isCustom,
        labelId: labels.id,
        labelName: labels.name,
      })
      .from(taskLabels)
      .innerJoin(projectLabels, eq(projectLabels.id, taskLabels.projectLabelId))
      .innerJoin(labels, eq(projectLabels.labelId, labels.id))
      .where(inArray(taskLabels.taskId, taskIds));

    // get assignness for each task
    const taskAssigneesData = await db
      .select({
        taskId: taskAssignees.taskId,
        id: users.id,
        clerkId: users.clerkId,
        firstName: users.firstName,
        lastName: users.lastName,
        primaryEmailAddress: users.primaryEmailAddress,
        imgLink: users.imgLink,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(taskAssignees)
      .innerJoin(users, eq(taskAssignees.assigneeId, users.id))
      .where(inArray(taskAssignees.taskId, taskIds));

    // group labels and assignees by task id
    const labelsMap: TaskLabelMap = taskLabelsData.reduce((acc, item) => {
      if (!acc[item.taskId]) acc[item.taskId] = [];
      acc[item.taskId].push({
        id: item.id,
        projectId: item.projectId,
        color: item.color,
        isCustom: item.isCustom,
        labelId: item.id,
        labelName: item.labelName,
      });
      return acc;
    }, {} as TaskLabelMap);

    const assigneesMap: TaskAssgineeMap = taskAssigneesData.reduce((acc, item) => {
      if (!acc[item.taskId]) acc[item.taskId] = [];
      acc[item.taskId].push({
        clerkId: item.clerkId,
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        primaryEmailAddress: item.primaryEmailAddress,
        imgLink: item.imgLink,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
      return acc;
    }, {} as TaskAssgineeMap);

    // all
    const taskListData = taskList.map((task) => ({
      ...task,
      labels: labelsMap[task.id] || [],
      assignees: assigneesMap[task.id] || [],
    }));

    return { success: true, message: `Successfully fetched task list`, data: taskListData };
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
