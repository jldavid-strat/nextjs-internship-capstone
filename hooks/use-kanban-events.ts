'use client';

import { Project } from '@/types/db.types';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const KanbanEventValues = ['task-moved', 'reorder-kanban-columns'] as const;

type KanbanEventsEnum = (typeof KanbanEventValues)[number];

type SSEEvent = {
  type: KanbanEventsEnum;
  [key: string]: string | number;
};

type EventHandler = (
  event: SSEEvent,
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: Project['id'],
  userId?: string,
) => void;

// handles the actions when an event is triggered
const eventHandlers: Record<string, EventHandler> = {
  'task-moved': (event, _queryClient, projectId, userId) => {
    console.log(`Task has been moved: ${event.taskId}`);
    if (event.projectId === projectId && event.userId !== userId) {
      console.log(`invalidating cache`);
      _queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
      });
      toast.info('A task has been moved');
    }
  },
  'reorder-kanban-columns': (event, _queryClient, projectId, userId) => {
    console.log(`Reordered kanban columns on project: ${event.projectId}`);
    if (event.projectId === projectId && event.userId !== userId) {
      _queryClient.invalidateQueries({
        queryKey: ['kanban-columns', projectId],
      });
      toast.info('Kanban columns has been reordered');
    }
  },
  connected: () => {
    console.log('SSE connected successfully');
  },
  ping: () => {
    console.log('SSE ping FROM CUSTOM HOOK');
    // keep-alive ping, no action needed
  },
};

export default function useKanbanEvents(projectId: Project['id']) {
  const queryClient = useQueryClient();
  const { userId, isSignedIn, isLoaded } = useAuth();
  const retryCountRef = useRef<number>(0);
  const shouldConnectRef = useRef<boolean>(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn || !userId) return;

      shouldConnectRef.current = true;
      retryCountRef.current = 0;

      const connectEventSource = () => {
        if (!shouldConnectRef.current) return;

        console.log('Connecting to SSE');

        const eventSource = new EventSource(`/api/events`);

        eventSource.onopen = () => {
          console.log('SSE connection opened');
          // Reset retry count on successful connection
          retryCountRef.current = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            const data: SSEEvent = JSON.parse(event.data);
            console.log('Received SSE event:', data);

            // use the event handler pattern for extensible event processing
            const handler = eventHandlers[data.type];
            if (handler) {
              handler(data, queryClient, projectId, userId);
              console.log('EVENT ACTION HAS BEEN RAN');
              console.log('EVENT SENDER', userId);
            } else {
              console.warn(`Unhandled SSE event type: ${data.type}`);
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.log('SSE connection error:', error);
          eventSource.close();

          // only  retry if we should still be connecting and haven't exceeded max retries
          if (shouldConnectRef.current && retryCountRef.current < 5) {
            retryCountRef.current += 1;
            const delay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 30000);

            console.log(`SSE reconnection attempt ${retryCountRef.current}/5 in ${delay}ms`);

            timeoutRef.current = setTimeout(() => {
              if (shouldConnectRef.current) {
                connectEventSource();
              }
            }, delay);
          } else if (retryCountRef.current >= 5) {
            console.error('SSE max reconnection attempts reached');
          }
        };

        return eventSource;
      };

      const eventSource = connectEventSource();

      return () => {
        console.log('Closing SSE connection');
        shouldConnectRef.current = false;

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (eventSource) {
          eventSource.close();
        }
      };
    }
  }, [isLoaded, userId, projectId, isSignedIn, queryClient]);
}
