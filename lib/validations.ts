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
*/
const BaseProjectSchema = z.object({
  id: z.uuid(),
  title: z.string().max(300, 'Title is too long. 300 max characters'),
  description: z.string().max(300, 'Description too long. 300 max characters').optional(),
  status: z.enum(PROJECT_STATUS_VALUES).default('active'),
  statusChangedAt: z.date().optional(),
  statusChangedBy: z.int().positive().optional(),
  ownerId: z.uuid(),
  dueDate: z.date().optional(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

export const ProjectSchema = {
  response: BaseProjectSchema,
  insert: BaseProjectSchema.omit({
    id: true,
    statusChangedAt: true,
    statusChangedBy: true,
    updatedAt: true,
  }),
  update: BaseProjectSchema.partial().omit({
    id: true,
  }),
};

const BaseTaskSchema = z.object({
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

export const TaskSchema = {
  response: BaseTaskSchema,
  insert: BaseTaskSchema,
  update: BaseTaskSchema,
};

export const BaseTeamSchema = z.object({
  title: z.string().max(256, 'Title is too long. 300 max characters'),
  description: z.string().max(300, 'Description too long. 300 max characters').optional(),
  // TODO create advance string format for hex colors
  color: z.string().max(7, 'Color format is too long. Not a in valid hex format'),
  projectId: z.uuid().optional(),
  createdBy: z.int().positive(),
  createdAt: z.date().default(new Date()),
});

const BaseProjecDiscussionSchema = z.object({
  id: z.int().positive(),
  projectId: z.uuid(),
  title: z.string().max(255, 'Title'),
  content: z.string(),
  createdAt: z.date(),
  closedAt: z.date(),
});

export const ProjectDiscussionSchema = {
  response: BaseProjecDiscussionSchema,
  insert: BaseProjecDiscussionSchema,
  update: BaseProjecDiscussionSchema,
};

export const TeamSchema = {
  response: BaseTeamSchema,
  insert: BaseTeamSchema,
  update: BaseTeamSchema,
};

const BaseUserSchema = z.object({
  id: z.uuid(),
  clerkId: z.string(),
  firstName: z.string().max(255, 'First name is too long'),
  lastName: z.string().max(255, 'Last name is too long'),
  imgLink: z.string().max(255, 'Last name is too long'),
  primaryEmailAdress: z.email(),
  jobPositionId: z.int().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserSchema = {
  response: BaseUserSchema,
  insert: BaseUserSchema,
  update: BaseUserSchema,
};

const BaseTaskCommentSchema = z.object({
  id: z.uuid(),
  content: z.string(),
  taskId: z.int().positive(),
  parentCommentId: z.uuid(),
  authorId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TaskCommentSchema = {
  response: BaseTaskCommentSchema,
  insert: BaseTaskCommentSchema,
  update: BaseTaskCommentSchema,
};

const BaseKanbanColumnSchema = z.object({
  id: z.int().positive(),
  name: z.string().max(255, 'Column name is too long'),
  description: z.string().max(255, 'Descriptio name is too long'),
  projectId: z.uuid(),
  position: z.int().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const KanbanColumnSchema = {
  response: BaseKanbanColumnSchema,
  insert: BaseKanbanColumnSchema,
  update: BaseKanbanColumnSchema,
};

const BaseMilestoneSchema = z.object({
  id: z.int().positive(),
  milestoneName: z.string().max(255, 'Milestone name is too long'),

  createdAt: z.date(),
  achievedAt: z.date(),
});

export const MilestoneSchema = {
  response: BaseMilestoneSchema,
  insert: BaseMilestoneSchema,
  update: BaseMilestoneSchema,
};

const BaseTaskAttachmentSchema = z.object({
  id: z.int().positive(),
  taskId: z.int().positive(),

  // TODO add advance validation for filename format (perhaps use refine)
  filename: z.string(),
  filetype: z.string(),
  filepath: z.string(),
  uploadedBy: z.uuid(),
  uploadedAt: z.date(),
});

export const TaskAttachmentSchema = {
  response: BaseTaskAttachmentSchema,
  insert: BaseTaskAttachmentSchema,

  // TODO verify if this is needed
  update: BaseTaskAttachmentSchema,
};

const BaseTaskHistorySchema = z.object({
  id: z.int().positive(),
  taskId: z.int().positive(),
  changedBy: z.uuid(),
  changeDescription: z.string(),
  changedAt: z.date(),
});

export const taskHistorySchema = z.object({
  response: BaseTaskHistorySchema,
  insert: BaseTaskHistorySchema,
});

const BaseLabelSchema = z.object({
  id: z.int().positive(),
  name: z.string().max(255, 'Label name is too long'),

  // TODO create advance string format for hex colors
  color: z.string().max(7, 'Color format is too long. Not a in valid hex format'),
});

export const LabelSchema = {
  response: BaseLabelSchema,
  insert: BaseLabelSchema,
  update: BaseLabelSchema,
};

// TODO add validations for join tables
