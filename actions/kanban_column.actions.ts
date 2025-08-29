'use server';
import { DEFAULT_COLUMN_NAMES, DEFAULT_COLUMNS_DATA } from '@/constants/columns';
import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { db, DBTransaction } from '@/lib/db/connect_db';
import { kanbanColumns, projectKanbanColumns } from '@/lib/db/schema/schema';
import { serverEvents } from '@/lib/events/event-emitter';
import { getKanbanColumnsByProjectId } from '@/lib/queries/kanban_column.queries';
import { checkMemberPermission } from '@/lib/queries/permssions.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import { KanbanColumn, Project } from '@/types/db.types';
import { ReorderColumnDataType } from '@/types/types';
import { and, eq, inArray, sql, SQL } from 'drizzle-orm';

export async function createDefaultKanbanColumns(
  projectId: Project['id'],
  dbTransaction?: DBTransaction,
) {
  try {
    const dbContext = dbTransaction ?? db;
    const defaultColumns = await dbContext
      .select()
      .from(kanbanColumns)
      .where(inArray(kanbanColumns.name, DEFAULT_COLUMN_NAMES));

    const toInsertDefaultColumns = defaultColumns.map((col) => ({
      kanbanColumnId: col.id,
      projectId: projectId,
      description: DEFAULT_COLUMNS_DATA[col.name].description,
      position: DEFAULT_COLUMNS_DATA[col.name].defaultPosition,
      isCustom: false,
    }));

    await dbContext.insert(projectKanbanColumns).values(toInsertDefaultColumns);
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

export async function reorderKanbanColumns(reorderColumnData: ReorderColumnDataType) {
  try {
    const { projectId, columnId, newPosition } = reorderColumnData;

    console.log('Reorder Column Data', reorderColumnData);
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.KANBAN_COLUMN,
      ACTIONS.UPDATE,
    );

    if (!isAuthorize) throw new Error('User is unauthorized to reorder kanban columns');

    const { success, data: currentProjectColumn } = await getKanbanColumnsByProjectId(projectId);

    if (!success || !currentProjectColumn)
      throw new Error('Something went wrong. Please try again');

    const columnToMove = currentProjectColumn.find((k) => k.kanbanColumnId === columnId);

    if (!columnToMove) {
      return { success: false, message: 'Column not found' };
    }
    // assumes order is always consecutive
    const reorderedKanbanColumnsPosition = currentProjectColumn
      .filter((col) => col.kanbanColumnId !== columnId)
      .toSpliced(newPosition, 0, columnToMove)
      .map((col, index) => ({
        id: col.kanbanColumnId,
        oldPosition: col.position,
        newColumnPosition: index,
      }))
      .filter((update) => update?.oldPosition !== update.newColumnPosition);

    if (reorderedKanbanColumnsPosition.length === 0)
      throw new Error('Something went wrong. Please try again');

    console.log(JSON.stringify(reorderedKanbanColumnsPosition));

    // build case statement for updating multiple rows
    // method retrieved from: https://orm.drizzle.team/docs/guides/update-many-with-different-value
    const columnSqlChunks: SQL[] = [];
    const kanbanColumnIds: Array<KanbanColumn['id']> = [];

    columnSqlChunks.push(sql`case`);
    for (const kanbanColumn of reorderedKanbanColumnsPosition) {
      columnSqlChunks.push(
        sql`when ${projectKanbanColumns.kanbanColumnId} = ${kanbanColumn.id} then ${kanbanColumn.newColumnPosition}`,
      );
      kanbanColumnIds.push(kanbanColumn.id);
    }
    // fallback for unchanged columns
    columnSqlChunks.push(sql`else ${projectKanbanColumns.position}`);
    columnSqlChunks.push(sql`end`);

    const columnCaseSql: SQL = sql.join(columnSqlChunks, sql.raw(' '));

    await db
      .update(projectKanbanColumns)
      .set({
        position: columnCaseSql,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projectKanbanColumns.projectId, projectId),
          inArray(projectKanbanColumns.kanbanColumnId, kanbanColumnIds),
        ),
      );

    // emit event to update kanban column
    serverEvents.emit('reorder-kanban-columns', {
      type: 'reorder-kanban-columns',
      columnId: columnId,
      newPosition: newPosition,
      projectId: projectId,
    });
    return {
      success: true,
      message: 'Kanban Column has been move successfully ',
    };
  } catch (error) {
    console.error('Reordering columns error: ', error);
    return {
      success: false,
      error: JSON.stringify(error),
    };
  }
}
