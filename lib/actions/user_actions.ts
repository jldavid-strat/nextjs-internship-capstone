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
  imgUrl: string;
  emailAddress: string;
  createdAt: Date;
  updatedAt: Date | undefined;
}

export async function createUser(clerkUser: clerkUserProps) {
  try {
    await db.insert(user).values({
      clerkId: clerkUser.clerkId,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imgUrl: clerkUser.imgUrl,
      emailAddress: clerkUser.emailAddress,
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
        imgUrl: clerkUser.imgUrl,
        emailAddress: clerkUser.emailAddress,
        updatedAt: clerkUser.updatedAt,
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
