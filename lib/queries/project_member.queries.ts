'use server';

import { projectMembers, users } from '@/lib/db/schema/schema';
import { db } from '../db/connect_db';
import { projects } from '../db/schema/schema';
import { and, eq } from 'drizzle-orm';
import { Project, User } from '@/types/db.types';
import { checkMemberPermission } from './permssions.queries';
import { getCurrentUserId } from './user.queries';
import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { MemberRole } from '../db/schema/enums';

// assumes that inputs are already validated
export async function addProjectMember(
  additionalInfo: { projectId: Project['id'] },
  previousState: unknown,
  formData: FormData,
) {
  try {
    const currentUserId = await getCurrentUserId();

    const { success: isAuthorize } = await checkMemberPermission(
      currentUserId,
      additionalInfo.projectId,
      RESOURCES.PROJECTS,
      ACTIONS.ASSIGN_MEMBERS,
    );

    if (!isAuthorize) throw new Error('User is unauthorized to update project');

    // decode member array from form data
    const usersToBeAdded = JSON.parse(formData.get('members') as string) as string[];
    const role = formData.get('role') as MemberRole;
    const toInsert = [];

    for (let i = 0; i < usersToBeAdded.length; i++) {
      toInsert.push({
        userId: usersToBeAdded[i],
        projectId: additionalInfo.projectId,
        role: role,
      });
    }
    await db.insert(projectMembers).values(toInsert);
    return {
      success: true,
      message: 'Successfully added project members',
      data: null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Something went wrong in adding project member. Please try again',
      error: JSON.stringify(error),
    };
  }
}

export async function addOwnerInProjectMembers(userId: User['id'], projectId: Project['id']) {
  try {
    await db.insert(projectMembers).values({
      userId: userId,
      projectId: projectId,
      role: 'owner',
    });
  } catch (error) {
    console.error(error);
  }
}

export async function getMemberRole(userId: User['id'], projectId: Project['id']) {
  try {
    const [result] = await db
      .select({
        role: projectMembers.role,
      })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .innerJoin(users, eq(users.id, projectMembers.userId))
      .where(and(eq(projects.id, projectId), eq(users.id, userId)))
      .limit(1);
    return {
      success: true,
      data: result.role,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
    };
  }
}

export async function getProjectMembers(projectId: string) {
  try {
    const result = await db
      .select({
        userId: projectMembers.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.primaryEmailAddress,
        role: projectMembers.role,
        joinedAt: projectMembers.joinedAt,
      })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .innerJoin(users, eq(users.id, projectMembers.userId))
      .where(eq(projects.id, projectId));

    return {
      success: true,
      message: 'Successfully retrieve project members',
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed to retrieve project members',
      error: 'Something went wrong in retrieving project members',
    };
  }
}
