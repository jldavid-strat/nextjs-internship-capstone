'use client';

import { getTaskComments } from '@/actions/task_comment.actions';
import { Task, TaskCommentQuery } from '@/types/db.types';
import { useQuery } from '@tanstack/react-query';

type useTasksCommentsResult = {
  taskComments: TaskCommentQuery[];
  isTaskCommentLoading: boolean;
  error: unknown;
  isTaskCommentSuccess: boolean;
};

export function useTaskComments(taskId: Task['id']): useTasksCommentsResult {
  // query for getting task comments
  const { data, isLoading, error, isSuccess } = useQuery<TaskCommentQuery[]>({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      const res = await getTaskComments(taskId);
      if (!res.success) throw new Error(JSON.stringify(res.error));
      return res.data;
    },
  });

  return {
    taskComments: data ?? [],
    isTaskCommentLoading: isLoading,
    isTaskCommentSuccess: isSuccess,
    error: error,
  };
}
