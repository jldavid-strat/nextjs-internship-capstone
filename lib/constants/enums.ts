// 'as const' makes the list readonly, which prevents mutability
export const PROJECT_STATUS_VALUES = [
  'active',
  'completed',
  'archived',
  'on_going',
  'cancelled',
] as const;

export const TASK_STATUS_VALUES = ['in_progress', 'planning', 'review', 'done'] as const;

export const TASK_PRIORITY_VALUES = ['low', 'medium', 'high'] as const;

export const MEMBER_ROLE_VALUES = ['owner', 'admin', 'viewer', 'member'] as const;

export const JOB_POSITION_VALUES = [
  'project_manager',
  'developer',
  'qa',
  'designer',
] as const;

// derived types
export type ProjectStatus = (typeof PROJECT_STATUS_VALUES)[number];
export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];
export type TaskPriority = (typeof TASK_PRIORITY_VALUES)[number];
export type MemberRole = (typeof MEMBER_ROLE_VALUES)[number];
export type JobPosition = (typeof JOB_POSITION_VALUES)[number];
