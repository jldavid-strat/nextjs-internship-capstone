import 'server-only';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/connect_db';
import { projects, tasks } from '../db/schema/schema';
import { QueryResult } from '@/types/types';
import { Project } from '@/types/db.types';
import { projectMembers, users } from '@/migrations/schema';
import { getProjectMembers } from '@/actions/project_member.actions';
import { getProjectTeams } from './project_teams.queries';
import { getErrorMessage } from '../utils/error.utils';
import { getProjectLabels } from '@/actions/project_labels.actions';
import { getMemberCount } from './project_member.queries';
import { getCompletedTaskCount, getTotalTaskCount } from './task.queries';
import { getCurrentUserId } from './user.queries';

// [CONSIDER] check read authorization in fetching projects

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
  try {
    const getProgressCase = sql<number>`
      CASE 
        WHEN COUNT(${tasks.id}) = 0 THEN 0
        ELSE ROUND(
          (SUM(CASE WHEN ${tasks.isCompleted} = true THEN 1 ELSE 0 END)::decimal / COUNT(${tasks.id})) * 100
        )
      END
    `;

    const projectList = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        status: projects.status,
        dueDate: projects.dueDate,
        progress: getProgressCase,
      })
      .from(projects)
      .leftJoin(projectMembers, eq(projectMembers.projectId, projects.id))
      .leftJoin(users, eq(users.id, userId))
      .leftJoin(tasks, eq(tasks.projectId, projects.id))
      .where(and(eq(projectMembers.userId, userId), eq(projects.isArchived, false)))
      .groupBy(projects.id);

    return {
      success: true,
      data: projectList ?? [],
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// gets progress in percentage
export async function getProjectProgress(projectId: Project['id']) {
  try {
    const completedTaskCount = await getCompletedTaskCount(projectId);
    const totalTaskCount = await getTotalTaskCount(projectId);

    if (!completedTaskCount || !totalTaskCount) return 0;

    return (totalTaskCount / completedTaskCount) * 100;
  } catch (error) {
    console.error(error);
  }
}

export async function getProjectById(projectId: Project['id']) {
  try {
    const singularProject = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.isArchived, false)));
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

export async function getProjectHeaderData(projectId: Project['id']) {
  try {
    const singularProject = await db
      .select({
        title: projects.title,
        description: projects.description,
        status: projects.status,
        dueDate: projects.dueDate,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.isArchived, false)));

    const response = await Promise.all([
      getMemberCount(projectId),
      getCompletedTaskCount(projectId),
      getTotalTaskCount(projectId),
      getProjectOwner(projectId),
    ]);

    console.log('project header data', response);

    const memberCount = response[0];
    const completedTasks = response[1];
    const totalTasks = response[2];
    const ownerData = response[3];

    return {
      success: true,
      message: 'Succesfully retrieved project',
      data: {
        ...singularProject[0],
        memberCount: memberCount,
        completedTasks: completedTasks,
        totalTasks: totalTasks,
        ownerData: ownerData,
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

export async function getProjectDataById(projectId: Project['id']) {
  try {
    const singularProject = await db.select().from(projects).where(eq(projects.id, projectId));
    const projectMember = await getProjectMembers(projectId);
    const projectTeams = await getProjectTeams(projectId);
    const projectLabelList = await getProjectLabels(projectId);

    const projectMemberList = projectMember?.map((m) => ({
      userId: m.userData.id,
      firstName: m.userData.firstName,
      lastName: m.userData.lastName,
      primaryEmailAddress: m.userData.primaryEmailAddress,
      userImgLink: m.userData.imgLink,
      projectId: m.projectId,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
    return {
      success: true,
      message: `Successfully retrieve project`,
      data: {
        projectData: singularProject[0],
        projectMembers: projectMemberList,
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

export async function getProjectOwner(projectId: Project['id']) {
  try {
    const [ownerData] = await db
      .select({
        firstName: users.firstName,
        lastName: users.lastName,
        userImgLink: users.imgUrl,
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.role, 'owner')))
      .limit(1);

    return { ...ownerData };
  } catch (error) {
    console.error(error);
  }
}

export async function getRecentProjects() {
  try {
    const currentUserId = await getCurrentUserId();
    const maxCount = 4;

    const recentProjects = await db
      .select({
        id: projects.id,
        title: projects.title,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .innerJoin(projectMembers, eq(projectMembers.projectId, projects.id))
      .where(and(eq(projectMembers.userId, currentUserId), eq(projects.isArchived, false)))
      .orderBy(projects.updatedAt)
      .limit(maxCount);

    return recentProjects;
  } catch (error) {
    console.error(error);
  }
}
