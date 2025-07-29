// TODO: handle webhook in production via Svix

import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest, NextResponse } from 'next/server';
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';

// boilerplate for clerk webhook

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    // transform evt.data to only include necessary data
    // const clerkUser = {
    //   clerkId: evt.data.id as string,
    //   firstName: evt.data.first_name,
    //   lastName: evt.data.last_name,
    //   imgUrl: evt.data.image_url,
    //   emailAddress: evt.data.email_addresses[0].email_address,
    //   createdAt: evt.data.created_at,
    //   updatedAt: evt.data.updated_at | '',
    // };

    switch (evt.type) {
      case 'user.created':
        // use createUser(clerkUser)
        return new NextResponse('User has been created successfully ', { status: 200 });
      case 'user.updated':
        // use updateUser(clerkUser)
        return new NextResponse('User has been updated successfully ', { status: 200 });
      case 'user.deleted':
        // use deleteUser(clerkUser)
        return new NextResponse('User has been successfully deleted', { status: 200 });
      default:
        return new NextResponse('Cannot handle request', { status: 400 });
    }
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
