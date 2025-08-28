import { ArrowLeft, Settings, Users, Calendar, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { getProjectById } from '@/lib/queries/project.queries';
import { EditProjectButton } from '../../../../components/buttons/edit-project-button';
import { KanbanBoard } from '@/components/kanban-board';
import { DBKanbanBoard } from '@/components/kanban/kanban-board';
import ProjectNotFound from '@/components/project/project-not-found';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const projectId = (await params).id;

  console.log(projectId);
  const { success, data } = await getProjectById(projectId);

  if (!success || !data) return <ProjectNotFound />;

  const project = data;

  return (
    <div className="text-foreground space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/projects" className="hover:bg-accent rounded-lg p-2 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="mt-1">{project.description}</p>
            <p className="mt-1">{project.status}</p>
            <p className="mt-1">{project.dueDate}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* <EditProjectButton
            id={project.id}
            title={project.title}
            description={project.description}
            status={project.status}
            dueDate={project.dueDate}
          /> */}
          <button className="rounded-lg p-2 transition-colors">
            <Users size={20} />
          </button>
          <button className="rounded-lg p-2 transition-colors">
            <Calendar size={20} />
          </button>
          <button className="rounded-lg p-2 transition-colors">
            <Settings size={20} />
          </button>
          <button className="rounded-lg p-2 transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Implementation Tasks Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
          🎯 Kanban Board Implementation Tasks
        </h3>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• Task 5.1: Design responsive Kanban board layout</li>
          <li>• Task 5.2: Implement drag-and-drop functionality with dnd-kit</li>
          <li>• Task 5.4: Implement optimistic UI updates for smooth interactions</li>
          <li>• Task 5.6: Create task detail modals and editing interfaces</li>
        </ul>
      </div>

      {/* <DnDKanbanBoard /> */}

      <DBKanbanBoard projectId={project.id} />

      {/* Component Implementation Guide */}
      <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-800/50">
        <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
          🛠️ Components & Features to Implement
        </h3>
        <div className="grid grid-cols-1 gap-6 text-sm text-gray-600 md:grid-cols-2 dark:text-gray-400">
          <div>
            <strong className="mb-2 block">Core Components:</strong>
            <ul className="list-inside list-disc space-y-1">
              <li>components/kanban-board.tsx</li>
              <li>components/task-card.tsx</li>
              <li>components/modals/create-task-modal.tsx</li>
              <li>stores/board-store.ts (Zustand)</li>
            </ul>
          </div>
          <div>
            <strong className="mb-2 block">Advanced Features:</strong>
            <ul className="list-inside list-disc space-y-1">
              <li>Drag & drop with @dnd-kit/core</li>
              <li>Real-time updates</li>
              <li>Task assignments & due dates</li>
              <li>Comments & activity history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
