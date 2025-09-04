import { Active, DataRef, Over } from '@dnd-kit/core';
import { TaskDragData } from '@/components/dnd-kanban-board/task-card';
import { KanbanColumnDragData } from '@/types/types';

type DraggableData = KanbanColumnDragData | TaskDragData;

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined,
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === 'Column' || data?.type === 'Task') {
    return true;
  }

  return false;
}
