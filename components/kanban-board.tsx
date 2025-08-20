import { getKanbanColumnsByProjectId } from '@/lib/queries/kanban-column.queries';
import { Project } from '@/types/db.types';
import { MoreHorizontal } from 'lucide-react';
import CreateTaskButton from './create-task-button';
import { TaskList } from './task-list';

// TODO: Task 5.1 - Design responsive Kanban board layout
// TODO: Task 5.2 - Implement drag-and-drop functionality with dnd-kit

/*
TODO: Implementation Notes for Interns:

This is the main Kanban board component that should:
- Display columns (lists) horizontally
- Allow drag and drop of tasks between columns
- Support adding new tasks and columns
- Handle real-time updates
- Be responsive on mobile

Key dependencies to install:
- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities

Features to implement:
- Drag and drop tasks between columns
- Drag and drop to reorder tasks within columns
- Add new task button in each column
- Add new column functionality
- Optimistic updates (Task 5.4)
- Real-time persistence (Task 5.5)
- Mobile responsive design
- Loading states
- Error handling

State management:
- Use Zustand store for board state (Task 5.3)
- Implement optimistic updates
- Handle conflicts with server state
*/

const initialColumns = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      {
        id: '1',
        title: 'Design homepage mockup',
        description: 'Create initial design concepts',
        priority: 'high',
        assignee: 'John Doe',
      },
      {
        id: '2',
        title: 'Research competitors',
        description: 'Analyze competitor websites',
        priority: 'medium',
        assignee: 'Jane Smith',
      },
      {
        id: '3',
        title: 'Define user personas',
        description: 'Create detailed user personas',
        priority: 'low',
        assignee: 'Mike Johnson',
      },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      {
        id: '4',
        title: 'Develop navigation component',
        description: 'Build responsive navigation',
        priority: 'high',
        assignee: 'Sarah Wilson',
      },
      {
        id: '5',
        title: 'Content strategy',
        description: 'Plan content structure',
        priority: 'medium',
        assignee: 'Tom Brown',
      },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    tasks: [
      {
        id: '6',
        title: 'Logo design options',
        description: 'Present logo variations',
        priority: 'high',
        assignee: 'Lisa Davis',
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      {
        id: '7',
        title: 'Project kickoff meeting',
        description: 'Initial team meeting completed',
        priority: 'medium',
        assignee: 'John Doe',
      },
      {
        id: '8',
        title: 'Requirements gathering',
        description: 'Collected all requirements',
        priority: 'high',
        assignee: 'Jane Smith',
      },
    ],
  },
];

export async function KanbanBoard({ projectId }: { projectId: Project['id'] }) {
  // const [columns, setColumns] = useState(initialColumns);
  const { success, message, data: kanbanColumns } = await getKanbanColumnsByProjectId(projectId);

  if (!success || !kanbanColumns) return <div>{message}</div>;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="dark:bg-outer_space-500 border-french_gray-300 dark:border-payne's_gray-400 rounded-lg border bg-white p-6">
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {kanbanColumns.map((column, index) => (
          <div key={index} className="w-80 shrink-0">
            <div className="bg-platinum-800 dark:bg-outer_space-400 border-french_gray-300 dark:border-payne's_gray-400 rounded-lg border">
              <div className="border-french_gray-300 dark:border-payne's_gray-400 border-b p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-outer_space-500 dark:text-platinum-500 font-semibold">
                    {column.name}
                    <span className="bg-french_gray-300 dark:bg-payne's_gray-400 ml-2 rounded-full px-2 py-1 text-xs">
                      {Math.floor(Math.random() * 5) + 1}
                    </span>
                  </h3>
                  <button className="hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded p-1">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
              <TaskList projectId={projectId} taskStatus={column.name} />
              <CreateTaskButton
                kanbanColumnId={column.kanbanColumnId}
                kanbanName={column.name}
                projectId={projectId}
              />
            </div>
          </div>
        ))}

        {/* add user created kanban columns */}
        <div className="w-80 shrink-0">
          <div className="bg-platinum-800 dark:bg-outer_space-400 border-french_gray-300 dark:border-payne's_gray-400 rounded-lg border">
            <div className="border-french_gray-300 dark:border-payne's_gray-400 border-b p-4">
              <div className="flex items-center justify-center">
                <button className="border-french_gray-300 dark:border-payne's_gray-400 text-payne's_gray-500 dark:text-french_gray-400 hover:border-blue_munsell-500 hover:text-blue_munsell-500 w-full rounded-lg border-2 border-dashed p-3 transition-colors">
                  + Add Kanban Board
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* */}
      </div>
    </div>
  );
}
