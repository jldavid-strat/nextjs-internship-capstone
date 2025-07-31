// TODO: create type inference for clerUser

'use server';
import { db } from '@/lib/db/connect_db';
import { user } from '@/lib/db/schema';
import { queryResult } from '@/types';
import { User, CreateUser, UpdateUser } from '@/types/db.types';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createUser(
  clerkUser: Omit<CreateUser, 'updatedAt'>,
): Promise<void> {
  try {
    await db.insert(user).values({
      clerkId: clerkUser.clerkId,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imgUrl: clerkUser.imgUrl,
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
      .update(user)
      .set({
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imgUrl: clerkUser.imgUrl,
        primaryEmailAddress: clerkUser.primaryEmailAddress,
        updatedAt: clerkUser.updatedAt,
      })
      .where(eq(user.clerkId, clerkUserId));

    // invalidate cache on settings page to load new user info
    revalidatePath(`/settings`);
  } catch (error) {
    console.error(error);
  }
}

export async function deleteUser(clerkId: User['clerkId']): Promise<void> {
  try {
    await db.delete(user).where(eq(user.clerkId, clerkId));
    redirect('/sign-up');
  } catch (error) {
    console.error(error);
  }
}

export async function getUserById(clerkId: User['clerkId']): Promise<queryResult<User>> {
  try {
    const result = await db.select().from(user).where(eq(user.clerkId, clerkId));
    return {
      success: true,
      message: 'User succesfully retrieved',
      data: result[0],
    };
  } catch (error) {
    return {
      success: false,
      message: 'User succesfully retrieved',
      error: JSON.stringify(error),
    };
  }
}
