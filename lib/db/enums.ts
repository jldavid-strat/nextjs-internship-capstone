import { pgEnum } from 'drizzle-orm/pg-core';

export const projectStatusEnum = pgEnum('project_status', [
  'active',
  'completed',
  'archived',
  'on_going',
  'cancelled',
]);

export const taskStatusEnum = pgEnum('task_status', [
  'in_progress',
  'planning',
  'review',
  'done',
]);

export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high']);

export const teamMemberRoleEnum = pgEnum('team_member_role', [
  'team_manager',
  'viewer',
  'member',
]);

export const jobPositionNameEnum = pgEnum('job_position_name', [
  'project_manager',
  'developer',
  'qa',
  'designer',
]);
