import { eq } from 'drizzle-orm';
import { db } from '../db/connect_db';
import { project } from '../db/schema';
import { Project } from '@/types';

interface queryResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

export async function createProject(projectData: Project): Promise<queryResult> {
  try {
    await db.insert(project).values({
      title: projectData.title,
      description: projectData.description,
      status: projectData.status,
      ownerId: projectData.ownerId,
      dueDate: projectData.dueDate,
      createdAt: projectData.createdAt,
    });

    return { success: true, message: `Project successfully created` };
  } catch (error) {
    return { success: false, message: `Failed to create project. Error ${error}` };
  }
}
export async function updateProject(
  projectId: number,
  projectData: Project,
): Promise<queryResult> {
  try {
    await db
      .update(project)
      .set({
        title: projectData.title,
        description: projectData.description,
        statusChangedAt: projectData.statusChangedAt,
        statusChangedBy: projectData.statusChangedby,
        status: projectData.status,
        ownerId: projectData.ownerId,
        dueDate: projectData.dueDate,
        createdAt: projectData.createdAt,
        updatedAt: projectData.updatedAt,
      })
      .where(eq(project.id, projectId));

    return { success: true, message: `Project successfully updated` };
  } catch (error) {
    return { success: false, message: `Failed to update project. Error ${error}` };
  }
}

export async function deleteProject(projectId: number): Promise<queryResult> {
  try {
    await db.delete(project).where(eq(project.id, projectId));

    return { success: true, message: `Project successfully deleted` };
  } catch (error) {
    return { success: false, message: `Failed to delete project. Error ${error}` };
  }
}

export async function getAllProjects(): Promise<queryResult<Project[] | null>> {
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
      data: null,
    };
  }
}
export async function getProjectById(
  projectId: number,
): Promise<queryResult<Project | null>> {
  try {
    const singularProject = await db
      .select()
      .from(project)
      .where(eq(project.id, projectId));

    return {
      success: true,
      message: `Successfully retrieve project`,
      data: singularProject,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to project. Error ${error}`,
      data: null,
    };
  }
}
