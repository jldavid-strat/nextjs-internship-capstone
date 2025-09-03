import { useQuery } from '@tanstack/react-query';
import { Project } from '@/types/db.types';
import { ColumnQueryResult, TaskCardData } from '@/types/types';

type useKanbanColumnResult = {
  columns: ColumnQueryResult[];
  isLoading: boolean;
  error: unknown;
  isSuccess: boolean;
};

export function useKanbanColumns(projectId: string): useKanbanColumnResult {
  const { data, isLoading, error, isSuccess } = useQuery<ColumnQueryResult[]>({
    queryKey: ['kanban-columns', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to retrieved kanban columns');
      return res.json();
    },

    // refetch every 5 seconds for now
    // refetchInterval: 5000,
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
    // 1 minutes
    // staleTime: 1000 * 60 * 5,
  });

  return {
    columns: data ?? [],
    isLoading: isLoading,
    error: error,
    isSuccess: isSuccess,
  };
}

type useTasksByColumnResult = {
  tasks: TaskCardData[];
  isLoading: boolean;
  error: unknown;
  isSuccess: boolean;
};

export function useTaskList(projectId: Project['id']): useTasksByColumnResult {
  const { data, isLoading, error, isSuccess } = useQuery<TaskCardData[]>({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${projectId}`);
      if (!res.ok) throw new Error('Failed to retrieve task list');
      return res.json();
    },

    // refetch every 5 seconds for now
    // refetchInterval: 5000,
    refetchInterval: 30000,
    refetchIntervalInBackground: true,

    // 2 minutes
    // staleTime: 1000 * 60 * 2,
  });

  return {
    tasks: data ?? [],
    isLoading,
    error,
    isSuccess,
  };
}
