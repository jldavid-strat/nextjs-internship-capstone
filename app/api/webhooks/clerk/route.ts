// TODO: handle webhook in production via Svix

import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest, NextResponse } from 'next/server';
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';
import { createUser, deleteUser, updateUser } from '@/actions/user.actions';

// boilerplate for clerk webhook

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    // transform evt.data to only include necessary data

    switch (evt.type) {
      case 'user.created':
        await createUser(evt.data);
        break;
      case 'user.updated':
        await updateUser(evt.data);
        break;
      case 'user.deleted':
        await deleteUser(evt.data);
        break;
      default:
        return new NextResponse('Cannot handle request', { status: 400 });
    }
    return new Response('Webhook received', { status: 200 });
  } catch (error) {
    if (isClerkAPIResponseError(error)) {
      console.error('Clerk API Error verifying webhook:', error.errors);
      console.error('Full error details:', JSON.stringify(error, null, 2));

      return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
    }

    // Handle non-Clerk errors
    console.error('Unexpected error verifying webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
