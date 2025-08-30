'use server';
import { UnauthorizedError } from '@/constants/error';
import { DEFAULT_LABELS, defaultLabelNames } from '@/constants/labels';
import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { db, DBTransaction } from '@/lib/db/connect_db';
import { labels, projectLabels } from '@/lib/db/schema/schema';
import { checkMemberPermission } from '@/lib/queries/permssions.queries';
import { getProjectLabelByName } from '@/lib/queries/project_labels.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import { getErrorMessage } from '@/lib/utils/error.utils';
import { ProjectLabelSchema } from '@/lib/validations/project-label.validations';
import { Project, ProjectLabel } from '@/types/db.types';
import { ActionResult } from '@/types/types';
import { inArray } from 'drizzle-orm';

export async function createDefaultProjectLabels(
  projectId: Project['id'],
  dbTransaction?: DBTransaction,
): Promise<ActionResult> {
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
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to initialize default kanban columns',
    };
  }
}

export async function addProjectLabels(
  projectId: Project['id'],
  previousState: unknown,
  projectLabelData: FormData,
) {
  try {
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.PROJECT_LABELS,
      ACTIONS.CREATE,
    );

    if (!isAuthorize) throw new UnauthorizedError('User is not authorized to add project labels');

    const validatedData = ProjectLabelSchema.parse({
      name: projectLabelData.get('name') as string,
      color: projectLabelData.get('color') as string,
    });

    // check if label already exist
    const existingLabel = await getProjectLabelByName(validatedData.name);

    // insert new label name if it does not exist
    let labelId = existingLabel === undefined ? null : existingLabel.id;
    if (!labelId) {
      const [labelResult] = await db
        .insert(labels)
        .values({
          name: validatedData.name,
        })
        .returning({ id: labels.id });

      labelId = labelResult.id;
    }

    // insert into list of label in current project
    await db.insert(projectLabels).values({
      isCustom: true,
      labelId: labelId,
      color: validatedData.color.toUpperCase(),
      projectId: projectId,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
