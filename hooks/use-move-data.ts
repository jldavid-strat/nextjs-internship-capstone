'use client';

import { reorderKanbanColumns } from '@/actions/kanban_column.actions';
import { moveTask } from '@/actions/task.actions';
import { Task, ProjectKanbanColumn } from '@/types/db.types';
import { MoveTaskDataType, ReorderColumnDataType } from '@/types/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useMoveTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MoveTaskDataType) => {
      const response = await moveTask(data);

      if (!response.success) {
        console.error(response.error);
        throw new Error('Failed to move task');
      }
      return response;
    },

    onMutate: async (moveData) => {
      // cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['tasks', projectId],
      });

      // get data of previous tasks by column name
      const { sourceColumnId, targetColumnId } = moveData;

      const previousSourceTasks = queryClient.getQueryData<Task[]>([
        'tasks',
        projectId,
        sourceColumnId,
      ]);

      const previousTargetTasks = queryClient.getQueryData<Task[]>([
        'tasks',
        projectId,
        targetColumnId,
      ]);

      // optimistically update the task list
      if (previousSourceTasks) {
        const taskToMove = previousSourceTasks.find((t) => t.id === moveData.taskId);

        if (taskToMove) {
          // remove task from the source column
          const newSourceTasks = previousSourceTasks
            .filter((t) => t.id !== moveData.taskId)
            .map((task, index) => ({ ...task, position: index }))
            .sort((a, b) => a.position - b.position);

          queryClient.setQueryData(['tasks', projectId, moveData.sourceColumnId], newSourceTasks);

          // insert to target column
          if (previousTargetTasks) {
            const updatedTask = {
              ...taskToMove,
              columnId: moveData.targetColumnId,
              position: moveData.newPosition,
            };

            const newTargetTasks = [...previousTargetTasks];
            newTargetTasks.splice(moveData.newPosition, 0, updatedTask);

            // update the task positions in target column
            const reorderedTargetTasks = newTargetTasks
              .map((task, index) => ({
                ...task,
                position: index,
              }))
              .sort((a, b) => a.position - b.position);

            queryClient.setQueryData(
              ['tasks', projectId, moveData.targetColumnId],
              reorderedTargetTasks,
            );
          }
        }
      }

      return { previousSourceTasks, previousTargetTasks };
    },

    onError: (err, moveData, context) => {
      // undo optimistic updates on error
      if (context?.previousSourceTasks) {
        queryClient.setQueryData(
          ['tasks', projectId, moveData.sourceColumnId],
          context.previousSourceTasks,
        );
      }

      if (context?.previousTargetTasks) {
        queryClient.setQueryData(
          ['tasks', projectId, moveData.targetColumnId],
          context.previousTargetTasks,
        );
      }
      toast.error('Failed to move task', {
        description: 'Please try again',
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
      });

      toast.success('Successfully moved task');
    },
  });
}

export function useReorderColumns(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reorderColumnData: ReorderColumnDataType) => {
      const response = await reorderKanbanColumns(reorderColumnData);

      if (!response.success) {
        console.error(response.error);
        throw new Error('Failed to reorder columns');
      }

      return response;
    },

    onMutate: async (reorderData) => {
      await queryClient.cancelQueries({
        queryKey: ['kanban-columns', projectId],
      });

      // get snapshot the previous columns
      const previousColumns = queryClient.getQueryData<ProjectKanbanColumn[]>([
        'kanban-columns',
        projectId,
      ]);

      // optimistically update the kanban columns
      if (previousColumns) {
        const { projectColumnId, newPosition } = reorderData;

        const columnToMove = previousColumns.find((col) => col.id === projectColumnId);

        if (columnToMove) {
          // remove the column from original position
          const columnsWithoutMoved = previousColumns.filter((col) => col.id !== projectColumnId);

          // insert it at the new position
          const reorderedColumns = [...columnsWithoutMoved];
          reorderedColumns.splice(newPosition, 0, columnToMove);

          // update kanban column positions
          const updatedColumns = reorderedColumns.map((col, index) => ({
            ...col,
            position: index,
          }));

          queryClient.setQueryData(['kanban-columns', projectId], updatedColumns);
        }
      }

      return { previousColumns };
    },

    onError: (error, reorderData, context) => {
      // undo the optimistic update on error
      if (context?.previousColumns) {
        queryClient.setQueryData(['kanban-columns', projectId], context.previousColumns);
      }

      toast.error('Failed to move kanban column', {
        description: 'Please try again',
      });
    },

    onSuccess: () => {
      toast.error('Successfully moved kanban column');
      queryClient.invalidateQueries({
        queryKey: ['kanban-columns', projectId],
      });
    },
  });
}
