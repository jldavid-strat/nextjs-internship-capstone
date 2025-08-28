import 'server-only';
import { projectMembers, users } from '@/lib/db/schema/schema';
import { db } from '../db/connect_db';
import { projects } from '../db/schema/schema';
import { and, eq } from 'drizzle-orm';
import { Project, User } from '@/types/db.types';

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
