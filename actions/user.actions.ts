'use server';
import { NotFoundError } from '@/constants/error';
import { db } from '@/lib/db/connect_db';
import { users } from '@/lib/db/schema/schema';
import { getUserByClerkId } from '@/lib/queries/user.queries';
import { getErrorMessage } from '@/lib/utils/error.utils';
import { EditUserSchema, UserSchema } from '@/lib/validations/user.validations';
import { User } from '@/types/db.types';
import { ActionResult } from '@/types/types';
import { auth, DeletedObjectJSON, UserJSON } from '@clerk/nextjs/server';
import { and, eq, ilike, notInArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import 'server-only';

export async function createUser(eventData: UserJSON): Promise<ActionResult> {
  try {
    const clerkId = eventData.id;

    // check if clerkId already exists
    const { success } = await getUserByClerkId(clerkId);

    // throw error if id is already in the database
    if (success) throw new Error('User already exists in the database');

    const primaryEmailObj = eventData.email_addresses.find(
      (e) => e.id === eventData.primary_email_address_id,
    );

    if (eventData.primary_email_address_id === null || primaryEmailObj === undefined)
      throw new NotFoundError('Primary Email ID is null or undefined');

    const validatedData = UserSchema.parse({
      clerkId: clerkId,
      firstName: eventData.first_name,
      lastName: eventData.last_name,
      imgLink: eventData.image_url,
      primaryEmailAddress: primaryEmailObj.email_address,
      createdAt: new Date(eventData.created_at),
      updatedAt: new Date(eventData.updated_at),
    });

    await db.insert(users).values(validatedData);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function updateUser(eventData: UserJSON): Promise<ActionResult> {
  try {
    const clerkId = eventData.id;

    // check if clerkId already exists
    const { success } = await getUserByClerkId(clerkId);

    // check if user exists in db
    if (!success) throw new Error('User does not exist in the database');

    const primaryEmailObj = eventData.email_addresses.find(
      (e) => e.id === eventData.primary_email_address_id,
    );

    if (eventData.primary_email_address_id === null || primaryEmailObj === undefined)
      throw new NotFoundError('Primary Email ID is null or undefined');

    const currentUserData = {
      clerkId: clerkId,
      firstName: eventData.first_name,
      lastName: eventData.last_name,
      imgLink: eventData.image_url,
      primaryEmailAddress: primaryEmailObj.email_address,
      updatedAt: new Date(eventData.updated_at),
    };

    const validatedData = EditUserSchema.parse({ ...currentUserData });

    await db.update(users).set(validatedData).where(eq(users.clerkId, clerkId));

    // invalidate cache on settings page to load new user info
    revalidatePath(`/(dashboard)`);
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function deleteUser(eventData: DeletedObjectJSON): Promise<ActionResult> {
  try {
    const clerkId = eventData.id;

    if (!clerkId) throw new Error('Clerk ID received is null or undefined');

    // check if clerkId already exists
    const { success } = await getUserByClerkId(clerkId);

    // check if user exists in db
    if (!success) throw new Error('User does not exist in the database');

    await db.delete(users).where(eq(users.clerkId, clerkId));
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// moved to work with add user multiselect
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

// moved to server action work with tanstack query
export async function getCurrentUserData() {
  const { userId: clerkId, isAuthenticated } = await auth();

  if (!isAuthenticated) redirect('/sign-in');

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerkId, clerkId),
  });

  if (user === undefined) return { success: false };

  return { success: true, data: user };
}
