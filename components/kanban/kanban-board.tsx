'use client';

import { useKanbanColumns, useTaskList } from '@/hooks/use-kanban';
import { useMoveTask, useReorderColumns } from '@/hooks/use-move-data';
import { coordinateGetter } from '@/lib/utils/dnd/dnd_keyboard_preset';
import { Project, Task } from '@/types/db.types';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useEffect, useMemo, useState } from 'react';
import { KanbanColumn } from './kanban-column';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { hasDraggableData } from '@/lib/utils/dnd/dnd_utils';
import { TaskCard } from './task-card';
import { ColumnQueryResult, TaskCardData, TaskDragData } from '@/types/types';
import useKanbanEvents from '@/hooks/use-kanban-events';

export function DBKanbanBoard({ projectId }: { projectId: Project['id'] }) {
  // connect to Kanban SSE
  useKanbanEvents(projectId);

  const {
    columns: kanbanColumns,
    isLoading: isKanbanColumnLoading,
    isSuccess: isKanbanColumnSuccess,
  } = useKanbanColumns(projectId);

  const { tasks: taskList, isSuccess: isTaskListSuccess } = useTaskList(projectId);
  const moveTaskMutation = useMoveTask(projectId);
  const reorderColumnsMutation = useReorderColumns(projectId);

  const [columns, setColumns] = useState<ColumnQueryResult[]>([]);
  const [tasks, setTasks] = useState<TaskCardData[]>([]);

  const columnsId = useMemo(() => columns.map((col) => col.projectColumnId), [columns]);

  const statusList = useMemo(() => columns.map((col) => col.name), [columns]);

  const [activeColumn, setActiveColumn] = useState<ColumnQueryResult | null>(null);
  const [activeTask, setActiveTask] = useState<TaskCardData | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 0.5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: coordinateGetter }),
  );

  // sync server-kanban columns into our local columns state once loaded
  useEffect(() => {
    if (isKanbanColumnSuccess && kanbanColumns) {
      setColumns(kanbanColumns);
    }
  }, [isKanbanColumnSuccess, kanbanColumns]);

  useEffect(() => {
    if (isTaskListSuccess && taskList) {
      setTasks(taskList);
    }
  }, [isTaskListSuccess, taskList]);

  // debug log - optional
  useEffect(() => {
    // reduce noise: log when activeColumn changes only
    console.log('Active Column ->', activeColumn?.projectColumnId ?? null);
  }, [activeColumn]);

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === 'Column') {
      setActiveColumn(data.column);
      return;
    }
    if (data?.type === 'Task') {
      setActiveTask(data.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active } = event;
    const activeId = active?.id;
    if (!activeId) return;

    if (!hasDraggableData(active)) return;
    const activeData = active.data.current;
    if (!activeData) return;

    const isTaskMutation = activeData?.type === 'Task';
    const isColumnMutation = activeData?.type === 'Column';

    if (isTaskMutation) {
      const activeTaskData = activeData.task as Task;
      const targetColumn = kanbanColumns.find(
        (col) => col.projectColumnId === activeTaskData.projectkanbanColumnId,
      ) as ColumnQueryResult;
      if (!targetColumn) return;

      const originalTaskData = taskList.find((t) => t.id === activeTaskData.id);
      if (!originalTaskData) return;

      const hasPositionChange = originalTaskData.position !== activeTaskData.position;
      const hasColumnChange =
        originalTaskData.projectkanbanColumnId !== targetColumn.projectColumnId;

      if (hasPositionChange || hasColumnChange) {
        moveTaskMutation.mutateAsync({
          taskId: activeTaskData.id,
          projectId,
          newPosition: activeTaskData.position,
          targetColumnId: targetColumn.projectColumnId,
          sourceColumnId: originalTaskData.projectkanbanColumnId,
        });
      }
      return;
    } else if (isColumnMutation) {
      const activeColumnData = activeData.column as ColumnQueryResult;

      // compute positions against our **original server kanbanColumns** for stability,
      // or use columns state
      const newColumnPosition = columns.findIndex(
        (col) => col.projectColumnId === activeColumnData.projectColumnId,
      );
      const originalColumnPosition = kanbanColumns.findIndex(
        (col) => col.projectColumnId === activeColumnData.projectColumnId,
      );

      if (newColumnPosition !== originalColumnPosition) {
        reorderColumnsMutation.mutateAsync({
          projectColumnId: activeColumnData.projectColumnId,
          newPosition: newColumnPosition,
          projectId,
        });
      }
      return;
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActiveATask = activeData?.type === 'Task';
    const isOverATask = overData?.type === 'Task';
    const isActiveAColumn = activeData?.type === 'Column';
    const isOverAColumn = overData?.type === 'Column';

    if (!isActiveATask && !isActiveAColumn) return;

    // Column reordering: update *local* columns state (which will render)
    if (isActiveAColumn && isOverAColumn) {
      setColumns((cols) => {
        const activeIdx = cols.findIndex((c) => c.projectColumnId === activeId);
        const overIdx = cols.findIndex((c) => c.projectColumnId === overId);
        if (activeIdx === -1 || overIdx === -1 || activeIdx === overIdx) return cols;
        return arrayMove(cols, activeIdx, overIdx);
      });
      return;
    }

    // Task -> Task reordering (within same column or moving between columns)
    if (isActiveATask && isOverATask) {
      setTasks((prev) => {
        const activeTask = activeData.task as TaskDragData['task'];
        const overTask = overData.task as Task;

        // same column reorder
        if (activeTask.projectkanbanColumnId === overTask.projectkanbanColumnId) {
          const columnTasks = prev
            .filter((t) => t.projectkanbanColumnId === activeTask.projectkanbanColumnId)
            .sort((a, b) => a.position - b.position);

          const aIdx = columnTasks.findIndex((t) => t.id === activeTask.id);
          const oIdx = columnTasks.findIndex((t) => t.id === overTask.id);
          if (aIdx === -1 || oIdx === -1) return prev;

          const reordered = arrayMove(columnTasks, aIdx, oIdx).map((task, index) => ({
            ...task,
            position: index,
          }));

          return prev.map((task) => {
            const updated = reordered.find((r) => r.id === task.id);
            return updated ?? task;
          });
        }

        // moving to another column
        {
          const sourceTasks = prev
            .filter(
              (t) =>
                t.projectkanbanColumnId === activeTask.projectkanbanColumnId &&
                t.id !== activeTask.id,
            )
            .sort((a, b) => a.position - b.position)
            .map((task, index) => ({ ...task, position: index }));

          const targetTasks = prev
            .filter((t) => t.projectkanbanColumnId === overTask.projectkanbanColumnId)
            .sort((a, b) => a.position - b.position);

          const movedTask = {
            ...activeTask,
            projectkanbanColumnId: overTask.projectkanbanColumnId,
            position: overTask.position,
          };
          const insertAt = targetTasks.findIndex((t) => t.id === overTask.id);
          targetTasks.splice(insertAt, 0, movedTask);

          const reindexedTarget = targetTasks.map((task, index) => ({ ...task, position: index }));

          const otherTasks = prev.filter(
            (t) =>
              t.projectkanbanColumnId !== activeTask.projectkanbanColumnId &&
              t.projectkanbanColumnId !== overTask.projectkanbanColumnId,
          );

          return [...sourceTasks, ...reindexedTarget, ...otherTasks];
        }
      });
      return;
    }

    // Task -> Column (drop into empty area of column)
    if (isActiveATask && isOverAColumn) {
      setTasks((prev) => {
        const activeTask = activeData.task as TaskDragData['task'];
        const targetColumnId = overId;

        if (activeTask.projectkanbanColumnId === targetColumnId) return prev;

        const sourceTasks = prev
          .filter(
            (t) =>
              t.projectkanbanColumnId === activeTask.projectkanbanColumnId &&
              t.id !== activeTask.id,
          )
          .sort((a, b) => a.position - b.position)
          .map((task, idx) => ({ ...task, position: idx }));

        const targetTasks = prev
          .filter((t) => t.projectkanbanColumnId === targetColumnId)
          .sort((a, b) => a.position - b.position);

        const movedTask = {
          ...activeTask,
          projectkanbanColumnId: targetColumnId,
          position: targetTasks.length,
        };

        const newTarget = [...targetTasks, movedTask].map((task, idx) => ({
          ...task,
          position: idx,
        }));
        const otherTasks = prev.filter(
          (t) =>
            t.projectkanbanColumnId !== activeTask.projectkanbanColumnId &&
            t.projectkanbanColumnId !== targetColumnId,
        );

        return [...sourceTasks, ...newTarget, ...otherTasks];
      });
      return;
    }
  }

  if (isKanbanColumnLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-lg">Loading kanban board...</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragCancel={() => {
        setActiveColumn(null);
        setActiveTask(null);
      }}
      collisionDetection={rectIntersection}
    >
      <div className="flex flex-1 flex-row gap-2 overflow-y-auto px-2">
        <SortableContext items={columnsId}>
          {columns.map((col) => (
            <KanbanColumn
              key={col.projectColumnId}
              column={col}
              tasks={tasks}
              projectId={projectId}
              statusList={statusList}
            />
          ))}
        </SortableContext>
      </div>

      {typeof window !== 'undefined' &&
        createPortal(
          <DragOverlay>
            {activeColumn && (
              <KanbanColumn
                key={activeColumn.projectColumnId}
                isOverlay
                column={activeColumn}
                tasks={tasks}
                projectId={projectId}
                statusList={statusList}
              />
            )}
            {activeTask && (
              <TaskCard
                key={activeTask.id}
                taskData={activeTask}
                kanbanData={{
                  projectId: projectId,
                  taskId: activeTask.id,
                  statusList: statusList,
                }}
                isOverlay
              />
            )}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
}
