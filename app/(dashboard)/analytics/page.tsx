'use client';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Bar, BarChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const tasksData = [
  { month: 'Mar', completed: 30 },
  { month: 'Apr', completed: 45 },
  { month: 'May', completed: 50 },
  { month: 'Jun', completed: 70 },
  { month: 'Jul', completed: 65 },
  { month: 'Aug', completed: 90 },
];

const projectsData = [
  { status: 'Active', count: 8 },
  { status: 'Completed', count: 15 },
];

const tasksConfig = {
  completed: { label: 'Completed', color: 'var(--chart-1)' },
} satisfies Record<string, { label: string; color: string }>;

const projectsConfig = {
  Active: { label: 'Active', color: 'var(--chart-2)' },
  Completed: { label: 'Completed', color: 'var(--chart-3)' },
} satisfies Record<string, { label: string; color: string }>;

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-primary text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track project performance and team productivity
        </p>
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
            title: 'Task Efficiency',
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Tasks Completed in 6 Months */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks Completed</CardTitle>
            <CardDescription>Show the task completed</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer className="h-full w-full" config={tasksConfig}>
              <AreaChart data={tasksData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  fill="var(--chart-1)"
                  stroke="var(--chart-1)"
                  fillOpacity={0.5}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Active vs Completed Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Project Completed</CardTitle>
            <CardDescription>Active vs Completed Projects</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer className="h-full w-full" config={projectsConfig}>
              <BarChart data={projectsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
