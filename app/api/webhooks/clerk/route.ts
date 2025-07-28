import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';

// TODO 2.4: add server actions to update the database when user is created, updated, and deleted
export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === 'user.created') {
      // use createUser()
      console.log('userId', evt.data.id);
    } else if (evt.type === 'user.updated') {
      // use updateUser()
      console.log('userId', evt.data.id);
    } else if (evt.type === 'user.deleted') {
      // use deleteUser()
      console.log('userId', evt.data.id);
    }
    return new Response('Webhook received', { status: 200 });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }
}
