import { Calendar, Users, MoreHorizontal } from 'lucide-react';

const projects = [
  {
    id: '1',
    name: 'Website Redesign',
    description:
      'Complete overhaul of company website with modern design and improved UX',
    progress: 75,
    members: 5,
    dueDate: '2024-02-15',
    status: 'In Progress',
    color: 'bg-blue_munsell-500',
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'iOS and Android app development for customer portal',
    progress: 45,
    members: 8,
    dueDate: '2024-03-20',
    status: 'In Progress',
    color: 'bg-green-500',
  },
  {
    id: '3',
    name: 'Marketing Campaign',
    description: 'Q1 marketing campaign planning and execution',
    progress: 90,
    members: 3,
    dueDate: '2024-01-30',
    status: 'Review',
    color: 'bg-purple-500',
  },
  {
    id: '4',
    name: 'Database Migration',
    description: 'Migrate legacy database to new cloud infrastructure',
    progress: 30,
    members: 4,
    dueDate: '2024-04-10',
    status: 'Planning',
    color: 'bg-orange-500',
  },
  {
    id: '5',
    name: 'Security Audit',
    description: 'Comprehensive security audit and vulnerability assessment',
    progress: 60,
    members: 2,
    dueDate: '2024-02-28',
    status: 'In Progress',
    color: 'bg-red-500',
  },
  {
    id: '6',
    name: 'API Documentation',
    description: 'Create comprehensive API documentation for developers',
    progress: 85,
    members: 3,
    dueDate: '2024-02-05',
    status: 'Review',
    color: 'bg-indigo-500',
  },
];

export function ProjectGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className="dark:bg-outer_space-500 border-french_gray-300 dark:border-payne's_gray-400 cursor-pointer rounded-lg border bg-white p-6 transition-shadow hover:shadow-lg"
        >
          <div className="mb-4 flex items-start justify-between">
            <div className={`h-3 w-3 rounded-full ${project.color}`} />
            <button className="hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded p-1">
              <MoreHorizontal size={16} />
            </button>
          </div>

          <h3 className="text-outer_space-500 dark:text-platinum-500 mb-2 text-lg font-semibold">
            {project.name}
          </h3>

          <p className="text-payne's_gray-500 dark:text-french_gray-400 mb-4 line-clamp-2 text-sm">
            {project.description}
          </p>

          <div className="text-payne's_gray-500 dark:text-french_gray-400 mb-4 flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Users size={16} className="mr-1" />
              {project.members} members
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-1" />
              {project.dueDate}
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-payne's_gray-500 dark:text-french_gray-400">
                Progress
              </span>
              <span className="text-outer_space-500 dark:text-platinum-500 font-medium">
                {project.progress}%
              </span>
            </div>
            <div className="bg-french_gray-300 dark:bg-payne's_gray-400 h-2 w-full rounded-full">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${project.color}`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                project.status === 'In Progress'
                  ? 'bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300'
                  : project.status === 'Review'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {project.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
