import { User } from '@/types/db.types';
import { MoveTaskDataType, ReorderColumnDataType } from '@/types/types';

// [NOTE]
// this is the core pub/sub primitive shared between the SSE route and server actions
// requires the node js run time (not edge), therefore switch to redist pub/sub or to pusher client in production
import { EventEmitter } from 'events';

const MAX_SSE_LISTENERS = 100;

// allow global singleton in dev (Next HMR reloads)
// In Next JS dev environment, files can be reloaded multile times (aka hot module reloads)
declare global {
  var _eventBus: EventEmitter | undefined;
}

// reuse event bus it it already exist
// this ensures that the current emitter instance stays alive across reloads
export const serverEvents = global._eventBus || new EventEmitter();

serverEvents.setMaxListeners(MAX_SSE_LISTENERS);

// In dev, persist across HMR reloads
if (process.env.NODE_ENV !== 'production') {
  global._eventBus = serverEvents;
}

export type TaskMoveEvent = MoveTaskDataType & {
  type: 'task-moved';
  userId: User['id'];
};

export type ReorderKanbanColumnEvent = ReorderColumnDataType & {
  type: 'reorder-kanban-columns';
  userId: User['id'];
};

export type KanbanServerEvent = TaskMoveEvent | ReorderKanbanColumnEvent;
