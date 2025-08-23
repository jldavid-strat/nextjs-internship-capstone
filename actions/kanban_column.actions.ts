'use server';
import { db } from '@/lib/db/connect_db';
import { projectKanbanColumns } from '@/lib/db/schema/schema';
import { getKanbanColumnByName } from '@/lib/queries/kanban_column.queries';
import { Project } from '@/types/db.types';

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
