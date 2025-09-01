import { getProjectById } from '@/lib/queries/project.queries';
import { DBKanbanBoard } from '@/components/kanban/kanban-board';
import { ProjectNotFound } from '@/components/project/project-not-found';
import ProjectHeader from '@/components/project/project-header';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const projectId = (await params).id;

  console.log(projectId);
  const { success, data } = await getProjectById(projectId);

  if (!success || !data) return <ProjectNotFound />;

  const project = data;

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
          totalTasks: 144,
          memberCount: 13,
          completedTasks: 12,
          owner: {
            firstName: 'Jed Laurence',
            lastName: 'David',
            userImgLink:
              'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18zMERlbjc1cDlkWDRvdFd4YzZsQjEzOGozeE4iLCJyaWQiOiJ1c2VyXzMwRzJKSzFjMjNxRUNyZ2J3ZEtVeVJGM0xaaSIsImluaXRpYWxzIjoiVVUifQ',
          },
        }}
        projectId={projectId}
      />
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
