'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { cva } from 'class-variance-authority';
import { Badge } from '@/components/ui/badge';
import { cn } from '../../lib/utils/shadcn-utils';
import { Task } from '@/types/db.types';
import { TaskDragData } from '@/types/types';
import ViewTaskDetailButton from '../view-task-detail-button';

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}
export function TaskCard({ task, isOverlay }: TaskCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: 'Task',
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva('', {
    variants: {
      dragging: {
        over: 'ring-2 opacity-30',
        overlay: 'ring-2 ring-primary',
      },
    },
  });

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={cn(
        'cursor-grab',
        variants({
          dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
        }),
      )}
    >
      <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap">
        <Badge
          variant="outline"
          className={cn(
            'text-xs font-medium',
            task.priority === 'high' && 'border-red-500 bg-red-50 text-red-700',
            task.priority === 'medium' && 'border-yellow-500 bg-yellow-50 text-yellow-700',
            task.priority === 'low' && 'border-green-500 bg-green-50 text-green-700',
          )}
        >
          {task.priority}
        </Badge>
        <p>{task.title}</p>

        <div className="flex items-center space-x-2">
          <div className="bg-blue_munsell-500 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white">
            U
          </div>
          {/* {!isOverlay && (
            <ViewTaskDetailButton
              id={Number(task.id)}
              projectId={task.projectId}
              title={task.title}
              description={task.description}
              detail={task.detail}
              priority={task.priority}
              startDate={task.startDate}
              dueDate={task.dueDate}
            />
          )} */}
        </div>
      </CardContent>
    </Card>
  );
}
