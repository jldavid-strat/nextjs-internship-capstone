'use server';
import { MemberValue } from '@/components/ui/add-member-multiselect';
import { UnauthorizedError } from '@/constants/error';
import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { db, DBTransaction } from '@/lib/db/connect_db';
import { projectMembers, projects, users } from '@/lib/db/schema/schema';
import { checkMemberPermission } from '@/lib/queries/permssions.queries';
import { getMember } from '@/lib/queries/project_member.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import getDataDiff from '@/lib/utils/data_diff';
import { getErrorMessage } from '@/lib/utils/error.utils';
import {
  AddProjectMemberSchema,
  ChangeRoleMemberSchema,
} from '@/lib/validations/project.validations';
import { Project, User } from '@/types/db.types';
import { ActionResult } from '@/types/types';
import { and, eq, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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

    if (!isAuthorize) throw new UnauthorizedError('User is unauthorized to update project');

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

export async function changeMemberRole(
  projectId: Project['id'],
  userId: User['id'],
  previousState: unknown,
  projectMemberData: FormData,
): Promise<ActionResult<null>> {
  try {
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.PROJECT_MEMBERS,
      ACTIONS.CHANGE_ROLE,
    );

    if (!isAuthorize) throw new UnauthorizedError('User is unauthorized change member roles');

    const { success, data: originalMemberData } = await getMember(userId, projectId);

    if (!success || !originalMemberData) throw new Error('Unable to find member');

    const currentMemberData = {
      userId: userId,
      role: projectMemberData.get('role') as string,
    };

    const changes = getDataDiff(
      {
        userId: originalMemberData.userId as string,
        role: originalMemberData.role as string,
      },
      currentMemberData,
    );

    if (!changes) throw new Error('No changes made');

    console.log('changes', changes);

    const validatedData = ChangeRoleMemberSchema.parse(currentMemberData);

    console.log('validatedData', validatedData);

    await db
      .update(projectMembers)
      .set(validatedData)
      .where(
        and(
          eq(projectMembers.userId, currentMemberData.userId),
          eq(projectMembers.projectId, projectId),
        ),
      );
    console.log('updating role', validatedData);

    revalidatePath(`/projects/${projectId}/settings`);
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

export async function removeMember(
  projectId: Project['id'],
  userId: User['id'],
): Promise<ActionResult<null>> {
  try {
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.PROJECT_MEMBERS,
      ACTIONS.REMOVE,
    );

    if (!isAuthorize) throw new UnauthorizedError('User is unauthorized change member roles');

    console.log('removing member from project', userId);

    // remove member from project
    await db
      .delete(projectMembers)
      .where(and(eq(projectMembers.userId, userId), eq(projectMembers.projectId, projectId)));

    revalidatePath(`/projects/${projectId}/settings`);
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

    const projectMemberQuery = (maxCount?: number) => {
      const baseQuery = db
        .select({
          userData: { ...users },
          role: projectMembers.role,
          projectId: projectMembers.projectId,
          joinedAt: projectMembers.joinedAt,
        })
        .from(projects)
        .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
        .innerJoin(users, eq(users.id, projectMembers.userId))
        .where(and(...conditions))
        .orderBy(projectMembers.role);

      return maxCount ? baseQuery.limit(maxCount) : baseQuery;
    };

    return await projectMemberQuery(maxCount);
  } catch (error) {
    console.error(error);
  }
}
