import { ProjectMember } from '@/types/db.types';

export function hasRole(
  memberRole: ProjectMember['role'],
  allowedRoles: Array<ProjectMember['role']>,
): boolean {
  return allowedRoles.includes(memberRole);
}
