import 'server-only';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/connect_db';
import { rolePermissions } from '@/migrations/schema';
import { MemberRole } from '../db/schema/enums';
import { Action, IAuthorizationResult, PermissionResult, Resource } from '@/constants/permissions';
import { getMemberRole } from './project_member.queries';
import { Project, User } from '@/types/db.types';

export async function checkPermission(
  role: MemberRole,
  resource: Resource,
  action: Action,
): Promise<IAuthorizationResult> {
  try {
    if (!role || !resource || !action) {
      return {
        isAuthorize: false,
        result: PermissionResult.DENIED,
      };
    }
    const [result] = await db
      .select({
        isAllowed: sql<boolean>`${rolePermissions.permissions} -> ${resource} @> ${JSON.stringify([action])}`,
      })
      .from(rolePermissions)
      .where(eq(rolePermissions.role, role));

    if (!result.isAllowed) {
      return {
        isAuthorize: true,
        result: PermissionResult.DENIED,
      };
    }

    if (!result.isAllowed) {
      return {
        isAuthorize: false,
        result: PermissionResult.DENIED,
      };
    }

    return {
      isAuthorize: true,
      result: PermissionResult.ALLOWED,
    };
  } catch (error) {
    console.error('Permission check failed:', error);
    return {
      isAuthorize: false,
      result: PermissionResult.ERROR,
    };
  }
}

export async function checkMemberPermission(
  userId: User['id'],
  projectId: Project['id'],
  resource: Resource,
  action: Action,
  isOwner?: boolean,
): Promise<IAuthorizationResult> {
  try {
    // for anonymous users, use viewer role
    if (!userId) {
      return await checkPermission('viewer', resource, action);
    }

    if (isOwner) {
      return await checkPermission('owner', resource, action);
    }

    // get user's role
    const { success, data: userRole } = await getMemberRole(userId, projectId);
    if (!success || !userRole) {
      return {
        isAuthorize: false,
        result: PermissionResult.DENIED,
      };
    }

    return await checkPermission(userRole, resource, action);
  } catch (error) {
    console.error('Project member permission check failed:', error);
    return {
      isAuthorize: false,
      result: PermissionResult.ERROR,
    };
  }
}

export async function checkResourcePermission(
  userId: User['id'],
  projectId: Project['id'],
  resource: Resource,
  action: Action,
  resourceOwnerId?: string,
): Promise<IAuthorizationResult> {
  const authResult = await checkMemberPermission(userId, projectId, resource, action);

  // if permission denied but user owns the resource, check if they can do it to their own
  if (
    authResult.result === PermissionResult.DENIED &&
    userId &&
    resourceOwnerId &&
    userId === resourceOwnerId
  ) {
    // check if authenticated users can perform this action on their own resources
    const ownershipResult = await checkPermission('admin', resource, action);
    if (ownershipResult.result === PermissionResult.ALLOWED) {
      return { isAuthorize: true, result: PermissionResult.ALLOWED };
    }
  }

  return authResult;
}
