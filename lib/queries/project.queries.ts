'use server';

import { eq } from 'drizzle-orm';
import { db } from '../db/connect_db';
import { projects } from '../db/schema/schema';
import { ActionResult, QueryResult } from '@/types';
import { Project } from '@/types/db.types';
import { revalidatePath } from 'next/cache';
import { ProjectSchema } from '../validations';
import { ZodError } from 'zod';
import { getCurrentUserId } from './user.queries';
import { addProjectMember } from './project_member.queries';
import { projectMembers, users } from '@/migrations/schema';
import getDataDiff from '../utils/data_diff';
import { createDefaultKanbanColumns } from './kanban-column.queries';
import { checkMemberPermission, checkPermission } from './permssions.queries';
import { ACTIONS, RESOURCES } from '@/constants/permissions';

const InsertProjectSchema = ProjectSchema.omit({
  status: true,
  statusChangedAt: true,
  statusChangedById: true,
  updatedAt: true,
});

export async function createProject(
  previousState: unknown,
  projectData: FormData,
): Promise<QueryResult<Project['id'], string[] | string>> {
  try {
    const currentUserId = await getCurrentUserId();
    console.log(currentUserId);

    // all users by default can create projects
    const { success } = await checkPermission('public', RESOURCES.PROJECTS, ACTIONS.CREATE);

    if (!success) throw new Error('User is unauthorized to create project');

    // [CONSIDER] const data = Object.fromEntries(projectData.entries())

    // must be formatted as "YYYY-MM-DD"
    // default to null to handle empty string
    const dueDateString = projectData.get('dueDate') || null;
    // console.log(typeof dueDateString);

    const validatedData = InsertProjectSchema.parse({
      title: projectData.get('title') as string,
      description: projectData.get('description') as string,
      ownerId: currentUserId as string,
      dueDate: dueDateString,
    });

    const [{ newProjectId }] = await db
      .insert(projects)
      .values(validatedData)
      .returning({ newProjectId: projects.id });

    // TODO wrap in a db transaction
    // add owner in member list as owner
    console.log('added owner as member');
    await addProjectMember(validatedData.ownerId, newProjectId, 'owner');

    // create default kanban boards
    console.log('created default kanban boards');
    const kanbanResponse = await createDefaultKanbanColumns(newProjectId);

    if (!kanbanResponse.success) throw new Error(kanbanResponse.message);

    revalidatePath('/projects');
    return {
      success: true,
      message: `Project successfully created`,
      data: newProjectId,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: error.issues[0].message,
        error: error.issues.map((issue) => issue.message),
      };
    }
    console.error(error);
    return {
      success: false,
      message: `Failed to create project`,
      error: JSON.stringify(error),
    };
  }
}

/* TODO: check if drizzle does granular update
  If no 
  1. only update the fields that have been modified
  2. create specific update functions for fields reference other fields 
*/

const EditProjectSchema = ProjectSchema.partial().pick({
  title: true,
  description: true,
  status: true,
  statusChangedAt: true,
  statusChangedById: true,
  dueDate: true,
  updatedAt: true,
});

export async function updateProject(
  editProjectId: string,
  previousState: unknown,
  projectData: FormData,
) {
  try {
    const currentUserId = await getCurrentUserId();

    const { success: isAuthorize } = await checkMemberPermission(
      currentUserId,
      editProjectId,
      RESOURCES.PROJECTS,
      ACTIONS.UPDATE,
    );

    if (!isAuthorize) throw new Error('User is unauthorized to update project');

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
    return { success: true, message: `Successfully updated project` };
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
      return {
        success: false,
        message: `Failed to update project`,
        error: error.message,
      };
    }
    return {
      success: false,
      message: `Failed to update project`,
      error: error,
    };
  }
}

export async function deleteProject(projectId: Project['id']): Promise<ActionResult> {
  try {
    await db.delete(projects).where(eq(projects.id, projectId));

    return { success: true, message: `Project successfully deleted` };
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete project`,
      error: JSON.stringify(error),
    };
  }
}

// TODO [CONSIDER] check read authorization in fetching projects

// NOTE: change to Partial<SelectProject[]> if you don't need all the columns
export async function getAllProjects(): Promise<QueryResult<Project[]>> {
  try {
    const projectList = await db.select().from(projects).orderBy(projects.createdAt);

    return {
      success: true,
      message: `Successfully retrieve all projects`,
      data: projectList,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed retrieve all projects. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}

export async function getAllUserProject(userId: string) {
  // TODO: add indexes to the identifiers used in this query
  try {
    const projectList = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        status: projects.status,
        dueDate: projects.dueDate,
      })
      .from(projects)
      .leftJoin(projectMembers, eq(projectMembers.projectId, projects.id))
      .leftJoin(users, eq(users.id, projectMembers.userId))
      .where(eq(users.id, userId));

    if (projectList.length === 0) {
      throw new Error('No projects found');
    }

    return {
      success: true,
      message: `Successfully retrieve all projects`,
      data: projectList,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed retrieve all projects. ${error}`,
      error: JSON.stringify(error),
    };
  }
}

export async function getProjectById(projectId: Project['id']) {
  try {
    const singularProject = await db.select().from(projects).where(eq(projects.id, projectId));
    console.log(typeof singularProject);
    if (Object.keys(singularProject).length <= 0) {
      throw new Error(`No project with ${projectId} ID found`);
    }
    return {
      success: true,
      message: `Successfully retrieve project`,
      data: singularProject[0],
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to retrieve project.`,
      error: JSON.stringify(error),
    };
  }
}
