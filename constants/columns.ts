export const DEFAULT_COLUMN_NAMES: string[] = ['backlog', 'in-progress', 'completed'] as const;

type DefaultColumnData = {
  columnName: string;
  description: string;
  defaultPosition: number;
};

export const DEFAULT_COLUMNS_DATA: Record<string, DefaultColumnData> = {
  backlog: {
    columnName: 'backlog',
    description: "Tasks that hasn't been started",
    defaultPosition: 0,
  },
  'in-progress': {
    columnName: 'in-progress',
    description: 'Tasks that is currently being worked on',
    defaultPosition: 1,
  },
  completed: {
    columnName: 'completed',
    description: '',
    defaultPosition: 2,
  },
} as const;
