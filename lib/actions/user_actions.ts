// TODO: create type inference for clerUser

// "use server"
//  import { db } from '@/lib/db/connect_db';
// import { user } from '@/lib/db/schema';
// import { eq } from 'drizzle-orm';
// import { revalidatePath } from 'next/cache';
// import { redirect } from 'next/navigation';

// export async function createUser({ newUser }) {
//   try {
//     await db.insert(user).values({
//       clerkId: newUser.id,
//       firstName: newUser.firstName,
//       lastName: newUser.lastName,
//       primaryEmailAddress: newUser.primaryEmailAddress,
//       createdAt: newUser.createdAt,
//     });
//   } catch (error) {
//     console.error(error);
//   }
// }

// export async function updatedUser({ clerkUser }) {
//   try {
//     await db
//       .update(user)
//       .set({
//         firstName: clerkUser.firstName,
//         lastName: clerkUser.lastName,
//         primaryEmailAddress: clerkUser.primaryEmailAddress,
//         updatedAt: clerkUser.createdAt,
//       })
//       .where(eq(user.clerkId, clerkUser.id));
//     // invalidate cache on settings page to load new user info
//     revalidatePath(`/settings`);
//   } catch (error) {
//     console.error(error);
//   }
// }
//
// export async function deleteUser({ clerkUser }) {
//   try {
//     await db.delete(user).where(eq(user.id, clerkUser.id));
//     redirect('/sign-up');
//   } catch (error) {
//     console.error(error);
//   }
// }
