'use server';
import { MemberValue } from '@/components/ui/add-member-multiselect';
import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { db, DBTransaction } from '@/lib/db/connect_db';
import { projectMembers } from '@/lib/db/schema/schema';
import { checkMemberPermission } from '@/lib/queries/permssions.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import { AddProjectMemberSchema } from '@/lib/validations/project.validations';
import { Project, User } from '@/types/db.types';

// assumes that inputs are already validated
export async function addProjectMembers(
  projectId: Project['id'],
  members: MemberValue[],
  isNewProject: boolean,
  dbTransaction?: DBTransaction,
) {
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
