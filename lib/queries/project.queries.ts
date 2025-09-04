import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '../db/connect_db';
import { projects } from '../db/schema/schema';
import { QueryResult } from '@/types/types';
import { Project } from '@/types/db.types';
import { projectMembers, users } from '@/migrations/schema';
import { getProjectMembers } from './project_member.queries';
import { getProjectTeams } from './project_teams.queries';

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
    return {
      success: true,
      message: 'Succesfully retrieved project',
      data: singularProject[0],
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed retrieved project',
      error: JSON.stringify(error),
    };
  }
}

export async function getProjectDataById(projectId: Project['id']) {
  try {
    const singularProject = await db.select().from(projects).where(eq(projects.id, projectId));
    const projectMembers = await getProjectMembers(projectId);
    const projectTeams = await getProjectTeams(projectId);

    return {
      success: true,
      message: `Successfully retrieve project`,
      data: {
        projectData: singularProject[0],
        projectMembers: projectMembers,
        projectTeams: projectTeams,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed retrieved project',
      error: JSON.stringify(error),
    };
  }
}
