import 'server-only';
import { KanbanColumn, Project } from '@/types/db.types';
import { db } from '../db/connect_db';
import { kanbanColumns, projectKanbanColumns, projects } from '../db/schema/schema';
import { and, eq, max } from 'drizzle-orm';

export async function getKanbanColumnByName(kanbanName: KanbanColumn['id']) {
  const kanbanColumn = await db.query.kanbanColumns.findFirst({
    where: (kanbanColumns, { eq }) => eq(kanbanColumns.name, kanbanName),
  });

  return kanbanColumn;
}

export async function getCompletedColumnId(): Promise<KanbanColumn['id'] | undefined> {
  const completedColumnId = await db.query.kanbanColumns.findFirst({
    columns: {
      id: true,
    },
    where: (kanbanColumns, { eq }) => eq(kanbanColumns.name, 'Completed'),
  });
  return completedColumnId?.id;
}

export async function getKanbanColumnsByProjectId(projectId: Project['id']) {
  try {
    const PKanbanColumns = await db
      .select({
        kanbanColumnId: kanbanColumns.id,
        name: kanbanColumns.name,
        isCustom: projectKanbanColumns.isCustom,
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

export async function getMaxNumColumnPositions(projectId: Project['id']) {
  try {
    const [result] = await db
      .select({
        maxNumPosition: max(projectKanbanColumns.position),
      })
      .from(projectKanbanColumns)
      .where(and(eq(projectKanbanColumns.projectId, projectId)));

    return result.maxNumPosition;
  } catch (error) {
    console.error(error);
  }
}
