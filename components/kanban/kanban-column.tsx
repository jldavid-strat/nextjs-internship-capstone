'use client';

import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { useDndContext } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useMemo } from 'react';
import { cva } from 'class-variance-authority';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Project, Task } from '@/types/db.types';
import { ColumnQueryResult, KanbanColumnDragData } from '@/types/types';
import CreateTaskButton from '../buttons/create-task-button';
import { TaskCard } from './task-card';
import { cn } from '@/lib/utils/shadcn-utils';

interface BoardColumnProps {
  column: ColumnQueryResult;
  isOverlay?: boolean;
  tasks: Task[];
}

export function KanbanColumn({ column, isOverlay, tasks }: BoardColumnProps) {
  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);
  const { over } = useDndContext();
  const isOverColumn = over?.id === column.kanbanColumnId;

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.kanbanColumnId,
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
    'h-[500px] max-h-[800px] w-[350px] max-w-full bg-primary-foreground flex flex-col flex-shrink-0 snap-center',
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
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
      })}
    >
      <CardHeader className="border-border flex flex-row items-center gap-2 border-b-2 p-4 text-left font-semibold">
        <Button
          variant={'ghost'}
          {...attributes}
          {...listeners}
          className="text-primary/50 relative -ml-2 h-auto cursor-grab"
        >
          <span className="sr-only">{`Move column: ${column.name}`}</span>
          <GripVertical />
        </Button>
        <div className="flex flex-col gap-1">
          <span className="mr-auto"> {column.name}</span>
          <span className="text-muted-foreground mr-auto text-xs"> {column.description}</span>
        </div>
      </CardHeader>
      <ScrollArea>
        <CardContent className="flex flex-grow flex-col gap-2 p-2">
          <SortableContext items={tasksIds}>
            {tasks.length > 0 ? (
              tasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <div
                className={cn(
                  'flex flex-1 items-center justify-center rounded-lg border-2 border-dashed p-6 text-sm transition-colors',
                  isOverColumn
                    ? 'border-primary text-primary'
                    : 'border-muted-foreground/30 text-muted-foreground',
                )}
              >
                Drop tasks here
              </div>
            )}
          </SortableContext>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

export function ColumnContainer({ children }: { children: React.ReactNode }) {
  const dndContext = useDndContext();

  const variations = cva('px-2 md:px-0 flex lg:justify-center pb-4', {
    variants: {
      dragging: {
        default: 'snap-x snap-mandatory',
        active: 'snap-none',
      },
    },
  });

  return (
    <ScrollArea
      className={variations({
        dragging: dndContext.active ? 'active' : 'default',
      })}
    >
      <div className="flex flex-row gap-4">{children}</div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
