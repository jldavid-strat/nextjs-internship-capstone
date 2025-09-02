import { Task } from '@/types/db.types';
import { db, DBTransaction } from '../db/connect_db';
import { labels, projectLabels, taskLabels } from '../db/schema/schema';
import { eq } from 'drizzle-orm';

// get labels for a specific task
export async function getTaskLabels(taskId: Task['id'], dbTransaction?: DBTransaction) {
  try {
    const dbContext = dbTransaction ?? db;

    const taskLabelList = await dbContext
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
      .where(eq(taskLabels.taskId, taskId));

    return taskLabelList;
  } catch (error) {
    console.error(error);
  }
}
