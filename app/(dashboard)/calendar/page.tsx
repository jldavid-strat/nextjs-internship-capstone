import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-md text-muted-foreground mt-2">
            View project deadlines and team schedules
          </p>
        </div>
        <Button className="inline-flex items-center rounded-lg px-2 py-2 text-white transition-colors">
          <Plus size={20} />
          Add Event
        </Button>
      </div>

      {/* Implementation Tasks Banner */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <h3 className="mb-2 text-sm font-medium text-yellow-800 dark:text-yellow-200">
          📅 Calendar Implementation Tasks
        </h3>
        <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
          <li>• Task 6.2: Add task due dates, priorities, and labels</li>
          <li>• Task 6.6: Add bulk task operations and keyboard shortcuts</li>
        </ul>
      </div>

      {/* Calendar Header */}
      <div className="bg-card border-border rounded-lg border p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="hover:bg-accent rounded-lg p-2 hover:cursor-pointer">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-outer_space-500 dark:text-platinum-500 text-xl font-semibold">
              December 2024
            </h2>
            <button className="hover:bg-accent rounded-lg p-2 hover:cursor-pointer">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex space-x-2">
            <button className="hover:bg-accent text-smhover:cursor-pointer rounded px-3 py-1">
              Month
            </button>
            <button className="hover:bg-accent text-smhover:cursor-pointer rounded px-3 py-1">
              Week
            </button>
            <button className="hover:bg-accent text-smhover:cursor-pointer rounded px-3 py-1">
              Day
            </button>
          </div>
        </div>

        {/* Calendar Grid Placeholder */}
        <div className="flex h-96 items-center justify-center rounded-lg">
          <div className="text-center">
            <Calendar size={48} className="mx-auto mb-2" />
            <p>Calendar Component Placeholder</p>
            <p className="text-sm">TODO: Implement with react-big-calendar or similar</p>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-card border-border rounded-lg border p-6">
        <h3 className="mb-4 text-lg font-semibold">Upcoming Deadlines</h3>
        <div className="space-y-3">
          {[
            { title: 'Website Redesign', date: 'Dec 15, 2024', type: 'Project Deadline' },
            { title: 'Team Meeting', date: 'Dec 18, 2024', type: 'Meeting' },
            { title: 'Mobile App Launch', date: 'Dec 22, 2024', type: 'Milestone' },
          ].map((event, index) => (
            <div
              key={index}
              className="bg-card hover:bg-accent flex items-center justify-between rounded-lg p-3 text-sm hover:cursor-pointer"
            >
              <div>
                <div className="font-medium">{event.title}</div>
                <div className="text-sm">{event.type}</div>
              </div>
              <div className="text-sm">{event.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
