import { TrendingUp, Users, CheckCircle, Clock, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-outer_space-500 dark:text-platinum-500 text-3xl font-bold">
          Dashboard
        </h1>
        <p className="text-payne's_gray-500 dark:text-french_gray-500 mt-2">
          Welcome back! Here&apos;s an overview of your projects and tasks.
        </p>
      </div>

      {/* Implementation Status Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start">
          <div className="shrink-0">
            <div className="bg-blue_munsell-500 flex h-8 w-8 items-center justify-center rounded-full">
              <TrendingUp className="text-white" size={16} />
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Dashboard Implementation Tasks
            </h3>
            <div className="mt-2 text-sm text-blue-800 dark:text-blue-200">
              <ul className="list-inside list-disc space-y-1">
                <li>Task 4.2: Create project listing and dashboard interface</li>
                <li>Task 5.3: Set up client-side state management with Zustand</li>
                <li>Task 6.6: Optimize performance and implement loading states</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Placeholder */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Active Projects', value: '12', icon: TrendingUp, change: '+2.5%' },
          { name: 'Team Members', value: '24', icon: Users, change: '+4.1%' },
          {
            name: 'Completed Tasks',
            value: '156',
            icon: CheckCircle,
            change: '+12.3%',
          },
          { name: 'Pending Tasks', value: '43', icon: Clock, change: '-2.1%' },
        ].map((stat) => (
          <div
            key={stat.name}
            className="dark:bg-outer_space-500 border-french_gray-300 dark:border-payne's_gray-400 overflow-hidden rounded-lg border bg-white p-6"
          >
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="bg-blue_munsell-100 dark:bg-blue_munsell-900 flex h-8 w-8 items-center justify-center rounded-lg">
                  <stat.icon className="text-blue_munsell-500" size={20} />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-payne's_gray-500 dark:text-french_gray-400 truncate text-sm font-medium">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-outer_space-500 dark:text-platinum-500 text-2xl font-semibold">
                      {stat.value}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600 dark:text-green-400">
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <div className="dark:bg-outer_space-500 border-french_gray-300 dark:border-payne's_gray-400 rounded-lg border bg-white p-6">
          <h3 className="text-outer_space-500 dark:text-platinum-500 mb-4 text-lg font-semibold">
            Recent Projects
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-platinum-800 dark:bg-outer_space-400 flex items-center justify-between rounded-lg p-3"
              >
                <div>
                  <div className="text-outer_space-500 dark:text-platinum-500 font-medium">
                    Project {i}
                  </div>
                  <div className="text-payne's_gray-500 dark:text-french_gray-400 text-sm">
                    Last updated 2 hours ago
                  </div>
                </div>
                <div className="bg-french_gray-300 dark:bg-payne's_gray-400 h-2 w-12 rounded-full">
                  <div className="bg-blue_munsell-500 h-2 w-8 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              📋 <strong>Task 4.1:</strong> Implement project CRUD operations
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dark:bg-outer_space-500 border-french_gray-300 dark:border-payne's_gray-400 rounded-lg border bg-white p-6">
          <h3 className="text-outer_space-500 dark:text-platinum-500 mb-4 text-lg font-semibold">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="bg-blue_munsell-500 hover:bg-blue_munsell-600 flex w-full items-center justify-center rounded-lg px-4 py-3 text-white transition-colors">
              <Plus size={20} className="mr-2" />
              Create New Project
            </button>
            <button className="border-french_gray-300 dark:border-payne's_gray-400 text-outer_space-500 dark:text-platinum-500 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 flex w-full items-center justify-center rounded-lg border px-4 py-3 transition-colors">
              <Plus size={20} className="mr-2" />
              Add Team Member
            </button>
            <button className="border-french_gray-300 dark:border-payne's_gray-400 text-outer_space-500 dark:text-platinum-500 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 flex w-full items-center justify-center rounded-lg border px-4 py-3 transition-colors">
              <Plus size={20} className="mr-2" />
              Create Task
            </button>
          </div>
          <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              📋 <strong>Task 4.4:</strong> Build task creation and editing functionality
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
