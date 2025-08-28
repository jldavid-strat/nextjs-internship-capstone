import EditProjectForm from '@/components/forms/edit-project-form';
import { getProjectDataById } from '@/lib/queries/project.queries';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import { Project } from '@/types/db.types';
import EditProjectHeading from '../../../../../components/project/edit-project-heading';
import EditDangerZone from '@/components/project/edit-danger-zone';
import { User, Users } from 'lucide-react';
import ProjectMemberTable from '@/components/project/project-member-table';
import ProjectTeamNotFound from '@/components/project/project-team-not-found';
import ProjectSubHeader from '@/components/project/project-subheader';

export default async function SettingsProjectPage({
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
  const projectMembers = projectData.projectMembers!;
  const projectTeams = projectData.projectTeams;

  const currentProjectMember = projectMembers.find((m) => m.userId === currentUserId)!;

  return (
    <div className="space-y-6">
      <div className="max-w-[800px] space-y-4">
        <EditProjectHeading
          memberData={{ ...currentProjectMember }}
          createdAt={projectInfo.createdAt!}
        />
        <EditProjectForm projectData={projectInfo} />
        <EditDangerZone />
        <ProjectSubHeader
          title={'Project Members'}
          description={'View, add, remove and change roles of project member'}
          icon={<User size={20} />}
          color="text-primary"
        />
        {/* TODO: add way to change roles or add new members */}
        <ProjectMemberTable projectMembers={projectMembers} />

        <ProjectSubHeader
          title={'Project Teams'}
          description={'View, add, remove and change roles of project member'}
          icon={<Users size={20} />}
          color="text-primary"
        />

        {/* TODO: add way to add and modify teams */}
        <div className="bg-input/30 rounded-sm">
          {projectTeams?.length == 0 && <ProjectTeamNotFound />}
        </div>
      </div>
    </div>
  );
}
