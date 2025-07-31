import { eq } from 'drizzle-orm';
import { db } from '../db/connect_db';
import { team, teamMember, user } from '../db/schema';
import { queryResult } from '@/types';
import { Team, CreateTeam, User, UpdateTeam } from '@/types/db.types';

export async function createTeam(teamData: CreateTeam): Promise<queryResult> {
  try {
    await db.insert(team).values({
      name: teamData.name,
      description: teamData.description,
      projectId: teamData.projectId,
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
      .update(team)
      .set({
        name: teamData.name,
        description: teamData.description,
        projectId: teamData.projectId,
        color: teamData.color,
        createdBy: teamData.createdBy,
        createdAt: new Date(),
        updatedAt: teamData.updatedAt,
      })
      .where(eq(team.id, teamId));

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
    await db.delete(team).where(eq(team.id, teamId));

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
    const teams = await db
      .select()
      .from(user)
      .innerJoin(teamMember, eq(teamMember.userId, userId))
      .innerJoin(team, eq(team.id, teamMember.teamId));

    return { success: true, message: `Successfully retrieved teams`, data: teams };
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
      .from(user)
      .innerJoin(teamMember, eq(teamMember.userId, userId))
      .innerJoin(team, eq(teamMember.teamId, teamId));

    return { success: true, message: `Successfully retrieved team`, data: userTeam };
  } catch (error) {
    return {
      success: false,
      message: `Failed retrieved team. Error ${error}`,
      error: JSON.stringify(error),
    };
  }
}
