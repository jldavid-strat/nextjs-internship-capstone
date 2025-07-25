import { pgEnum } from 'drizzle-orm/pg-core';

export const projectStatus = pgEnum('project_status', [
  'active',
  'completed',
  'archived',
  'on_going',
  'cancelled',
]);

export const taskStatus = pgEnum('task_status', [
  'in_progress',
  'planning',
  'review',
  'done',
]);

export const taskPriority = pgEnum('task_priority', ['low', 'medium', 'high']);

export const teamMemberRole = pgEnum('team_member_role', [
  'team_manager',
  'viewer',
  'member',
]);

export const jobPositionName = pgEnum('job_position_name', [
  'project_manager',
  'developer',
  'qa',
  'designer',
]);
