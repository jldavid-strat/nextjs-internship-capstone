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
import { KanbanColumn, ColumnContainer } from './kanban-column';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { hasDraggableData } from '@/lib/utils/dnd/dnd_utils';
import { TaskCard } from './task-card';
import { ColumnQueryResult } from '@/types/types';
import useKanbanEvents from '@/hooks/use-kanban-events';

export function DBKanbanBoard({ projectId }: { projectId: Project['id'] }) {
  // connect to Kanban SSE
  // useKanbanEvents(projectId);

  const {
    columns: kanbanColumns,
    isLoading: isKanbanColumnLoading,
    isSuccess: isKanbanColumnSuccess,
  } = useKanbanColumns(projectId);
  const { tasks: taskList, isSuccess: isTaskListSuccess } = useTaskList(projectId);
  const moveTaskMutation = useMoveTask(projectId);
  const reorderColumnsMutation = useReorderColumns(projectId);

  const [columns, setColumns] = useState<ColumnQueryResult[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const columnsId = useMemo(() => kanbanColumns.map((col) => col.kanbanColumnId), [kanbanColumns]);

  const statusList = useMemo(() => kanbanColumns.map((col) => col.name), [kanbanColumns]);

  const [activeColumn, setActiveColumn] = useState<ColumnQueryResult | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: coordinateGetter,
    }),
  );

  useEffect(() => {
    if (isKanbanColumnSuccess && kanbanColumns) {
      console.log('kanbanColumns', kanbanColumns);
      setColumns(kanbanColumns);
    }
  }, [isKanbanColumnSuccess, kanbanColumns]);

  useEffect(() => {
    if (isTaskListSuccess && taskList) {
      setTasks(taskList);
    }
  }, [isTaskListSuccess, taskList]);

  useEffect(() => {
    const BacklogTaskOrder = tasks
      .filter((t) => t.kanbanColumnId === '8f19d707-4a90-43ff-804e-93dd72d7a6e5')
      .map((t) => ({
        taskTitle: t.title,
        postion: t.position,
      }))
      .sort((a, b) => a.postion - b.postion);
    const CompletedTaskOrder = tasks
      .filter((t) => t.kanbanColumnId === '4c4822c5-536d-41b4-b20d-2ea27282be96')
      .map((t) => ({
        taskTitle: t.title,
        postion: t.position,
      }))
      .sort((a, b) => a.postion - b.postion);
    console.log('Active Column', activeColumn);
    console.log('Backlog task Order', BacklogTaskOrder);
    console.log('Completed task Order', CompletedTaskOrder);
  }, [tasks, activeColumn]);

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

    const activeId = active.id;
    if (!activeId) return;
    console.log('ACTIVE ID', activeId);

    console.log('Data has been dropped');

    if (!hasDraggableData(active)) return;
    const activeData = active.data.current;

    console.log('Active Data', activeData);

    if (!activeData) return;

    const isTaskMutation = activeData?.type === 'Task';
    const isColumnMutation = activeData?.type === 'Column';

    // handled task mutation (reorder in same column or moved to another column)
    if (isTaskMutation) {
      const activeTask = activeData.task as Task;

      const targetColumn = kanbanColumns.find(
        (col) => col.kanbanColumnId === activeTask.kanbanColumnId,
      ) as ColumnQueryResult;

      const targetColumnId = targetColumn.kanbanColumnId;
      const originalTaskData = taskList.find((t) => t.id === activeTask.id);

      if (!originalTaskData) return;

      console.log('DATA TO BE SENT TO SERVER ACTION');
      console.log('taskId:', activeTask.id);
      console.log('projectId:', projectId);
      console.log('sourceColumnId:', originalTaskData.kanbanColumnId);
      console.log('targetColumnId:', targetColumnId);
      console.log('newPosition:', activeTask.position);
      console.log('oldPosition:', originalTaskData.position);

      const hasPositionChange = originalTaskData.position !== activeTask.position;
      const hasColumnChange = originalTaskData.kanbanColumnId !== targetColumnId;

      if (hasPositionChange || hasColumnChange)
        moveTaskMutation.mutateAsync({
          taskId: activeTask.id,
          projectId: projectId,
          newPosition: activeTask.position,
          targetColumnId: targetColumnId,
          sourceColumnId: originalTaskData.kanbanColumnId,
        });

      return;
    }
    // handle column reordering mutation
    else if (isColumnMutation) {
      const activeColumn = activeData.column as ColumnQueryResult;

      const newColumnPosition = columns.findIndex(
        (col) => col.kanbanColumnId === activeColumn.kanbanColumnId,
      );
      const originalColumnPosition = kanbanColumns.findIndex(
        (col) => col.kanbanColumnId === activeColumn.kanbanColumnId,
      );
      if (newColumnPosition !== originalColumnPosition) {
        reorderColumnsMutation.mutateAsync({
          columnId: activeColumn.kanbanColumnId,
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

    console.log('Active Data', activeData);
    console.log('Over data', overData);

    const isActiveATask = activeData?.type === 'Task';
    const isOverATask = overData?.type === 'Task';

    const isActiveAColumn = activeData?.type === 'Column';
    const isOverAColumn = overData?.type === 'Column';

    if (!isActiveATask && !isActiveAColumn) return;
    // handle column reordering
    if (isActiveAColumn && isOverAColumn) {
      setColumns((columns) => {
        const activeColumnIndex = columns.findIndex((col) => col.kanbanColumnId === activeId);
        const overColumnIndex = columns.findIndex((col) => col.kanbanColumnId === overId);
        const reorderedColumns = arrayMove(columns, activeColumnIndex, overColumnIndex);
        console.log('Reordered columns', reorderedColumns);
        return reorderedColumns;
      });
    }
    // handle dropping Task onto task
    else if (isActiveATask && isOverATask) {
      console.log('Im dropping a Task over another Task');
      setTasks((tasks) => {
        const activeTask = activeData.task as Task;
        const overTask = overData.task as Task;

        // handles reordering in same column
        if (activeTask.kanbanColumnId === overTask.kanbanColumnId) {
          const columnTasks = tasks
            .filter((t) => t.kanbanColumnId === activeTask.kanbanColumnId)
            .sort((a, b) => a.position - b.position);

          const activeIndex = columnTasks.findIndex((t) => t.id === activeTask.id);
          const overIndex = columnTasks.findIndex((t) => t.id === overTask.id);

          if (activeIndex === -1 || overIndex === -1) return tasks;

          // reorder within the same column and update positions
          const reorderedColumnTasks = arrayMove(columnTasks, activeIndex, overIndex).map(
            (task, index) => ({
              ...task,
              position: index,
            }),
          );

          // replace updated column tasks in the original tasks
          return tasks.map((task) => {
            const updatedTask = reorderedColumnTasks.find((ut) => ut.id === task.id);
            return updatedTask || task;
          });
        }

        // move task to another column
        else {
          // get task from original column without the selected task
          const sourceTasks = tasks
            .filter((t) => t.kanbanColumnId === activeTask.kanbanColumnId && t.id !== activeTask.id)
            .sort((a, b) => a.position - b.position)
            .map((task, index) => ({ ...task, position: index }));

          const targetTasks = tasks
            .filter((t) => t.kanbanColumnId === overTask.kanbanColumnId)
            .sort((a, b) => a.position - b.position);

          const movedTask = {
            ...activeTask,
            kanbanColumnId: overTask.kanbanColumnId,
            position: overTask.position,
          };

          // insert selected task on target tasks
          const insertTaskIndex = targetTasks.findIndex((t) => t.id === overTask.id);
          targetTasks.splice(insertTaskIndex, 0, movedTask);

          const reindexedTargetTasks = targetTasks.map((task, index) => ({
            ...task,
            position: index,
          }));

          // get excluded task from the reordering process
          const otherTasks = tasks.filter(
            (t) =>
              t.kanbanColumnId !== activeTask.kanbanColumnId &&
              t.kanbanColumnId !== overTask.kanbanColumnId,
          );

          // merge all
          return [...sourceTasks, ...reindexedTargetTasks, ...otherTasks];
        }
      });
    }

    // moving task to type 'Column'
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeTask = activeData.task as Task;
        const targetColumnId = overId as string;

        // in the same column
        if (activeTask.kanbanColumnId === targetColumnId) {
          return tasks;
        }

        const sourceTasks = tasks
          .filter((t) => t.kanbanColumnId === activeTask.kanbanColumnId && t.id !== activeTask.id)
          .sort((a, b) => a.position - b.position)
          .map((task, index) => ({ ...task, position: index }));

        const targetTasks = tasks
          .filter((t) => t.kanbanColumnId === targetColumnId)
          .sort((a, b) => a.position - b.position);

        // add task to end
        const movedTask = {
          ...activeTask,
          kanbanColumnId: targetColumnId,
          position: targetTasks.length,
        };

        const newTargetTasks = [...targetTasks, movedTask].map((task, index) => ({
          ...task,
          position: index,
        }));

        const otherTasks = tasks.filter(
          (t) =>
            t.kanbanColumnId !== activeTask.kanbanColumnId && t.kanbanColumnId !== targetColumnId,
        );

        // merge all arrays
        return [...sourceTasks, ...newTargetTasks, ...otherTasks];
      });
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
      <ColumnContainer>
        <SortableContext items={columnsId}>
          {columns.map((col) => (
            <KanbanColumn
              key={col.kanbanColumnId}
              column={col}
              tasks={tasks
                .filter((task) => task.kanbanColumnId === col.kanbanColumnId)
                .sort((a, b) => a.position - b.position)}
              projectId={projectId}
              statusList={statusList}
            />
          ))}
        </SortableContext>
      </ColumnContainer>

      {typeof window !== 'undefined' &&
        createPortal(
          <DragOverlay>
            {activeColumn && (
              <KanbanColumn
                isOverlay
                column={activeColumn}
                key={activeColumn.kanbanColumnId}
                tasks={tasks
                  .filter((task) => task.kanbanColumnId === activeColumn.kanbanColumnId)
                  .sort((a, b) => a.position - b.position)}
                projectId={projectId}
                statusList={statusList}
              />
            )}
            {activeTask && <TaskCard key={activeTask.id} task={activeTask} isOverlay />}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
}
