'use server';
import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { db } from '@/lib/db/connect_db';
import { MemberRole } from '@/lib/db/schema/enums';
import { projectMembers } from '@/lib/db/schema/schema';
import { checkMemberPermission } from '@/lib/queries/permssions.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import { Project, User } from '@/types/db.types';

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
