import { eq } from 'drizzle-orm';
import { db } from '../db/connect_db';
import { teams, teamMembers, users } from '../db/schema';
import { queryResult } from '@/types';
import { Team, CreateTeam, User, UpdateTeam } from '@/types/db.types';

export async function createTeam(teamData: CreateTeam): Promise<queryResult> {
  try {
    await db.insert(teams).values({
      name: teamData.name,
      description: teamData.description,
      color: teamData.color,
      createdBy: teamData.createdBy,
      createdAt: new Date(),
    });
    return { success: true, message: `Team successfully created` };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create team. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}

export async function updateTeam(
  teamId: Team['id'],
  teamData: UpdateTeam,
): Promise<queryResult> {
  try {
    await db
      .update(teams)
      .set({
        name: teamData.name,
        description: teamData.description,
        color: teamData.color,
        createdBy: teamData.createdBy,
        createdAt: new Date(),
        updatedAt: teamData.updatedAt,
      })
      .where(eq(teams.id, teamId));

    return { success: true, message: `Team successfully updated` };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update team. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}

export async function deleteTeam(teamId: Team['id']): Promise<queryResult> {
  try {
    await db.delete(teams).where(eq(teams.id, teamId));

    // TODO: also delete the records of team in teamMember

    return { success: true, message: `Team successfully deleted` };
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete team. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}

// retrieves teams where user is a member
export async function getUserTeams(userId: User['id']) {
  try {
    const teamList = await db
      .select()
      .from(users)
      .innerJoin(teamMembers, eq(teamMembers.userId, userId))
      .innerJoin(teams, eq(teams.id, teamMembers.teamId));

    return { success: true, message: `Successfully retrieved teams`, data: teamList };
  } catch (error) {
    return {
      success: false,
      message: `Failed retrieved teams. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}

// retrieve specific team of user
export async function getTeam(userId: Team['id'], teamId: Team['id']) {
  try {
    const userTeam = await db
      .select()
      .from(users)
      .innerJoin(teamMembers, eq(teamMembers.userId, userId))
      .innerJoin(teams, eq(teamMembers.teamId, teamId));

    return { success: true, message: `Successfully retrieved team`, data: userTeam };
  } catch (error) {
    return {
      success: false,
      message: `Failed retrieved team. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}
