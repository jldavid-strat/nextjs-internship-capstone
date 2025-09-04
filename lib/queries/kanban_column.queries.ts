import 'server-only';
import { KanbanColumn, Project, ProjectKanbanColumn } from '@/types/db.types';
import { db } from '../db/connect_db';
import { kanbanColumns, projectKanbanColumns, projects } from '../db/schema/schema';
import { and, eq, max } from 'drizzle-orm';

export async function getKanbanColumnByName(kanbanName: KanbanColumn['id']) {
  const kanbanColumn = await db.query.kanbanColumns.findFirst({
    where: (kanbanColumns, { eq }) => eq(kanbanColumns.name, kanbanName),
  });

  return kanbanColumn;
}

export async function getCompletedColumnId(
  projectId: Project['id'],
): Promise<ProjectKanbanColumn['id'] | undefined> {
  const [completedColumnId] = await db
    .select({
      id: projectKanbanColumns.id,
    })
    .from(projectKanbanColumns)
    .innerJoin(projects, eq(projects.id, projectId))
    .innerJoin(kanbanColumns, eq(kanbanColumns.id, projectKanbanColumns.kanbanColumnId))
    .where(eq(kanbanColumns.name, 'completed'))
    .limit(1);

  return completedColumnId?.id;
}

export async function getKanbanColumnsByProjectId(projectId: Project['id']) {
  try {
    const PKanbanColumns = await db
      .select({
        projectColumnId: projectKanbanColumns.id,
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

export async function getColumnById(projectColumnId: ProjectKanbanColumn['id']) {
  try {
    const [columnData] = await db
      .select({
        kanbanColumnId: kanbanColumns.id,
        projectColumnId: projectKanbanColumns.id,
        name: kanbanColumns.name,
        description: projectKanbanColumns.description,
      })
      .from(projectKanbanColumns)
      .innerJoin(kanbanColumns, eq(kanbanColumns.id, projectKanbanColumns.kanbanColumnId))
      .where(eq(projectKanbanColumns.id, projectColumnId));

    console.log('projectColumnId', projectColumnId);
    console.log('columnData', columnData);

    return columnData;
  } catch (error) {
    console.error(error);
  }
}

export async function getProjectColumnByName(
  projectId: Project['id'],
  kanbanName: KanbanColumn['name'],
) {
  try {
    const [columnData] = await db
      .select({
        kanbanColumnId: kanbanColumns.id,
        projectColumnId: projectKanbanColumns.id,
        name: kanbanColumns.name,
      })
      .from(projectKanbanColumns)
      .innerJoin(kanbanColumns, eq(kanbanColumns.id, projectKanbanColumns.kanbanColumnId))
      .where(
        and(eq(projectKanbanColumns.projectId, projectId), eq(kanbanColumns.name, kanbanName)),
      );

    return columnData;
  } catch (error) {
    console.error(error);
  }
}
