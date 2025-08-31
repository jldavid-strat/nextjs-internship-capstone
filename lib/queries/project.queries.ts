import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '../db/connect_db';
import { projects } from '../db/schema/schema';
import { QueryResult } from '@/types/types';
import { Project } from '@/types/db.types';
import { projectMembers, users } from '@/migrations/schema';
import { getProjectMembers } from '@/actions/project_member.actions';
import { getProjectTeams } from './project_teams.queries';
import { getErrorMessage } from '../utils/error.utils';
import { getProjectLabels } from '@/actions/project_labels.actions';

// TODO [CONSIDER] check read authorization in fetching projects

// NOTE: change to Partial<SelectProject[]> if you don't need all the columns
export async function getAllProjects(): Promise<QueryResult<Project[]>> {
  try {
    const projectList = await db.select().from(projects).orderBy(projects.createdAt);

    return {
      success: true,
      data: projectList,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: `Failed retrieve all projects`,
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
      data: projectList,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: getErrorMessage(error),
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
    const projectLabelList = await getProjectLabels(projectId);

    return {
      success: true,
      message: `Successfully retrieve project`,
      data: {
        projectData: singularProject[0],
        projectMembers: projectMembers,
        projectTeams: projectTeams,
        projectLabels: projectLabelList,
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
