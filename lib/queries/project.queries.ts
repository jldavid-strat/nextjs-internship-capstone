import { eq } from 'drizzle-orm';
import { db } from '../db/connect_db';
import { project } from '../db/schema';
import { queryResult } from '@/types';
import { Project, CreateProject, UpdateProject } from '@/types/db.types';

export async function createProject(projectData: CreateProject): Promise<queryResult> {
  try {
    await db.insert(project).values({
      title: projectData.title,
      description: projectData.description,
      status: projectData.status,
      ownerId: projectData.ownerId,
      dueDate: projectData.dueDate,
      createdAt: new Date(),
    });

    return { success: true, message: `Project successfully created` };
  } catch (error) {
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

export async function updateProject(
  projectId: Project['id'],
  projectData: UpdateProject,
): Promise<queryResult> {
  try {
    await db
      .update(project)
      .set({
        title: projectData.title,
        description: projectData.description,
        statusChangedAt: projectData.statusChangedAt,
        statusChangedBy: projectData.statusChangedBy,
        status: projectData.status,
        ownerId: projectData.ownerId,
        dueDate: projectData.dueDate,
        updatedAt: projectData.updatedAt,
      })
      .where(eq(project.id, projectId));

    return { success: true, message: `Project successfully updated` };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update project`,
      error: JSON.stringify(error),
    };
  }
}

export async function deleteProject(projectId: Project['id']): Promise<queryResult> {
  try {
    await db.delete(project).where(eq(project.id, projectId));

    return { success: true, message: `Project successfully deleted` };
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete project`,
      error: JSON.stringify(error),
    };
  }
}

// NOTE: change to Partial<SelectProject[]> if you don't need all the columns
export async function getAllProjects(): Promise<queryResult<Project[]>> {
  try {
    const projects = await db.select().from(project).orderBy(project.createdAt);

    return {
      success: true,
      message: `Successfully retrieve all projects`,
      data: projects,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed retrieve all projects. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}
export async function getProjectById(
  projectId: Project['id'],
): Promise<queryResult<Project>> {
  try {
    const singularProject = await db
      .select()
      .from(project)
      .where(eq(project.id, projectId));

    return {
      success: true,
      message: `Successfully retrieve project`,
      data: singularProject[0],
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to project.`,
      error: JSON.stringify(error),
    };
  }
}
