// TODO: create type inference for clerUser

'use server';
import { db } from '@/lib/db/connect_db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface clerkUserProps {
  clerkId: string;
  firstName: string;
  lastName: string;
  primaryEmailAddress: string;
  createdAt: Date;
  updatedAt: Date | undefined;
}

export async function createUser(clerkUser: clerkUserProps) {
  try {
    await db.insert(user).values({
      clerkId: clerkUser.clerkId,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      primaryEmailAddress: clerkUser.primaryEmailAddress,
      createdAt: clerkUser.createdAt,
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updatedUser(clerkUser: clerkUserProps) {
  try {
    await db
      .update(user)
      .set({
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        primaryEmailAddress: clerkUser.primaryEmailAddress,
        updatedAt: clerkUser.createdAt,
      })
      .where(eq(user.clerkId, clerkUser.clerkId));

    // invalidate cache on settings page to load new user info
    revalidatePath(`/settings`);
  } catch (error) {
    console.error(error);
  }
}

export async function deleteUser(clerkUser: clerkUserProps) {
  try {
    await db.delete(user).where(eq(user.clerkId, clerkUser.clerkId));
    redirect('/sign-up');
  } catch (error) {
    console.error(error);
  }
}
