import 'server-only';
import { projectMembers, users } from '@/lib/db/schema/schema';
import { db } from '../db/connect_db';
import { projects } from '../db/schema/schema';
import { and, count, eq, max } from 'drizzle-orm';
import { Project, User } from '@/types/db.types';
import { getErrorMessage } from '../utils/error.utils';
import { QueryResult } from '@/types/types';
import { MemberRole } from '../db/schema/enums';

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

export async function getMemberCount(projectId: Project['id']) {
  try {
    const [result] = await db
      .select({ memberCount: count(projectMembers.userId) })
      .from(projectMembers)
      .where(eq(projectMembers.projectId, projectId));

    return result.memberCount;
  } catch (error) {
    console.error(error);
  }
}

export async function getMember(userId: User['id'], projectId: Project['id']) {
  try {
    const [member] = await db
      .select({
        userId: projectMembers.userId,
        role: projectMembers.role,
      })
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));

    return {
      success: true,
      data: member,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
