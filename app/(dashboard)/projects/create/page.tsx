import CreateProjectForm from '@/components/forms/create-project-form';
import { getCurrentUserId } from '@/lib/queries/user.queries';

export default async function CreateProjectPage() {
  const currentUserId = await getCurrentUserId();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary text-3xl font-bold">Create Project</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage and organize your team projects
          </p>
        </div>
      </div>
      <CreateProjectForm currentUserId={currentUserId} />
    </div>
  );
}
