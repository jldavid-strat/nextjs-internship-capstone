'use server';
import { DEFAULT_COLUMN_NAMES, DEFAULT_COLUMNS_DATA } from '@/constants/columns';
import { DatabaseOperationError, UnauthorizedError } from '@/constants/error';
import { ACTIONS, RESOURCES } from '@/constants/permissions';
import { db, DBTransaction } from '@/lib/db/connect_db';
import { kanbanColumns, projectKanbanColumns } from '@/lib/db/schema/schema';
import { serverEvents } from '@/lib/events/event-emitter';
import {
  getColumnById,
  getKanbanColumnByName,
  getKanbanColumnsByProjectId,
  getMaxNumColumnPositions,
} from '@/lib/queries/kanban_column.queries';
import { checkMemberPermission } from '@/lib/queries/permssions.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import getDataDiff from '@/lib/utils/data_diff';
import { getErrorMessage } from '@/lib/utils/error.utils';
import {
  FormKanbanColumnSchema,
  InsertKanbanColumnSchema,
} from '@/lib/validations/kanban-column.validations';
import { KanbanColumn, Project, ProjectKanbanColumn } from '@/types/db.types';
import { ActionResult, ReorderColumnDataType } from '@/types/types';
import { and, eq, inArray, sql, SQL } from 'drizzle-orm';

export async function createDefaultKanbanColumns(
  projectId: Project['id'],
  dbTransaction?: DBTransaction,
): Promise<ActionResult> {
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
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to initialize default kanban columns',
    };
  }
}

export async function addKanbanColumn(
  projectId: Project['id'],
  previousState: unknown,
  columnData: FormData,
): Promise<ActionResult> {
  try {
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.KANBAN_COLUMN,
      ACTIONS.CREATE,
    );

    if (!isAuthorize) throw new UnauthorizedError('User is unauthorized to add kanban columns');

    const currentMaxPosition = (await getMaxNumColumnPositions(projectId)) ?? null;

    let position = 0;

    if (currentMaxPosition !== null) position = currentMaxPosition + 1;

    const validatedData = InsertKanbanColumnSchema.parse({
      name: columnData.get('name') as string,
      description: columnData.get('description') as string,
      projectId: projectId,
      position: position,
    });
    console.log('validatedData', validatedData);

    // check if column name already exist
    const existingColumn = await getKanbanColumnByName(validatedData.name);
    let columnId = existingColumn === undefined ? null : existingColumn.id;
    console.log('columnId', columnId);

    // insert new label name if it does not exist
    if (!columnId) {
      const [columnResult] = await db
        .insert(kanbanColumns)
        .values({
          name: validatedData.name.toLowerCase().trim(),
        })
        .returning({ id: kanbanColumns.id });

      columnId = columnResult.id;
      console.log('insert new kanban name');
    }

    // insert into column in current project
    console.log('insert kanban in current project');
    await db.insert(projectKanbanColumns).values({
      ...validatedData,
      kanbanColumnId: columnId,
      isCustom: true,
    });

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
export async function updateKanbanColumn(
  projectId: Project['id'],
  projectColumnId: ProjectKanbanColumn['id'],
  kanbanColumnId: KanbanColumn['id'],
  previousState: unknown,
  columnData: FormData,
): Promise<ActionResult> {
  try {
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.KANBAN_COLUMN,
      ACTIONS.CREATE,
    );
    if (!isAuthorize) throw new UnauthorizedError('User is unauthorized to update kanban columns');

    const originalKanbanColumnData = await getColumnById(projectColumnId);

    if (!originalKanbanColumnData)
      throw new DatabaseOperationError('Something went wrong. Please try again');

    const originalData = {
      name: originalKanbanColumnData.name,
      description: originalKanbanColumnData.description ?? '',
    };

    const validatedData = FormKanbanColumnSchema.parse({
      name: columnData.get('name') as string,
      description: columnData.get('description') as string,
    });
    console.log('validatedData', validatedData);

    const changes = getDataDiff(originalData, validatedData);

    if (changes === null) throw new Error('No changes made');

    let newColumnId = kanbanColumnId;

    if (changes.name) {
      // insert current data has a new label name
      const [columnResult] = await db
        .insert(kanbanColumns)
        .values({
          name: validatedData.name.toLowerCase().trim(),
        })
        // if it already exist do nothing an retain the original name
        .onConflictDoUpdate({
          target: kanbanColumns.name,
          // don't actually update anything, just return the ID
          set: {
            // keeps the same name
            name: sql`excluded.name`,
          },
        })
        .returning({ id: kanbanColumns.id });

      // always gets ID (new or existing)
      newColumnId = columnResult.id;
    }

    // update the description in project column table
    await db
      .update(projectKanbanColumns)
      .set({
        // also update columnId in case it changed to another name
        kanbanColumnId: newColumnId,
        description: validatedData.description,
        updatedAt: new Date(),
      })
      .where(eq(projectKanbanColumns.id, projectColumnId));

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

export async function deleteKanbanColumn(
  projectColumnId: ProjectKanbanColumn['id'],
  projectId: Project['id'],
): Promise<ActionResult> {
  try {
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.KANBAN_COLUMN,
      ACTIONS.DELETE,
    );

    if (!isAuthorize) throw new UnauthorizedError('User is unauthorized to delete kanban columns');
    console.log('to delete projectColumnId', projectColumnId);
    console.log('deleting column', projectColumnId);

    await db
      .delete(projectKanbanColumns)
      .where(
        and(
          eq(projectKanbanColumns.projectId, projectId),
          eq(projectKanbanColumns.id, projectColumnId),
          eq(projectKanbanColumns.isCustom, true),
        ),
      );

    console.log('column deleted', projectColumnId);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function reorderKanbanColumns(
  reorderColumnData: ReorderColumnDataType,
): Promise<ActionResult> {
  try {
    const { projectId, projectColumnId, newPosition } = reorderColumnData;

    console.log('Reorder Column Data', reorderColumnData);
    const currentUserId = await getCurrentUserId();

    const { isAuthorize } = await checkMemberPermission(
      currentUserId,
      projectId,
      RESOURCES.KANBAN_COLUMN,
      ACTIONS.UPDATE,
    );

    if (!isAuthorize) throw new UnauthorizedError('User is unauthorized to reorder kanban columns');

    const { success, data: currentProjectColumn } = await getKanbanColumnsByProjectId(projectId);

    if (!success || !currentProjectColumn)
      throw new Error('Something went wrong. Please try again');

    const columnToMove = currentProjectColumn.find((k) => k.projectColumnId === projectColumnId);

    if (!columnToMove) {
      return { success: false, error: 'Column not found' };
    }
    // assumes order is always consecutive
    const reorderedKanbanColumnsPosition = currentProjectColumn
      .filter((col) => col.projectColumnId !== projectColumnId)
      .toSpliced(newPosition, 0, columnToMove)
      .map((col, index) => ({
        id: col.projectColumnId,
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
    const kanbanColumnIds: Array<ProjectKanbanColumn['id']> = [];

    columnSqlChunks.push(sql`case`);
    for (const kanbanColumn of reorderedKanbanColumnsPosition) {
      columnSqlChunks.push(
        sql`when ${projectKanbanColumns.id} = ${kanbanColumn.id} then ${kanbanColumn.newColumnPosition}`,
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
          inArray(projectKanbanColumns.id, kanbanColumnIds),
        ),
      );

    // emit event to update kanban column
    serverEvents.emit('reorder-kanban-columns', {
      type: 'reorder-kanban-columns',
      userId: currentUserId,
      columnId: projectColumnId,
      newPosition: newPosition,
      projectId: projectId,
    });
    return {
      success: true,
    };
  } catch (error) {
    console.error('Reordering columns error: ', error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
