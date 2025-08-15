import { Project } from '@/types/db.types';
import { db } from '../db/connect_db';
import { kanbanColumns, projectKanbanColumns } from '../db/schema/schema';
import { eq } from 'drizzle-orm';
import { projects } from '@/migrations/schema';

export async function createDefaultKanbanColumns(projectId: Project['id']) {
  try {
    const { 0: backlog, 1: completed } = await Promise.all([
      getKanbanColumnByName('Backlog'),
      getKanbanColumnByName('Completed'),
    ]);

    await db.insert(projectKanbanColumns).values([
      {
        kanbanColumnId: backlog.id,
        projectId: projectId,
        description: "Tasks that hasn't been started",
        position: 0,
        isCustom: false,
      },
      {
        kanbanColumnId: completed.id,
        projectId: projectId,
        position: 1,
        isCustom: false,
      },
    ]);
    return {
      success: true,
      message: 'Successfully created default kanban columns',
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed to initialize default kanban columns',
    };
  }
}

export async function getKanbanColumnByName(kanbanName: string) {
  const result = await db.select().from(kanbanColumns).where(eq(kanbanColumns.name, kanbanName));

  return result[0];
}

export async function getKanbanColumnsByProjectId(projectId: Project['id']) {
  try {
    const PKanbanColumns = await db
      .select({
        kanbanColumnId: kanbanColumns.id,
        name: kanbanColumns.name,
        description: projectKanbanColumns.description,
        position: projectKanbanColumns.position,
        color: projectKanbanColumns.color,
      })
      .from(kanbanColumns)
      .innerJoin(projectKanbanColumns, eq(kanbanColumns.id, projectKanbanColumns.kanbanColumnId))
      .innerJoin(projects, eq(projects.id, projectKanbanColumns.projectId))
      .where(eq(projects.id, projectId))
      .orderBy(projectKanbanColumns.position);

    return {
      success: true,
      message: 'Succesfully fetched kanban columns',
      data: PKanbanColumns,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed to fetch kanban columns',
    };
  }
}
