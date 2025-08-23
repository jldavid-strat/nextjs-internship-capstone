export const RESOURCES = {
  PROJECTS: 'projects',
  PROJECT_TEAMS: 'project_teams',
  PROJECT_MEMBERS: 'project_members',
  PROJECT_DISCUSSIONS: 'project_discussions',
  PROJECT_COMMENTS: 'projects_comments',
  TASKS: 'tasks',
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
  ASSIGN_MEMBERS: 'assign_members',
  TRANSFER: 'transfer',
  ARCHIVE: 'archive',
  CHANGE_ROLE: 'change_role',
} as const;

export const GLOBAL_PERMISSIONS = {
  owner: {
    tasks: ['view', 'create', 'update', 'delete', 'assign'],
    projects: ['view', 'create', 'update', 'delete', 'transfer', 'archive'],
    members: ['view', 'invite', 'remove', 'change_role'],
    teams: ['view', 'create', 'update', 'delete', 'assign_members'],
  },
  admin: {
    tasks: ['view', 'create', 'update', 'delete', 'assign'],
    projects: ['view', 'update'],
    members: ['view', 'invite', 'remove'],
    teams: ['view', 'create', 'update', 'assign_members'],
  },
  team_leader: {
    tasks: ['view', 'create', 'update', 'delete', 'assign'],
    projects: ['view', 'update'],
    members: ['view', 'invite', 'remove'],
    teams: ['view', 'create', 'update', 'assign_members'],
  },
  member: {
    tasks: ['view', 'create', 'update', 'delete'],
    projects: ['view'],
    members: ['view'],
    teams: ['view'],
    task_comment: ['view', 'create', 'update', 'delete'],
    project_discussion: ['view', 'create', 'update', 'delete'],
  },
  viewer: {
    tasks: ['view'],
    projects: ['view'],
    members: ['view'],
    teams: ['view'],
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
