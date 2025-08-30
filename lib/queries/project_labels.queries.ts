import 'server-only';
import { Label, Project, ProjectLabel } from '@/types/db.types';
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

export async function getProjectLabelById(labelId: ProjectLabel['labelId']) {
  try {
    const label = await db.query.labels.findFirst({
      where: (labels, { eq }) => eq(labels.id, labelId),
    });

    return label;
  } catch (error) {
    console.error(error);
  }
}

export async function getProjectLabelByName(labelName: Label['name']) {
  try {
    const label = await db.query.labels.findFirst({
      where: (labels, { eq }) => eq(labels.name, labelName),
    });

    return label;
  } catch (error) {
    console.error(error);
  }
}
