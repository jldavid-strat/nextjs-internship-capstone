import z from 'zod';
import { errorMessages, isFuture, MAX_CHAR, MIN_CHAR } from '../utils/validation.utils';
import { CHANGE_ROLE_VALUES, PROJECT_STATUS_VALUES, SELECT_ROLE_VALUES } from '../db/schema/enums';

export const ProjectSchema = z.object({
  title: z
    .string(errorMessages.invalidType('Project Title', 'text'))
    .min(MIN_CHAR, errorMessages.required('Project Title'))
    .max(MAX_CHAR, errorMessages.maxChar('Project title', MAX_CHAR)),
  description: z
    .string(errorMessages.invalidType('Project description', 'text'))
    .max(MAX_CHAR, errorMessages.maxChar('Project description', MAX_CHAR))
    .nullable(),
  status: z.enum(PROJECT_STATUS_VALUES, 'Only select status from the listed options'),
  statusChangedAt: z.date().nullable(),
  statusChangedById: z.uuidv4(errorMessages.uuid('Status Modifier ID')).nullable(),
  ownerId: z.uuidv4(errorMessages.uuid('Owner ID')),

  //  date inputs will be validate as strings
  // in update and insert these inputs will be transformed into date instances

  // [CONSIDER]

  dueDate: z.iso
    .date(errorMessages.invalidDate('Due date'))
    .refine((dateString) => isFuture(dateString), {
      error: 'Due date must be set today or in the future',
    })
    .nullable(),

  // will be omitted in insertion
  updatedAt: z.date(errorMessages.invalidDate('Updated date')),
});

export const FormProjectSchema = ProjectSchema.extend({
  members: z
    .array(
      z.object({
        userId: z.uuidv4(errorMessages.uuid('User ID')).trim(),
        role: z.enum(SELECT_ROLE_VALUES, 'Only select status from the listed options'),
      }),
    )
    .nullable(),
});

export const AddProjectMemberSchema = z.object({
  members: z.array(
    z.object({
      userId: z.uuidv4(errorMessages.uuid('User ID')).trim(),
      role: z.enum(SELECT_ROLE_VALUES, 'Only select status from the listed options'),
    }),
  ),
});

export const ChangeRoleMemberSchema = z.object({
  role: z.enum(
    // owner cannot be assigned to members
    CHANGE_ROLE_VALUES,
    'Only select status from the listed options',
  ),
});

export const InsertProjectFormSchema = FormProjectSchema.pick({
  title: true,
  description: true,
  ownerId: true,
  dueDate: true,
  members: true,
});

export const InsertProjectSchema = FormProjectSchema.pick({
  title: true,
  description: true,
  ownerId: true,
  dueDate: true,
});

export const EditProjectFormSchema = ProjectSchema.pick({
  title: true,
  description: true,
  status: true,
  dueDate: true,
});

export const EditProjectSchema = ProjectSchema.partial().pick({
  title: true,
  description: true,
  status: true,
  statusChangedAt: true,
  statusChangedById: true,
  dueDate: true,
  updatedAt: true,
});

export type InsertProjectType = z.input<typeof InsertProjectSchema>;
export type InsertProjectFormType = z.input<typeof InsertProjectFormSchema>;

export type EditProjectFormType = z.infer<typeof EditProjectFormSchema>;
export type EditProjectType = z.infer<typeof EditProjectSchema>;

export type ChangeRoleMemberSchemaType = z.infer<typeof ChangeRoleMemberSchema>;
