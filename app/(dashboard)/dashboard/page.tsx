import { ProjectDataNotFound } from '@/components/project/project-not-found';
import { getDashboardStats } from '@/lib/queries/dashboard.queries';
import { getRecentProjects } from '@/lib/queries/project.queries';
import { formatDate } from '@/lib/utils/format_date';
import { TrendingUp, Users, CheckCircle, Clock, Plus, SearchX } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const dashboarStats = await getDashboardStats();
  const recentProjects = await getRecentProjects();

  const activeProjectCount = dashboarStats?.activeProjectCount;
  const memberCount = dashboarStats?.memberCount;
  const completedTaskCount = dashboarStats?.completedTaskCount;
  const pendingTaskCount = dashboarStats?.pendingTaskCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-primary text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here&apos;s an overview of your projects and tasks.
        </p>
      </div>

      {/* Stats Grid - Placeholder */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            name: 'Active Projects',
            value: activeProjectCount,
            icon: TrendingUp,
            change: '+2.5%',
            color: 'primary',
          },
          {
            name: 'Project Members',
            value: memberCount,
            icon: Users,
            change: '+4.1%',
            color: 'gray-400',
          },
          {
            name: 'Completed Tasks',
            value: completedTaskCount,
            icon: CheckCircle,
            change: '+12.3%',
            color: 'purple-400',
          },
          {
            name: 'Pending Tasks',
            value: pendingTaskCount,
            icon: Clock,
            change: '-2.1%',
            color: 'orange-300',
          },
        ].map((stat) => (
          <div
            key={stat.name}
            className="bg-card border-border overflow-hidden rounded-lg border p-6"
          >
            <div className="flex items-center">
              <div className="shrink-0">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg`}>
                  <stat.icon className={`text-${stat.color}`} size={20} />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium">{stat.name}</dt>
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
        <div className="bg-card border-border rounded-lg border-1 p-6">
          <h3 className="mb-4 text-lg font-semibold">Recent Projects</h3>
          <div className="space-y-3">
            {recentProjects && recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="bg-card hover:bg-accent/60 border-border flex items-center justify-between gap-2 rounded-lg border-1 p-3"
                >
                  <div className="font-medium">{project.title}</div>
                  <div className="text-muted-foreground text-sm">
                    {`${project.updatedAt ? `Last updated on ${formatDate(project.updatedAt)}` : `Created on ${formatDate(project.createdAt!)}`} `}
                  </div>
                </Link>
              ))
            ) : (
              <ProjectDataNotFound message="No projects found" icon={<SearchX size={12} />} />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border-border rounded-lg border-1 p-6">
          <h3 className="text-outer_space-500 dark:text-platinum-500 mb-4 text-lg font-semibold">
            Quick Actions
          </h3>
          <Link href={`/projects`}>
            <div className="space-y-3">
              <button className="hover:bg-accent flex w-full items-center justify-center rounded-lg border px-4 py-3 transition-colors hover:cursor-pointer">
                <Plus size={20} className="mr-2" />
                Create New Project
              </button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
