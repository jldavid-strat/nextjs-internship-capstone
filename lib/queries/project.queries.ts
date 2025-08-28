import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '../db/connect_db';
import { projects } from '../db/schema/schema';
import { QueryResult } from '@/types';
import { Project } from '@/types/db.types';
import { projectMembers, users } from '@/migrations/schema';

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
