'use server';
import { DEFAULT_LABELS, defaultLabelNames } from '@/constants/labels';
import { db, DBTransaction } from '@/lib/db/connect_db';
import { labels, projectLabels } from '@/lib/db/schema/schema';
import { Project, ProjectLabel } from '@/types/db.types';
import { inArray } from 'drizzle-orm';

export async function createDefaultProjectLabels(
  projectId: Project['id'],
  dbTransaction?: DBTransaction,
) {
  try {
    const dbContext = dbTransaction ?? db;
    const defaultLabels = await dbContext
      .select()
      .from(labels)
      .where(inArray(labels.name, defaultLabelNames));

    const toInsertProjectLabels: Array<Omit<ProjectLabel, 'updatedAt'>> = defaultLabels.map(
      (l, index) => ({
        labelId: l.id,
        projectId: projectId,
        color: DEFAULT_LABELS[index].color,
        isCustom: false,
      }),
    );

    await dbContext.insert(projectLabels).values(toInsertProjectLabels);
    return {
      success: true,
      message: 'Successfully created default project labels',
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed to initialize default kanban columns',
    };
  }
}
