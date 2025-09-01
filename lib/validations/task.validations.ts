import z from 'zod';
import { errorMessages, isFuture, MAX_CHAR, MIN_CHAR } from '../utils/validation.utils';
import { TASK_PRIORITY_VALUES } from '../db/schema/enums';

export const TaskSchema = z.object({
  title: z
    .string(errorMessages.invalidType('Task title', 'text'))
    .min(MIN_CHAR, errorMessages.minChar('Task title'))
    .max(MAX_CHAR, errorMessages.maxChar('Task title', MAX_CHAR))
    .trim(),
  description: z
    .string(errorMessages.invalidType('Task description', 'text'))
    .max(MAX_CHAR, errorMessages.maxChar('Task description', MAX_CHAR))
    .trim()
    .nullable(),
  detail: z.string(errorMessages.invalidType('Task detail', 'text')).trim().nullable(),
  status: z.string(errorMessages.invalidType('Task status', 'text')),
  priority: z.enum(TASK_PRIORITY_VALUES),
  position: z.int(errorMessages.integer('Task position')).refine((n) => n >= 0, {
    error: 'Task position must be zero or positive',
  }),
  projectId: z.uuidv4(errorMessages.uuid('Project ID')).trim(),
  createdById: z.uuidv4(errorMessages.uuid('Created By ID')).trim(),
  projectKanbanColumnId: z
    .int(errorMessages.invalidType('Kanban Column ID', 'number'))
    .nonnegative(),
  isCompleted: z.boolean(errorMessages.invalidType('is_completed', 'true or false')),
  milestoneId: z
    .int(errorMessages.integer('Milestone ID'))
    .positive(errorMessages.positive('Milestone ID'))
    .nullable(),
  startDate: z.iso
    .date(errorMessages.invalidDate('Due date'))
    .refine((dateString) => isFuture(dateString), {
      error: 'Start date must be set today or in the future',
    })
    .nullable(),
  dueDate: z.iso
    .date(errorMessages.invalidDate('Due date'))
    .refine((dateString) => isFuture(dateString), {
      error: 'Due date must be set today or in the future',
    })
    .nullable(),

  // will be omitted in insertion
  updatedAt: z.date(errorMessages.invalidDate('Task updated date')),
});

export const FormTaskSchema = TaskSchema.extend({
  labels: z.array(z.int().positive()).nullable(),
  assignees: z.array(z.uuidv4(errorMessages.uuid('Assignee ID')).trim()).nullable(),
});

// assumes it has data
export const AddTaskLabelSchema = z.object({
  labels: z.array(z.int().positive()),
});

// assumes it has data
export const AssignTaskSchema = z.object({
  assignees: z.array(z.uuidv4(errorMessages.uuid('Assignee ID')).trim()),
});

export const InserFormTaskSchema = FormTaskSchema.pick({
  title: true,
  description: true,
  detail: true,
  priority: true,
  startDate: true,
  dueDate: true,
  labels: true,
  status: true,
  assignees: true,
});
export type InserFormTaskType = z.input<typeof InserFormTaskSchema>;
