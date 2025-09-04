import { getProjectLabels } from '@/actions/project_labels.actions';
import { getProjectMembers } from '@/actions/project_member.actions';
import { ProjectLabelTableData } from '@/components/data-table/project-label-table';
import { Project, User } from '@/types/db.types';
import { useCallback } from 'react';

export function useFetchMultiSelect(projectId: Project['id']) {
  const fetchProjectLabels = useCallback(
    async (searchTerm: string): Promise<ProjectLabelTableData[]> => {
      return (await getProjectLabels(projectId, searchTerm)) ?? [];
    },
    [projectId],
  );

  const fetchProjectMembers = useCallback(
    async (searchTerm: string): Promise<User[]> => {
      const maxCount = 4;
      const projectMembers = (await getProjectMembers(projectId, searchTerm, maxCount)) ?? [];

      const userData = projectMembers.map((u) => u.userData);
      return userData;
    },
    [projectId],
  );

  return { fetchProjectLabels, fetchProjectMembers };
}
