import { CreateProjectButton } from '@/components/buttons/create-project-button';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import ProjectList from '@/components/project-list';
import { getAllUserProject } from '@/lib/queries/project.queries';

export default async function ProjectsPage() {
  const currentUserId = await getCurrentUserId();

  const { data: projectList } = await getAllUserProject(currentUserId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary text-3xl font-bold">📁 Projects</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage and organize your team projects
          </p>
        </div>
        <CreateProjectButton />
      </div>

      {/* project grid */}
      <ProjectList projectList={projectList ?? []} />
    </div>
  );
}
