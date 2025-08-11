import { getAllUserProject } from '@/lib/queries/project.queries';
import { formatDate } from '@/lib/utils/format_date';
import { Calendar, MoreHorizontal, Users } from 'lucide-react';
import Link from 'next/link';

export default async function ProjectList({ userClerkId }: { userClerkId: string }) {
  const { success, data } = await getAllUserProject(userClerkId);
  if (!success || !data) return <div>Cannot find user projects</div>;
  const projectList = data;

  return (
    <>
      {projectList?.map((project) => (
        <Link prefetch={true} key={project.id} href={`/projects/${project.id}`}>
          <div className="dark:bg-outer_space-500 border-french_gray-300 dark:border-payne's_gray-400 cursor-pointer rounded-lg border bg-white p-6 transition-shadow hover:shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <div className={`h-3 w-3 rounded-full ${'bg-green-400'}`} />
              <button className="hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded p-1">
                <MoreHorizontal size={16} />
              </button>
            </div>
            <h3 className="text-outer_space-500 dark:text-platinum-500 mb-2 text-lg font-semibold">
              {project.title}
            </h3>
            <p className="text-payne's_gray-500 dark:text-french_gray-400 mb-4 line-clamp-2 text-sm">
              {project.description}
            </p>
            <div className="text-payne's_gray-500 dark:text-french_gray-400 mb-4 flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Users size={16} className="mr-1" />
                {/* member count */}
                {/* {project.members} members */}
                14
              </div>
              <div className="flex items-center gap-2">
                {project?.dueDate ? formatDate(project.dueDate) : ''}
                {project?.dueDate && <Calendar size={16} className="mr-1" />}
              </div>
            </div>
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-payne's_gray-500 dark:text-french_gray-400">Progress</span>
                <span className="text-outer_space-500 dark:text-platinum-500 font-medium">
                  {/* {project.progress}% */}
                  {/* derived value from completed tasks */}
                  20%
                </span>
              </div>
              <div className="bg-french_gray-300 dark:bg-payne's_gray-400 h-2 w-full rounded-full">
                <div
                  // className={`h-2 rounded-full transition-all duration-300 ${project.color}`}
                  className={`h-2 rounded-full transition-all duration-300 ${'bg-green-300'}`}
                  // style={{ width: `${project.progress}%` }}
                  style={{ width: `20%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  project.status === 'on-going'
                    ? 'bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300'
                    : project.status === 'active'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {project.status}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </>
  );
}
