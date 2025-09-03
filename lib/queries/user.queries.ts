import 'server-only';

import { db } from '@/lib/db/connect_db';
import { users } from '@/lib/db/schema/schema';
import { QueryResult } from '@/types/types';
import { User } from '@/types/db.types';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function getCurrentUserId() {
  const { userId: clerkId, isAuthenticated } = await auth();

  // TODO make common errors classes (i.e UnauthenticatedError)
  if (!isAuthenticated) redirect('/sign-in');

  const user = await db.query.users.findFirst({
    columns: {
      id: true,
    },
    where: (users, { eq }) => eq(users.clerkId, clerkId),
  });

  // TODO send proper error message
  if (user === undefined) redirect('/sign-in');

  return user.id;
}

export async function getUserByClerkId(userClerkId: User['clerkId']): Promise<QueryResult<User>> {
  try {
    const result = await db.select().from(users).where(eq(users.clerkId, userClerkId));
    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: JSON.stringify(error),
    };
  }
}
// return type: Promise<QueryResult<User | undefined>>
export async function getUserById(userId: User['id']) {
  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });
    return {
      success: true,
      message: 'User succesfully retrieved',
      data: user,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to retrieve user',
      error: JSON.stringify(error),
    };
  }
}
