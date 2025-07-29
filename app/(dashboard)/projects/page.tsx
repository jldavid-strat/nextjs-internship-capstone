import { ProjectGrid } from '@/components/project-grid';
import { Plus, Search, Filter } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-outer_space-500 dark:text-platinum-500 text-3xl font-bold">
            Projects
          </h1>
          <p className="text-payne's_gray-500 dark:text-french_gray-500 mt-2">
            Manage and organize your team projects
          </p>
        </div>
        <button className="bg-blue_munsell-500 hover:bg-blue_munsell-600 inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors">
          <Plus size={20} className="mr-2" />
          New Project
        </button>
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
          <Search
            className="text-payne's_gray-500 dark:text-french_gray-400 absolute top-1/2 left-3 -translate-y-1/2 transform"
            size={16}
          />
          <input
            type="text"
            placeholder="Search projects..."
            className="dark:bg-outer_space-500 border-french_gray-300 dark:border-payne's_gray-400 text-outer_space-500 dark:text-platinum-500 placeholder-payne's_gray-500 dark:placeholder-french_gray-400 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white py-2 pr-4 pl-10 focus:ring-2 focus:outline-hidden"
          />
        </div>
        <button className="border-french_gray-300 dark:border-payne's_gray-400 text-outer_space-500 dark:text-platinum-500 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 inline-flex items-center rounded-lg border px-4 py-2 transition-colors">
          <Filter size={16} className="mr-2" />
          Filter
        </button>
      </div>
      {/* Projects Grid Placeholder */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="dark:bg-outer_space-500 border-french_gray-300 dark:border-payne's_gray-400 rounded-lg border bg-white p-6 transition-shadow hover:shadow-lg"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="bg-blue_munsell-500 h-3 w-3 rounded-full"></div>
              <div className="text-payne's_gray-500 dark:text-french_gray-400 text-sm">
                {Math.floor(Math.random() * 30) + 1} days left
              </div>
            </div>

            <h3 className="text-outer_space-500 dark:text-platinum-500 mb-2 text-lg font-semibold">
              Sample Project {i}
            </h3>

            <p className="text-payne's_gray-500 dark:text-french_gray-400 mb-4 text-sm">
              This is a placeholder project description that will be replaced with actual
              project data.
            </p>

            <div className="text-payne's_gray-500 dark:text-french_gray-400 mb-4 flex items-center justify-between text-sm">
              <span>{Math.floor(Math.random() * 8) + 2} members</span>
              <span>{Math.floor(Math.random() * 20) + 5} tasks</span>
            </div>

            <div className="bg-french_gray-300 dark:bg-payne's_gray-400 h-2 w-full rounded-full">
              <div
                className="bg-blue_munsell-500 h-2 rounded-full"
                style={{ width: `${Math.floor(Math.random() * 80) + 20}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      {/* try project list */}
      <ProjectGrid />
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
