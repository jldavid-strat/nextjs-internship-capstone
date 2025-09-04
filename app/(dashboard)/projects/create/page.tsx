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
      {/* Implementation Tasks Banner */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <h3 className="mb-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
          📋 Projects Page Implementation Tasks
        </h3>
        <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
          <li>• Task 4.1: Implement project CRUD operations</li>
          <li>• Task 4.2: Create project listing and dashboard interface</li>
          <li>• Task 4.5: Design and implement project cards and layouts</li>
          <li>• Task 4.6: Add project and task search/filtering capabilities</li>
        </ul>
      </div>
    </div>
  );
}
