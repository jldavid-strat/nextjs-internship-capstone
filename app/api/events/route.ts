// export const dynamic = 'force-dynamic';

// // Can be 'nodejs', but Vercel recommends using 'edge'
// export const runtime = 'nodejs';

import { type KanbanServerEvent, serverEvents } from '@/lib/events/event-emitter';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // send initial connection message
      const connectMessage = `data: ${JSON.stringify({ type: 'connected' })}\n\n`;
      controller.enqueue(encoder.encode(connectMessage));

      // listen for events and broadcast to all connections
      const handleEvent = (event: KanbanServerEvent) => {
        console.log('Try SSE event: ', event.type);
        // if (event.projectId !== projectId) return;
        const message = `data: ${JSON.stringify(event)}\n\n`;
        try {
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('Error sending SSE message:', error);
        }
      };

      // subscribe to to the following events
      serverEvents.on('task-moved', handleEvent);
      serverEvents.on('reorder-kanban-columns', handleEvent);

      // keep connection alive every 30 seconds
      const pingInterval = setInterval(() => {
        try {
          const pingMessage = `data: ${JSON.stringify({ type: 'ping' })}\n\n`;
          controller.enqueue(new TextEncoder().encode(pingMessage));
        } catch (e) {
          clearInterval(pingInterval);
          controller.close();
        }
      }, 30000);

      // cleanup on disconnect
      const cleanup = () => {
        // unsubscribe to events
        serverEvents.off('task-moved', handleEvent);
        serverEvents.off('reorder-kanban-column', handleEvent);
        clearInterval(pingInterval);
        try {
          controller.close();
        } catch (error) {
          console.error(error);
          // controller already closed
        }
      };

      req.signal?.addEventListener('abort', cleanup);

      // additional cleanup for when the stream ends
      return cleanup;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Content-Encoding': 'none',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
