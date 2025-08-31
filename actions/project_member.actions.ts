'use server';
import { MemberValue } from '@/components/ui/add-member-multiselect';
import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { db, DBTransaction } from '@/lib/db/connect_db';
import { projectMembers, projects, users } from '@/lib/db/schema/schema';
import { checkMemberPermission } from '@/lib/queries/permssions.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import { getErrorMessage } from '@/lib/utils/error.utils';
import { AddProjectMemberSchema } from '@/lib/validations/project.validations';
import { Project, User } from '@/types/db.types';
import { ActionResult } from '@/types/types';
import { and, eq, ilike, or } from 'drizzle-orm';

// assumes that inputs are already validated
export async function addProjectMembers(
  projectId: Project['id'],
  members: MemberValue[],
  isNewProject: boolean,
  dbTransaction?: DBTransaction,
): Promise<ActionResult> {
  try {
    const dbContext = dbTransaction ?? db;
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.PROJECT_MEMBERS,
      ACTIONS.INVITE,
      isNewProject,
    );

    if (!isAuthorize) throw new Error('User is unauthorized to update project');

    const validatedData = AddProjectMemberSchema.parse({
      members: members,
    });

    // transform member data for multiple db insertion
    const toInsert = validatedData.members.map((m) => ({
      userId: m.userId,
      projectId: projectId,
      role: m.role,
    }));

    console.info(toInsert);

    await dbContext.insert(projectMembers).values(toInsert);
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: getErrorMessage(error),
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

// moved to server actions to work properly with user multiselect
export async function getProjectMembers(
  projectId: Project['id'],
  withSearchTerm?: string,
  maxCount?: number,
) {
  try {
    const searchFields = [users.firstName, users.lastName, users.primaryEmailAddress];

    const conditions = [
      eq(projects.id, projectId),
      ...(withSearchTerm
        ? [or(...searchFields.map((field) => ilike(field, `%${withSearchTerm.trim()}%`)))]
        : []),
    ];

    const projectMemberList = await db
      .select({
        userData: { ...users },
        role: projectMembers.role,
        joinedAt: projectMembers.joinedAt,
      })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .innerJoin(users, eq(users.id, projectMembers.userId))
      .where(and(...conditions))
      .orderBy(projectMembers.role)
      .limit(maxCount ?? 0);

    return projectMemberList;
  } catch (error) {
    console.error(error);
  }
}
