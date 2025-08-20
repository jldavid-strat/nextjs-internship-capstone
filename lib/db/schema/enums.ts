import { pgEnum } from 'drizzle-orm/pg-core';

// 'as const' makes the list readonly, which prevents mutability
export const PROJECT_STATUS_VALUES = [
  'active',
  'completed',
  'archived',
  'on-going',
  'cancelled',
] as const;

export const TASK_STATUS_VALUES = ['none', 'in-progress', 'planning', 'review', 'done'] as const;

export const TASK_PRIORITY_VALUES = ['none', 'low', 'medium', 'high'] as const;

export const MEMBER_ROLE_VALUES = [
  'public',
  'owner',
  'admin',
  'team_leader',
  'viewer',
  'member',
] as const;

// the only roles that can be selectable from a form
export const SELECT_ROLE_VALUES = ['admin', 'viewer', 'member'] as const;

// derived types
export type ProjectStatus = (typeof PROJECT_STATUS_VALUES)[number];
export type TaskPriority = (typeof TASK_PRIORITY_VALUES)[number];
export type MemberRole = (typeof MEMBER_ROLE_VALUES)[number];
export type SelectMemberRole = (typeof SELECT_ROLE_VALUES)[number];

export const projectStatusEnum = pgEnum('project_status', PROJECT_STATUS_VALUES);

export const taskPriorityEnum = pgEnum('task_priority', TASK_PRIORITY_VALUES);

export const memberRoleEnum = pgEnum('member_role_name', MEMBER_ROLE_VALUES);
