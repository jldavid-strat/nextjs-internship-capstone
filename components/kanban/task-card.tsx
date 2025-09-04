'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { cva } from 'class-variance-authority';
import { Badge } from '@/components/ui/badge';
import { cn } from '../../lib/utils/shadcn-utils';
import { TaskDragData } from '@/types/types';
import { Calendar, GripVertical, User } from 'lucide-react';
import { formatDueDate } from '@/lib/utils/format_date';
import { LabelPreview } from '../forms/add-project-label-modal-form';
import { DEFAULT_COLOR } from '@/lib/validations/project-label.validations';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import TaskCardDropdown from '../dropdowns/task-dropdown';
import { ViewTaskModalProps } from '../modals/view-task-modal';

interface TaskCardProps extends Omit<ViewTaskModalProps, 'isTaskOpen' | 'setIsTaskOpen'> {
  isOverlay?: boolean;
}

// for debugging purposes
const SHOW_POSTION = true;

export function TaskCard({ taskData, isOverlay, kanbanData }: TaskCardProps) {
  const dueDateInfo = formatDueDate(taskData.dueDate ?? null);
  const isOverdue = taskData.dueDate && new Date(taskData.dueDate) < new Date();
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: taskData.id,
    data: {
      type: 'Task',
      task: taskData,
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
      style={style}
      className={cn(
        variants({
          dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
        }),
      )}
    >
      <CardContent className="px-3 pt-3 pb-6 text-left">
        {/* Title and Description */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            {/* Drag Handle */}
            <div className="flex items-center gap-2">
              <button
                {...attributes}
                {...listeners}
                className="text-muted-foreground hover:text-foreground cursor-grab rounded p-1"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <p className="text-md max-w-[200px] truncate font-medium">{taskData.title}</p>
            </div>
            <TaskCardDropdown
              taskData={taskData}
              kanbanData={{
                projectId: kanbanData.projectId,
                taskId: kanbanData.taskId,
                statusList: kanbanData.statusList,
              }}
            />
          </div>
          {taskData.description && (
            <p className="text-muted-foreground text-xs whitespace-pre-wrap">
              {taskData.description}
            </p>
          )}
        </div>

        {/* Labels */}
        {taskData.labels.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {taskData.labels.map((label) => (
              <LabelPreview
                key={label.id}
                name={label.labelName}
                color={label.color ?? DEFAULT_COLOR}
                className="mt-0"
              />
            ))}
          </div>
        )}

        {/* Due Date */}
        <div className="mb-3 flex items-center gap-1">
          <Calendar className="text-muted-foreground h-3 w-3" />
          <span
            className={cn(
              'text-xs',
              isOverdue ? 'font-medium text-red-600' : 'text-muted-foreground',
            )}
          >
            {dueDateInfo}
          </span>
        </div>

        {/* Priority and Assignees Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Priority Badge */}
            {taskData.priority !== 'none' && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-medium',
                  taskData.priority === 'high' && 'border-red-500 bg-red-50 text-red-700',
                  taskData.priority === 'medium' &&
                    'border-yellow-500 bg-yellow-50 text-yellow-700',
                  taskData.priority === 'low' && 'border-green-500 bg-green-50 text-green-700',
                )}
              >
                {taskData.priority}
              </Badge>
            )}

            {/* Not Assigned Indicator */}
            {taskData.isNotAssigned && (
              <div className="flex items-center gap-1">
                <User className="text-muted-foreground h-3 w-3" />
                <span className="text-muted-foreground text-xs">Unassigned</span>
              </div>
            )}
          </div>

          {/* Assignees and Position */}
          <div className="flex items-center gap-2">
            {/* taskData Assignees */}
            {taskData.assignees.length > 0 && (
              <div className="flex -space-x-2">
                {taskData.assignees.slice(0, 2).map((assignee, index) => (
                  <Avatar
                    key={`${assignee.id}-${index}`}
                    className="border-background h-8 w-8 border-2"
                  >
                    <AvatarImage src={assignee.imgLink} alt={assignee.imgLink} />
                    <AvatarFallback className="text-xs font-medium">
                      {assignee.firstName.charAt(0)}
                      {assignee.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {taskData.assignees.length > 2 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium text-gray-600">
                    +{taskData.assignees.length - 2}
                  </div>
                )}
              </div>
            )}

            {/* Position (for debugging) */}
            {SHOW_POSTION && (
              <span className="text-muted-foreground text-xs">#{taskData.position}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
