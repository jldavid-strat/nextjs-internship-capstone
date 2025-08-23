import 'server-only';
import { db } from '@/lib/db/connect_db';
import { users } from '@/lib/db/schema/schema';
import { QueryResult } from '@/types';
import { User } from '@/types/db.types';
import { auth } from '@clerk/nextjs/server';
import { and, eq, ilike, notInArray } from 'drizzle-orm';
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
export async function getCurrentUserData() {
  const { userId: clerkId, isAuthenticated } = await auth();

  if (!isAuthenticated) redirect('/sign-in');

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerkId, clerkId),
  });

  // TODO send proper error message
  if (user === undefined) redirect('/sign-in');

  return user;
}

export async function getUserByClerkId(userClerkId: User['clerkId']): Promise<QueryResult<User>> {
  try {
    const result = await db.select().from(users).where(eq(users.clerkId, userClerkId));
    return {
      success: true,
      message: 'User succesfully retrieved',
      data: result[0],
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to retrieve user',
      error: JSON.stringify(error),
    };
  }
}

// TODO change to server component

export async function getSuggestedUsersByEmail(
  input: string | null,
  filterIds: string[] = [],
): Promise<User[] | []> {
  try {
    console.log(filterIds);

    // get suggested users by chunks of eight
    const suggestedUsers = await db
      .select()
      .from(users)
      .where(
        and(
          input ? ilike(users.primaryEmailAddress, `%${input.trim()}%`) : undefined,
          filterIds.length > 0 ? notInArray(users.id, filterIds) : undefined,
        ),
      )
      .limit(8);

    return suggestedUsers;
    // return {
    //   success: true,
    //   message: 'Successfully retrieve all users',
    //   data: suggestedUsers,
    // };
  } catch (error) {
    console.error(error);
    // return {
    //   success: true,
    //   message: 'Failed to retrieved users',
    //   error: JSON.stringify(error),
    // };
    return [];
  }
}
