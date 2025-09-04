'use client';

import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { useDndContext } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import React, { useMemo } from 'react';
import { cva } from 'class-variance-authority';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical } from 'lucide-react';
import { Project } from '@/types/db.types';
import { ColumnQueryResult, KanbanColumnDragData, TaskCardData } from '@/types/types';
import { TaskCard } from './task-card';
import { cn } from '@/lib/utils/shadcn-utils';
import { AddTaskForm } from '../forms/add-task-modal-form';
import KanbanColumnDropdown from '../dropdowns/kanban-column-dropdown';

interface BoardColumnProps {
  column: ColumnQueryResult;
  projectId: Project['id'];
  statusList: string[];
  isOverlay?: boolean;
  tasks: TaskCardData[];
}

export function KanbanColumnBase({
  column,
  isOverlay,
  tasks,
  projectId,
  statusList,
}: BoardColumnProps) {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);
  const { over } = useDndContext();
  const isOverColumn = over?.id === column.projectColumnId;

  // you cannot edit or remove default columns
  const canEditColumn = column.isCustom;
  const columnTasks = useMemo(() => {
    return tasks
      .filter((task) => task.projectkanbanColumnId === column.projectColumnId)
      .sort((a, b) => a.position - b.position);
  }, [tasks, column.projectColumnId]);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.projectColumnId,
    data: {
      type: 'Column',
      column,
    } satisfies KanbanColumnDragData,
    attributes: {
      roleDescription: `Column: ${column.name}`,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva(
    'h-[700px] max-h-[800px] w-[350px] max-w-full bg-primary-foreground flex flex-col flex-shrink-0 snap-center',
    {
      variants: {
        dragging: {
          default: 'border-2 border-transparent',
          over: 'ring-2 opacity-30',
          overlay: 'ring-2 ring-primary',
        },
      },
    },
  );

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={variants({
          dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
        })}
      >
        <CardHeader className="border-border flex h-20 flex-row items-center justify-between gap-2 border-b-2 p-4 text-left font-semibold">
          <div className="flex flex-row items-center gap-2">
            <Button
              variant={'ghost'}
              {...attributes}
              {...listeners}
              className="text-primary/50 relative -ml-2 h-auto cursor-grab"
            >
              <span className="sr-only">{`Move column: ${column.name}`}</span>
              <GripVertical />
            </Button>
            <div className="flex flex-col">
              <span className="mr-auto capitalize"> {column.name}</span>
              <span className="text-muted-foreground mr-auto truncate text-xs">
                {' '}
                {column.description}
              </span>
            </div>
          </div>
          <div className="flex flex-row">
            {/* related modal overlay */}
            <AddTaskForm
              kanbanData={{
                projectId: projectId,
                projectColumnId: column.projectColumnId,
                kanbanName: column.name,
                statusList: statusList,
              }}
            />
            {canEditColumn && (
              <KanbanColumnDropdown
                kanbanData={{
                  kanbanColumnId: column.kanbanColumnId,
                  projectId: projectId,
                  projectColumnId: column.projectColumnId,
                  name: column.name,
                  description: column.description,
                  position: column.position,
                  isCustom: column.isCustom,
                }}
              />
            )}
          </div>
        </CardHeader>
        <div className="flex-1 overflow-y-auto">
          <CardContent className="flex flex-grow flex-col gap-2 p-2">
            <SortableContext items={tasksIds}>
              {columnTasks.length > 0 ? (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    taskData={task}
                    kanbanData={{
                      projectId: projectId,
                      statusList: statusList,
                      taskId: task.id,
                    }}
                  />
                ))
              ) : (
                <div
                  className={cn(
                    'flex flex-1 items-center justify-center rounded-lg bg-transparent p-6 text-sm transition-colors',
                    isOverColumn
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground/30 text-muted-foreground',
                  )}
                >
                  No task here
                </div>
              )}
            </SortableContext>
          </CardContent>
        </div>
      </Card>
    </>
  );
}
export const KanbanColumn = React.memo(KanbanColumnBase);
