'use server';
import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { db } from '@/lib/db/connect_db';
import { projects } from '@/lib/db/schema/schema';
import { checkMemberPermission, checkPermission } from '@/lib/queries/permssions.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import { ActionResult } from '@/types/types';
import { Project } from '@/types/db.types';
import { addProjectMembers } from './project_member.actions';
import { createDefaultKanbanColumns } from './kanban_column.actions';
import { revalidatePath } from 'next/cache';
import { getProjectById } from '@/lib/queries/project.queries';
import getDataDiff from '@/lib/utils/data_diff';
import { eq } from 'drizzle-orm';
import { EditProjectSchema, InsertProjectSchema } from '@/lib/validations/project.validations';
import { checkAuthenticationStatus } from '@/lib/utils/is_authenticated';
import { MemberValue } from '@/components/ui/add-member-multiselect';
import { createDefaultProjectLabels } from './project_labels.actions';
import { getErrorMessage } from '@/lib/utils/error.utils';
import { DatabaseOperationError, UnauthorizedError } from '@/constants/error';

export async function createProject(
  previousState: unknown,
  projectData: FormData,
): Promise<ActionResult<Project['id']>> {
  try {
    await checkAuthenticationStatus();

    // all users by default can create projects
    const { isAuthorize } = await checkPermission('public', RESOURCES.PROJECTS, ACTIONS.CREATE);

    if (!isAuthorize) throw new UnauthorizedError('User is unauthorized to create project');

    // [CONSIDER] const data = Object.fromEntries(projectData.entries())
    // must be formatted as "YYYY-MM-DD"
    // default to null to handle empty string

    const transactionResult = await db.transaction(async (tx) => {
      const dueDateString = projectData.get('dueDate') || null;
      const members = JSON.parse(projectData.get('members') as string) as MemberValue[];

      const validatedData = InsertProjectSchema.parse({
        title: projectData.get('title') as string,
        description: projectData.get('description') as string,
        ownerId: projectData.get('owner-id') as string,
        dueDate: dueDateString,
      });

      console.log('creating new project...');

      const [{ newProjectId }] = await tx
        .insert(projects)
        .values(validatedData)
        .returning({ newProjectId: projects.id });

      console.log('adding project members...');
      const { success } = await addProjectMembers(newProjectId, members, true, tx);
      if (!success) throw new DatabaseOperationError('Something went wrong adding project members');

      // create default kanban boards
      console.log('creating default kanban boards...');
      const kanbanResponse = await createDefaultKanbanColumns(newProjectId, tx);
      if (!kanbanResponse.success) throw new DatabaseOperationError(kanbanResponse.error as string);

      // create default labels for this project
      console.log('creating default project labels...');
      const labelResponse = await createDefaultProjectLabels(newProjectId, tx);
      if (!labelResponse.success) throw new DatabaseOperationError(labelResponse.error as string);

      revalidatePath('/projects');
      return {
        success: true,
        message: 'Succesfully retrieved project',
        data: newProjectId,
      };
    });
    if (!transactionResult.success) throw new DatabaseOperationError('Failed to create project');
    return { ...transactionResult, success: transactionResult.success };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/* TODO: check if drizzle does granular update
  If no 
  1. only update the fields that have been modified
  2. create specific update functions for fields reference other fields 
*/

export async function updateProject(
  editProjectId: string,
  previousState: unknown,
  projectData: FormData,
): Promise<ActionResult<null>> {
  try {
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      editProjectId,
      RESOURCES.PROJECTS,
      ACTIONS.UPDATE,
    );

    if (!isAuthorize) throw new UnauthorizedError('User is unauthorized to update project');

    const dueDateString = projectData.get('dueDate') || null;

    const { success, data: currentProject } = await getProjectById(editProjectId);

    if (!success || !currentProject) {
      throw new Error('Something went wrong, Please try again');
    }
    const originalProjectData = {
      title: currentProject.title as string,
      description: currentProject.description as string,
      status: currentProject.status as string,
      dueDate: currentProject.dueDate as string,
    };

    const currentProjectData = {
      title: projectData.get('title') as string,
      description: projectData.get('description') as string,
      status: projectData.get('status') as string,
      dueDate: dueDateString as string,
    };
    const changes = getDataDiff(originalProjectData, currentProjectData);
    if (!changes) throw new Error('No changes made');

    let statusChangedById = null;
    let statusChangedAt = null;
    if (changes.status) {
      statusChangedById = currentUserId;
      statusChangedAt = new Date();
    }

    const validatedData = EditProjectSchema.parse({
      ...changes,
      statusChangedAt: statusChangedAt,
      statusChangedById: statusChangedById,
      updatedAt: new Date(),
    });

    // console.log(validatedData);

    await db.update(projects).set(validatedData).where(eq(projects.id, editProjectId));
    revalidatePath('/(dashboard)');
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function deleteProject(projectId: Project['id']): Promise<ActionResult> {
  try {
    await db.delete(projects).where(eq(projects.id, projectId));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: JSON.stringify(error),
    };
  }
}
