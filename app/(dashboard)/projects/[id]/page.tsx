import { getProjectHeaderData } from '@/lib/queries/project.queries';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { ProjectNotFound } from '@/components/project/project-not-found';
import ProjectHeader from '@/components/project/project-header';
import ViewTaskModal from '@/components/modals/view-task-modal';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const projectId = (await params).id;

  const { data: projectHeaderData } = await getProjectHeaderData(projectId);

  if (!projectHeaderData) return <ProjectNotFound />;

  const project = projectHeaderData;

  return (
    <div className="text-foreground space-y-6">
      {/* Project Header */}
      <ProjectHeader
        project={{
          title: project.title,
          description: project.description ?? '',
          dueDate: project.dueDate ?? '',
          status: project.status,
          createdAt: project.createdAt!,
          totalTasks: project.totalTasks,
          memberCount: project.memberCount,
          completedTasks: project.completedTasks,
          owner: {
            firstName: project.ownerData?.firstName ?? '',
            lastName: project.ownerData?.lastName ?? '',
            userImgLink: project.ownerData?.userImgLink ?? '',
          },
        }}
        projectId={projectId}
      />
      {/* page level for view task sheet */}
      <ViewTaskModal />
      <KanbanBoard projectId={projectId} />
    </div>
  );
}
