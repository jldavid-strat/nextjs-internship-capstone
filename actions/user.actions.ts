'use server';
import { db } from '@/lib/db/connect_db';
import { users } from '@/lib/db/schema/schema';
import { CreateUser, UpdateUser, User } from '@/types/db.types';
import { and, eq, ilike, notInArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import 'server-only';

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
    revalidatePath(`/(dashboard)`);
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

    console.log(filterIds);
    console.log(suggestedUsers);

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
