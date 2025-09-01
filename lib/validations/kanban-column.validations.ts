import z from 'zod';
import { errorMessages, MIN_CHAR } from '../utils/validation.utils';

export const KanbanColumnSchema = z.object({
  name: z
    .string(errorMessages.invalidType('Kanban Name', 'text'))
    .min(MIN_CHAR, errorMessages.minChar('Kanban Name'))
    .max(50, errorMessages.maxChar('Kanban Name', 50))
    .trim(),
  description: z.string().max(50, 'Description name is too long').trim(),
  projectId: z.uuidv4(errorMessages.uuid('Project ID')).trim(),
  position: z.int().nonnegative(),
  updatedAt: z.date(errorMessages.invalidDate('Kanban name updated date')),
});

export const FormKanbanColumnSchema = KanbanColumnSchema.omit({
  updatedAt: true,
  position: true,
  projectId: true,
});

export const InsertKanbanColumnSchema = KanbanColumnSchema.omit({
  updatedAt: true,
});

export type FormKanbanColumnSchemaType = z.input<typeof FormKanbanColumnSchema>;
