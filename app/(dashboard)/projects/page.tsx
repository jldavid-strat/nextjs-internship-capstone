import { getCurrentUserId } from '@/lib/queries/user.queries';
import ProjectList from '@/components/project/project-list';
import { getAllUserProject } from '@/lib/queries/project.queries';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';

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
        <Button
          onClick={() => redirect('/projects/create')}
          className="bg-blue_munsell-500 hover:bg-blue_munsell-600 inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors"
        >
          <Plus size={20} className="mr-2" />
          New Project
        </Button>
      </div>

      {/* project grid */}
      <ProjectList projectList={projectList ?? []} />
    </div>
  );
}
