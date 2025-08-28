import { Project } from '@/types/db.types';
import { db } from '../db/connect_db';
import { projects, projectTeams } from '@/lib/db/schema/schema';
import { eq } from 'drizzle-orm';

export async function getProjectTeams(projectId: Project['id']) {
  try {
    const projectTeamList = await db
      .select({
        teamId: projectTeams.id,
        teamName: projectTeams.teamName,
      })
      .from(projects)
      .innerJoin(projectTeams, eq(projects.id, projectTeams.projectId))
      .where(eq(projects.id, projectId));

    return projectTeamList;
  } catch (error) {
    console.error(error);
  }
}
