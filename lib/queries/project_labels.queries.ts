import 'server-only';
import { Label, Project, ProjectLabel } from '@/types/db.types';
import { db } from '../db/connect_db';
import { labels, projectLabels } from '../db/schema/schema';
import { and, eq } from 'drizzle-orm';

export async function getProjectLabelById(
  projectLabelId: ProjectLabel['id'],
  projectId: Project['id'],
) {
  try {
    const label = await db
      .select({
        id: projectLabels.id,
        name: labels.name,
        color: projectLabels.color,
      })
      .from(projectLabels)
      .innerJoin(labels, eq(labels.id, projectLabels.labelId))
      .where(and(eq(projectLabels.id, projectLabelId), eq(projectLabels.projectId, projectId)))
      .limit(1);

    return label[0];
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
