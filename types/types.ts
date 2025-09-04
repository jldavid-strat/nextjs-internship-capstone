import { KanbanColumn, Project, ProjectKanbanColumn, Task } from './db.types';

export type QueryResult<TData = undefined, Error = string> =
  | {
      success: true;
      message: string;
      data: TData;
    }
  | {
      success: false;
      message: string;
      error: Error;
    };

export type ActionResult<TData = undefined, Error = string> =
  | {
      success: true;
      message: string;
      data?: TData;
    }
  | {
      success: false;
      message: string;
      error: Error;
    };

export type MoveTaskDataType = {
  taskId: Task['id'];
  sourceColumnId: KanbanColumn['id'];
  targetColumnId: KanbanColumn['id'];
  newPosition: Task['position'];
  projectId: Project['id'];
};

export type ReorderColumnDataType = {
  columnId: KanbanColumn['id'];
  newPosition: ProjectKanbanColumn['position'];
  projectId: Project['id'];
};

export type ColumnQueryResult = {
  kanbanColumnId: KanbanColumn['id'];
  name: KanbanColumn['name'];
  description: ProjectKanbanColumn['description'];
  position: ProjectKanbanColumn['position'];
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
