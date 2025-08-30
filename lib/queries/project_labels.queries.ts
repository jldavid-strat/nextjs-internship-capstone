import 'server-only';
import { Project } from '@/types/db.types';
import { db } from '../db/connect_db';
import { labels, projectLabels } from '../db/schema/schema';
import { eq } from 'drizzle-orm';

export async function getProjectLabels(projectId: Project['id']) {
  try {
    const projectLabelList = await db
      .select({
        labelName: labels.name,
        labelId: labels.id,
        color: projectLabels.color,
        isCustom: projectLabels.isCustom,
        projectId: projectLabels.projectId,
      })
      .from(projectLabels)
      .innerJoin(labels, eq(projectLabels.labelId, labels.id))
      .where(eq(projectLabels.projectId, projectId));

    return projectLabelList;
  } catch (error) {
    console.error(error);
  }
}
