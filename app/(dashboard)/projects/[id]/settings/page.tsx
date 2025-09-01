import EditProjectForm from '@/components/forms/edit-project-form';
import { getProjectDataById } from '@/lib/queries/project.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import { Project } from '@/types/db.types';
import MemberDataBox from '@/components/project/member-data-box';
import EditDangerZone from '@/components/project/edit-danger-zone';
import { SearchX, User, Users } from 'lucide-react';
import { ProjectDataNotFound } from '@/components/project/project-not-found';
import ProjectSubHeader from '@/components/project/project-subheader';
import { MemberDataTable } from '@/components/data-table/member-data-table';
import { hasRole } from '@/lib/utils/has_role';
import ProjectLabelSection from '@/components/project/project-label-section';

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: Project['id'] }>;
}) {
  const { id: projectId } = await params;
  const currentUserId = await getCurrentUserId();

  const { success: isProjectSucess, data: projectData } = await getProjectDataById(projectId);

  if (!isProjectSucess || !projectData)
    return <div className="space-y-6">This project does not exist</div>;

  const projectInfo = projectData.projectData;
  const projectMembers = projectData.projectMembers ?? [];
  const projectTeams = projectData.projectTeams;
  const projectLabels = projectData.projectLabels ?? [];

  console.log('projectMembers', projectMembers);
  const currentProjectMember = projectMembers.find((m) => m.userId === currentUserId)!;

  const canMutateMember = hasRole(currentProjectMember.role, ['admin', 'owner']);
  const canMutateLabel = hasRole(currentProjectMember.role, ['admin', 'owner', 'owner']);

  return (
    <div className="space-y-6">
      <div className="max-w-[800px] space-y-4">
        <MemberDataBox memberData={{ ...currentProjectMember }} />
        <EditProjectForm projectData={projectInfo} />
        <EditDangerZone />
        <ProjectSubHeader
          title={'Project Members'}
          description={'View, add, remove and change roles of project member'}
          icon={<User size={20} />}
          color="text-primary"
        />
        {/* TODO: add way to change roles or add new members */}
        <MemberDataTable data={projectMembers} canMutate={canMutateMember} />
        <ProjectLabelSection
          projectId={projectId}
          canMutate={canMutateLabel}
          projectLabels={projectLabels}
        />
        <ProjectSubHeader
          title={'Project Teams'}
          description={'View, add, remove and change roles of project member'}
          icon={<Users size={20} />}
          color="text-primary"
        />
        {/* TODO: add way to add and modify teams */}
        <div className="bg-input/30 rounded-sm">
          {projectTeams?.length === 0 && (
            <ProjectDataNotFound
              message="No project teams found"
              icon={<SearchX size={40} className="text-muted-foreground" />}
            />
          )}
        </div>
      </div>
    </div>
  );
}
