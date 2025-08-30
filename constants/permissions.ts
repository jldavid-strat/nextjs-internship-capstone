export const RESOURCES = {
  PROJECTS: 'projects',
  PROJECT_TEAMS: 'project_teams',
  PROJECT_MEMBERS: 'project_members',
  PROJECT_DISCUSSIONS: 'project_discussions',
  PROJECT_COMMENTS: 'project_comments',
  PROJECT_LABELS: 'project_labels',
  TASKS: 'tasks',
  KANBAN_COLUMN: 'kanban_columns',
  TASK_ATTACHMENTS: 'task_attachment',
  TASK_COMMENTS: 'task_comment',
} as const;

export const ACTIONS = {
  CREATE: 'create',
  VIEW: 'view',
  UPDATE: 'update',
  DELETE: 'delete',
  REMOVE: 'remove',
  ASSIGN: 'assign',
  INVITE: 'invite',
  ADD_MEMBERS: 'add_members',
  TRANSFER: 'transfer',
  ARCHIVE: 'archive',
  CHANGE_ROLE: 'change_role',
} as const;

export const GLOBAL_PERMISSIONS = {
  owner: {
    tasks: ['view', 'create', 'update', 'delete', 'assign'],
    projects: ['view', 'create', 'update', 'delete', 'transfer', 'archive'],
    members: ['view', 'invite', 'remove', 'change_role'],
    teams: ['view', 'create', 'update', 'delete', 'add_members'],
    project_labels: ['view', 'create', 'update', 'delete'],
  },
  admin: {
    tasks: ['view', 'create', 'update', 'delete', 'assign'],
    projects: ['view', 'update'],
    members: ['view', 'invite', 'remove', 'change_role'],
    teams: ['view', 'create', 'update', 'add_members'],
    project_labels: ['view', 'create', 'update', 'delete'],
  },
  team_leader: {
    tasks: ['view', 'create', 'update', 'delete', 'assign'],
    projects: ['view', 'update'],
    members: ['view', 'invite', 'remove', 'change_role'],
    teams: ['view', 'create', 'update', 'add_members'],
    project_labels: ['view', 'create', 'update', 'delete'],
  },
  member: {
    tasks: ['view', 'create', 'update', 'delete'],
    projects: ['view'],
    members: ['view'],
    teams: ['view'],
    project_labels: ['view', 'create', 'update', 'delete'],
    task_comment: ['view', 'create', 'update', 'delete'],
    project_discussion: ['view', 'create', 'update', 'delete'],
  },
  viewer: {
    tasks: ['view'],
    projects: ['view'],
    members: ['view'],
    teams: ['view'],
    project_labels: ['view'],
  },
};

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];
export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

export enum PermissionResult {
  ALLOWED = 'allowed',
  DENIED = 'denied',
  ERROR = 'error',
}

export interface IAuthorizationResult {
  isAuthorize: boolean;
  result: PermissionResult;
}
