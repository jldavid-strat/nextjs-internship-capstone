// TODO: Task 3.6 - Set up data validation with Zod schemas

import { z } from 'zod';
import { TASK_PRIORITY_VALUES } from './db/schema/enums';
import { errorMessages, isFuture } from './utils/validation.utils';

/*
TODO: Implementation Notes for Interns:

1. Install Zod: pnpm add zod
2. Create validation schemas for all forms and API endpoints
3. Add proper error messages
4. Set up client and server-side validation

Example schemas needed:
- Project creation/update
- Task creation/update
- User profile update
- List/column management
- Comment creation
*/

export const ProjectTeamSchema = z.object({
  teamName: z
    .string(errorMessages.invalidType('Team name', 'text'))
    .min(MIN_CHAR, errorMessages.minChar('Team name', MIN_CHAR))
    .max(MAX_CHAR, errorMessages.maxChar('Team name', MAX_CHAR)),
  description: z
    .string(errorMessages.invalidType('Team description', 'text'))
    .min(MIN_CHAR, errorMessages.minChar('Team description', MIN_CHAR))
    .max(MAX_CHAR, errorMessages.maxChar('Team description', MAX_CHAR))
    .optional(),
  // TODO create advance string format for hex colors
  createdBy: z.uuidv4(errorMessages.uuid('Created by ID')),
  projectId: z.uuidv4(errorMessages.uuid('Project ID')),
  color: z
    .string(errorMessages.invalidType('Team color', 'a string'))
    .min(MIN_CHAR, errorMessages.minChar('Team color', MIN_CHAR))
    .max(MAX_COLOR_LENGTH, errorMessages.maxChar('Team color', MAX_COLOR_LENGTH))
    .refine((color) => {
      // Regex for hex colors: #000 or #000000 (with optional #)
      const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      return hexRegex.test(color);
    }, 'Color must be in valid hex format (#000000 or #000)'),
  updatedAt: z.iso.datetime(errorMessages.invalidDate('Update at')),
});

export const ProjecDiscussionSchema = z.object({
  projectId: z.uuidv4(errorMessages.uuid('Project ID')),
  title: z
    .string(errorMessages.invalidType('Project discussion title', 'text'))
    .min(MIN_CHAR, errorMessages.minChar('Project discussion title', MIN_CHAR))
    .max(MAX_CHAR, errorMessages.maxChar('Project discussion title', MAX_CHAR)),
  content: z.string(errorMessages.invalidType('Project discussion content', 'text')),
  closedAt: z.iso.datetime(errorMessages.invalidDate('Project discussion closed at date')),
  updatedAt: z.iso.datetime(errorMessages.invalidDate('Project discussion updated date')),
});

export const ProjectDiscussionCommentSchema = z.object({
  authorId: z.uuidv4(errorMessages.uuid('Project discussion comment author ID')),
  content: z.string(errorMessages.invalidType('Project discussion comment content', 'text')),
  projectDiscussionId: z.uuidv4(errorMessages.uuid('Project ID')),
  parentCommentId: z.uuidv4('Project discussion parent comment ID'),
  updatedAt: z.iso.datetime(errorMessages.invalidDate('Project discussion comment update date')),
});

export const UserSchema = z.object({
  id: z.uuid(),
  clerkId: z.string().trim(),
  firstName: z.string().trim().max(255, 'First name is too long'),
  lastName: z.string().trim().max(255, 'Last name is too long'),
  imgLink: z.string().trim().max(255, 'Last name is too long'),
  primaryEmailAdress: z.email().trim(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export const TaskCommentSchema = z.object({
  id: z.uuid(),
  content: z.string(),
  taskId: z.int().positive(),
  parentCommentId: z.uuid(),
  authorId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const KanbanColumnSchema = z.object({
  id: z.int().positive(),
  name: z.string().max(255, 'Column name is too long'),
  description: z.string().max(255, 'Descriptio name is too long'),
  projectId: z.uuid(),
  position: z.int().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MilestoneSchema = z.object({
  id: z.int().positive(),
  milestoneName: z.string().max(255, 'Milestone name is too long'),

  createdAt: z.date(),
  achievedAt: z.date(),
});

export const TaskAttachmentSchema = z.object({
  id: z.int().positive(),
  taskId: z.int().positive(),

  // TODO add advance validation for filename format (perhaps use refine)
  filename: z.string(),
  filetype: z.string(),
  filepath: z.string(),
  uploadedBy: z.uuid(),
  uploadedAt: z.date(),
});

export const TaskHistorySchema = z.object({
  id: z.int().positive(),
  taskId: z.int().positive(),
  changedBy: z.uuid(),
  changeDescription: z.string(),
  changedAt: z.date(),
});

export const LabelSchema = z.object({
  id: z.int().positive(),
  name: z.string().max(255, 'Label name is too long'),

  // TODO create advance string format for hex colors
  color: z.string().max(7, 'Color format is too long. Not a in valid hex format'),
});

// TODO add validations for join tables
