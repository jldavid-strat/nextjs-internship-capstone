'use server';
import { DatabaseOperationError, UnauthorizedError } from '@/constants/error';
import { DEFAULT_LABELS, defaultLabelNames } from '@/constants/labels';
import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { db, DBTransaction } from '@/lib/db/connect_db';
import { labels, projectLabels } from '@/lib/db/schema/schema';
import { checkMemberPermission } from '@/lib/queries/permssions.queries';
import { getProjectLabelById, getProjectLabelByName } from '@/lib/queries/project_labels.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import getDataDiff from '@/lib/utils/data_diff';
import { getErrorMessage } from '@/lib/utils/error.utils';
import { DEFAULT_COLOR, ProjectLabelSchema } from '@/lib/validations/project-label.validations';
import { Project, ProjectLabel } from '@/types/db.types';
import { ActionResult } from '@/types/types';
import { and, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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

export async function addProjectLabel(
  projectId: Project['id'],
  previousState: unknown,
  projectLabelData: FormData,
): Promise<ActionResult> {
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

    revalidatePath(`/projects/${projectId}/settings`);

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

export async function updateProjectLabel(
  additionalInfo: { projectId: Project['id']; labelId: ProjectLabel['labelId'] },
  previousState: unknown,
  projectLabelData: FormData,
): Promise<ActionResult> {
  try {
    const { projectId, labelId } = additionalInfo;
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.PROJECT_LABELS,
      ACTIONS.UPDATE,
    );

    if (!isAuthorize)
      throw new UnauthorizedError('User is not authorized to update project labels');

    const originalProjectLabelData = await getProjectLabelById(labelId, projectId);

    if (!originalProjectLabelData)
      throw new DatabaseOperationError('Something went wrong. Please try again');

    const originalData = {
      name: originalProjectLabelData.name,
      color: originalProjectLabelData.color ?? DEFAULT_COLOR,
    };

    const validatedData = ProjectLabelSchema.parse({
      name: projectLabelData.get('name') as string,
      color: projectLabelData.get('color') as string,
    });

    const changes = getDataDiff(originalData, validatedData);

    console.log(changes);

    if (changes === null) throw new Error('No changes made');

    if (changes.name) {
      // update the name in label tabel
      await db
        .update(labels)
        .set({
          name: validatedData.name,
        })
        .where(eq(labels.id, labelId));
    }

    // if not update the color in project label table
    await db
      .update(projectLabels)
      .set({
        color: validatedData.color,
      })
      .where(eq(projectLabels.labelId, labelId));

    revalidatePath(`/projects/${projectId}/settings`);

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

export async function deleteProjectLabel(
  labelId: ProjectLabel['labelId'],
  projectId: Project['id'],
): Promise<ActionResult> {
  try {
    await db
      .delete(projectLabels)
      .where(and(eq(projectLabels.labelId, labelId), eq(projectLabels.labelId, labelId)));
    revalidatePath(`/projects/${projectId}/settings`);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
