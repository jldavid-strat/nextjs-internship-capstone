import 'server-only';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function checkAuthenticationStatus() {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) redirect('/sign-in');
}
