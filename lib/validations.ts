// TODO: Task 3.6 - Set up data validation with Zod schemas

import { z } from 'zod';
import {
  PROJECT_STATUS_VALUES,
  TASK_PRIORITY_VALUES,
  TASK_STATUS_VALUES,
} from './constants/enums';

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

Example structure:
import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  dueDate: z.date().min(new Date(), 'Due date must be in future').optional(),
})

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().optional(),
  assigneeId: z.string().uuid().optional(),
})
*/

// Placeholder exports to prevent import errors
export const InsertProjectSchema = z.object({
  id: z.uuid(),
  title: z.string().max(300, 'Title is too long. 300 max characters'),
  description: z.string().max(300, 'Description too long. 300 max characters').optional(),
  status: z.enum(PROJECT_STATUS_VALUES).default('active'),
  statusChangedAt: z.date().optional(),
  statusChangedBy: z.int().positive().optional(),
  updatedAt: z.date(),
  ownerId: z.uuid(),
  dueDate: z.date().optional(),
  createdAt: z.date().default(new Date()),
});

export const UpdateProjectZod = InsertProjectSchema.extend({
  statusChangedAt: z.date().optional().nullable(),
  statusChangedBy: z.uuid().optional().nullable(),
  updatedAt: z.date(),
});

export const SelectProjectZod = UpdateProjectZod.extend({
  id: z.int().positive(),
});

export const InserTaskSchema = z.object({
  title: z.string().max(300, 'Title is too long. 300 max characters'),
  description: z.string().max(300, 'Description too long. 300 max characters').optional(),
  detail: z.string().optional(),
  status: z.enum(TASK_STATUS_VALUES).default('planning'),
  priority: z.enum(TASK_PRIORITY_VALUES).default('low'),
  projectId: z.uuid(),
  kanbanColumnId: z.int().positive(),
  milestoneId: z.int().positive().optional(),
  dueDate: z.date().optional(),
  createdAt: z.date().default(new Date()),
});

export const UpdateTaskZod = InserTaskSchema.extend({
  updatedAt: z.date(),
});

export const SelectTaskZod = UpdateTaskZod.extend({
  id: z.int().positive(),
});

export const InsertTeamSchema = z.object({
  title: z.string().max(256, 'Title is too long. 300 max characters'),
  description: z.string().max(300, 'Description too long. 300 max characters').optional(),
  projectId: z.uuid().optional(),
  createdBy: z.int().positive(),
  createdAt: z.date().default(new Date()),
});

export const userSchema = 'TODO: Implement user validation schema';
export const listSchema = 'TODO: Implement list validation schema';
export const commentSchema = 'TODO: Implement comment validation schema';
