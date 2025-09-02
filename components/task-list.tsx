import { getTaskList } from '@/lib/queries/task.queries';
import { KanbanColumn, Project } from '@/types/db.types';
import ViewTaskDetailButton from './view-task-detail-button';

export async function TaskList({
  projectId,
}: {
  kanbanColumnId: KanbanColumn['id'];
  projectId: Project['id'];
}) {
  const { data: taskList } = await getTaskList(projectId);

  return (
    <div className="min-h-[400px] space-y-3 p-4">
      {taskList &&
        taskList.map((task) => (
          <div
            key={task.id}
            className="dark:bg-outer_space-300 border-french_gray-300 dark:border-payne's_gray-400 cursor-pointer rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
          >
            <h4 className="text-outer_space-500 dark:text-platinum-500 mb-2 text-sm font-medium">
              {task.title}
            </h4>
            <p className="text-payne's_gray-500 dark:text-french_gray-400 mb-3 text-xs">
              {task.description}
            </p>
            <div className="flex items-center justify-between">
              {task.priority !== 'none' && (
                <span className="bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300 rounded-full px-2 py-1 text-xs font-medium">
                  {task.priority}
                </span>
              )}

              {/* user assigned */}
              <div className="bg-blue_munsell-500 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white">
                U
              </div>
              <ViewTaskDetailButton
                id={Number(task.id)}
                projectId={projectId}
                title={task.title}
                description={task.description}
                detail={task.detail}
                priority={task.priority}
                startDate={task.startDate}
                dueDate={task.dueDate}
              />
            </div>
          </div>
        ))}
    </div>
  );
}
