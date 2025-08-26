import { MoveTaskDataType, ReorderColumnDataType } from '@/types/types';
import { EventEmitter } from 'events';

export const serverEvents = new EventEmitter();

export type TaskMoveEvent = MoveTaskDataType & {
  type: 'task-moved';
};

export type ReorderKanbanColumnEvent = ReorderColumnDataType & {
  type: 'reorder-kanban-columns';
};

export type KanbanServerEvent = TaskMoveEvent | ReorderKanbanColumnEvent;
