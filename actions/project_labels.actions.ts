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
import { and, eq, ilike, inArray, or, sql } from 'drizzle-orm';
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

    const toInsertProjectLabels: Array<Omit<ProjectLabel, 'updatedAt' | 'id'>> = defaultLabels.map(
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
  additionalInfo: {
    projectId: Project['id'];
    labelId: ProjectLabel['labelId'];
    projectLabelId: ProjectLabel['id'];
  },
  previousState: unknown,
  projectLabelData: FormData,
): Promise<ActionResult> {
  try {
    const { projectId, labelId, projectLabelId } = additionalInfo;
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.PROJECT_LABELS,
      ACTIONS.UPDATE,
    );

    if (!isAuthorize)
      throw new UnauthorizedError('User is not authorized to update project labels');

    const originalProjectLabelData = await getProjectLabelById(projectLabelId, projectId);

    if (!originalProjectLabelData)
      throw new DatabaseOperationError('Something went wrong. Please try again');

    const originalData = {
      name: originalProjectLabelData.name,
      color: originalProjectLabelData.color ?? DEFAULT_COLOR,
    };

    const validatedData = ProjectLabelSchema.parse({
      name: projectLabelData.get('name') as string,
      color: (projectLabelData.get('color') as string).toUpperCase(),
    });

    const changes = getDataDiff(originalData, validatedData);

    console.log(changes);

    if (changes === null) throw new Error('No changes made');
    let newLabelId = labelId;

    if (changes.name) {
      const [labelResult] = await db
        .insert(labels)
        .values({
          name: validatedData.name.toLowerCase().trim(),
        })
        .onConflictDoUpdate({
          target: labels.name,
          // don't actually update anything, just return the ID
          set: {
            // keeps the same name
            name: sql`excluded.name`,
          },
        })
        .returning({ id: labels.id });

      // always gets ID (new or existing)
      newLabelId = labelResult.id;
    }

    // if not update the color in project label table
    await db
      .update(projectLabels)
      .set({
        // also update labelId in case it changed to another name
        labelId: newLabelId,
        color: validatedData.color,
      })
      .where(eq(projectLabels.id, projectLabelId));

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

// moved to server action work in label multiselect
export async function getProjectLabels(projectId: Project['id'], withSearchTerm?: string) {
  try {
    const searchFields = [labels.name];

    const conditions = [
      eq(projectLabels.projectId, projectId),
      ...(withSearchTerm
        ? [or(...searchFields.map((field) => ilike(field, `%${withSearchTerm.trim()}%`)))]
        : []),
    ];

    const projectLabelList = await db
      .select({
        labelName: labels.name,
        id: projectLabels.id,
        labelId: labels.id,
        color: projectLabels.color,
        isCustom: projectLabels.isCustom,
        projectId: projectLabels.projectId,
      })
      .from(projectLabels)
      .innerJoin(labels, eq(projectLabels.labelId, labels.id))
      .where(and(...conditions));

    console.log('projectLabelList', projectLabelList);

    return projectLabelList;
  } catch (error) {
    console.error(error);
  }
}
