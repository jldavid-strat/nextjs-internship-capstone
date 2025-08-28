import { Search, Filter } from 'lucide-react';
import { AddProjectForm } from '../../../components/project-grid';
import { CreateProjectButton } from '@/components/buttons/create-project-button';
import { getCurrentUserId } from '@/lib/queries/user.queries';
import ProjectList from '@/components/project-list';
import { Input } from '@/components/ui/input';

export default async function ProjectsPage() {
  const currentUserId = await getCurrentUserId();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-primary text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage and organize your team projects
          </p>
        </div>
        <CreateProjectButton />
      </div>
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

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 transform" size={18} />
          <Input
            type="text"
            placeholder="Search projects..."
            className="border-border h-12 w-full rounded-lg py-2 pr-4 pl-10 text-xl focus:ring focus:outline-hidden"
          />
        </div>
        <button className="bg-input inline-flex items-center rounded-lg px-4 py-2 transition-colors">
          <Filter size={16} className="mr-2" />
          Filter
        </button>
      </div>

      {/* project grid */}
      <ProjectList userId={currentUserId} />
      {/* Component Placeholders */}
      <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-800/50">
        <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
          📁 Components to Implement
        </h3>
        <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2 dark:text-gray-400">
          <div>
            <strong>components/project-card.tsx</strong>
            <p>Project display component with progress, members, and actions</p>
          </div>
          <div>
            <strong>components/modals/create-project-modal.tsx</strong>
            <p>Modal for creating new projects with form validation</p>
          </div>
          <div>
            <strong>hooks/use-projects.ts</strong>
            <p>Custom hook for project data fetching and mutations</p>
          </div>
          <div>
            <strong>lib/db/schema.ts</strong>
            <p>Database schema for projects, lists, and tasks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
