import {
  KanbanColumn,
  Label,
  Project,
  ProjectKanbanColumn,
  ProjectLabel,
  Task,
  User,
} from './db.types';

// [CONSIDER]
// change success to status code to differentiate different types of response especially in handling errors
export type QueryResult<TData = undefined, Error = string | string[]> =
  | {
      success: true;
      data: TData;
    }
  | {
      success: false;
      error: Error;
    };

export type ActionResult<TData = undefined, Error = string | string[]> =
  | {
      success: true;
      data?: TData;
    }
  | {
      success: false;
      error: Error;
    };

export type MoveTaskDataType = {
  taskId: Task['id'];
  sourceColumnId: ProjectKanbanColumn['id'];
  targetColumnId: ProjectKanbanColumn['id'];
  newPosition: Task['position'];
  projectId: Project['id'];
};

export type ReorderColumnDataType = {
  projectColumnId: ProjectKanbanColumn['id'];
  newPosition: ProjectKanbanColumn['position'];
  projectId: Project['id'];
};

export type ColumnQueryResult = {
  projectColumnId: ProjectKanbanColumn['id'];
  kanbanColumnId: KanbanColumn['id'];
  name: KanbanColumn['name'];
  description: ProjectKanbanColumn['description'];
  position: ProjectKanbanColumn['position'];
  isCustom: ProjectKanbanColumn['isCustom'];
  color: ProjectKanbanColumn['color'];
};

export type TaskDragData = {
  type: 'Task';
  task: Task;
};

export type KanbanColumnDragData = {
  type: 'Column';
  column: ColumnQueryResult;
};

export interface EditKanbaColumnFormData extends Omit<ColumnQueryResult, 'color'> {
  projectId: Project['id'];
}

export type TaskQueryResult = {
  id: Task['id'];
  title: Task['title'];
  description: Task['description'];
  priority: Task['priority'];
  detail: Task['detail'];
  startDate: Task['startDate'];
  dueDate: Task['dueDate'];
};

export type TaskListType = TaskQueryResult[];

type TaskLabel = {
  projectLabelId: ProjectLabel['id'];
  name: Label['name'];
  color: ProjectLabel['color'];
};

type TaskAssignee = {
  userId: User['id'];
  firstName: User['firstName'];
  lastName: User['lastName'];
  primaryEmailAddress: User['primaryEmailAddress'];
  userImgLink: User['imgLink'];
};
export interface TaskCardData extends Task {
  assignees: TaskAssignee[];
  labels: TaskLabel[];
}

export type TaskLabelMap = {
  [taskId: Task['id']]: TaskLabel[];
};

export type TaskAssgineeMap = {
  [taskId: Task['id']]: TaskAssignee[];
};
