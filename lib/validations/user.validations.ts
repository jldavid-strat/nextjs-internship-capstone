import z from 'zod';

export const UserSchema = z.object({
  clerkId: z.string().trim(),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  imgLink: z.string().trim(),
  primaryEmailAddress: z.email().trim(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export const EditUserSchema = UserSchema.omit({
  createdAt: true,
});
