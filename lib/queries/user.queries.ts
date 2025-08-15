// TODO: create type inference for clerUser

'use server';
import { db } from '@/lib/db/connect_db';
import { users } from '@/lib/db/schema/schema';
import { QueryResult } from '@/types';
import { User, CreateUser, UpdateUser } from '@/types/db.types';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createUser(clerkUser: Omit<CreateUser, 'updatedAt'>): Promise<void> {
  try {
    await db.insert(users).values({
      clerkId: clerkUser.clerkId,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imgLink: clerkUser.imgLink,
      primaryEmailAddress: clerkUser.primaryEmailAddress,
      createdAt: clerkUser.createdAt,
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updatedUser(
  clerkUserId: User['clerkId'],
  clerkUser: UpdateUser,
): Promise<void> {
  try {
    await db
      .update(users)
      .set({
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imgLink: clerkUser.imgLink,
        primaryEmailAddress: clerkUser.primaryEmailAddress,
        updatedAt: clerkUser.updatedAt,
      })
      .where(eq(users.clerkId, clerkUserId));

    // invalidate cache on settings page to load new user info
    revalidatePath(`/settings`);
  } catch (error) {
    console.error(error);
  }
}

export async function deleteUser(clerkId: User['clerkId']): Promise<void> {
  try {
    await db.delete(users).where(eq(users.clerkId, clerkId));
    redirect('/sign-up');
  } catch (error) {
    console.error(error);
  }
}

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
