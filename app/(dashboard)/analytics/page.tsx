import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track project performance and team productivity
        </p>
      </div>

      {/* Implementation Tasks Banner */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <h3 className="mb-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
          📊 Analytics Implementation Tasks
        </h3>
        <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
          <li>• Task 6.6: Optimize performance and implement loading states</li>
          <li>• Task 8.5: Set up performance monitoring and analytics</li>
        </ul>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Project Velocity',
            value: '8.5',
            unit: 'tasks/week',
            icon: TrendingUp,
            color: 'blue',
          },
          {
            title: 'Team Efficiency',
            value: '92%',
            unit: 'completion rate',
            icon: BarChart3,
            color: 'green',
          },
          {
            title: 'Active Users',
            value: '24',
            unit: 'this week',
            icon: Users,
            color: 'purple',
          },
          {
            title: 'Avg. Task Time',
            value: '2.3',
            unit: 'days',
            icon: Clock,
            color: 'orange',
          },
        ].map((metric, index) => (
          <div key={index} className="bg-card border-border rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <div
                className={`h-10 w-10 bg-${metric.color}-100 dark:bg-${metric.color}-900 flex items-center justify-center rounded-lg`}
              >
                <metric.icon className={`text-${metric.color}-500`} size={20} />
              </div>
            </div>
            <div className="text-outer_space-500 dark:text-platinum-500 mb-1 text-2xl font-bold">
              {metric.value}
            </div>
            <div className="text-payne's_gray-500 dark:text-french_gray-400 mb-2 text-sm">
              {metric.unit}
            </div>
            <div className="text-outer_space-500 dark:text-platinum-500 text-xs font-medium">
              {metric.title}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4 text-lg font-semibold">Project Progress</h3>
          <div className="flex h-64 items-center justify-center rounded-lg">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto mb-2" />
              <p>Chart Component Placeholder</p>
              <p className="text-muted-foreground text-sm">
                TODO: Implement with Chart.js or Recharts
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="text-outer_space-500 dark:text-platinum-500 mb-4 text-lg font-semibold">
            Team Activity
          </h3>
          <div className="flex h-64 items-center justify-center rounded-lg">
            <div className="text-center">
              <TrendingUp size={48} className="mx-auto mb-2" />
              <p>Activity Chart Placeholder</p>
              <p className="text-sm">TODO: Implement activity timeline</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
