import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-outer_space-500 dark:text-platinum-500 text-3xl font-bold">
            Calendar
          </h1>
          <p className="text-payne's_gray-500 dark:text-french_gray-500 mt-2">
            View project deadlines and team schedules
          </p>
        </div>
        <button className="bg-blue_munsell-500 hover:bg-blue_munsell-600 inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors">
          <Plus size={20} className="mr-2" />
          Add Event
        </button>
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
      <div className="dark:bg-outer_space-500 border-french_gray-300 dark:border-payne's_gray-400 rounded-lg border bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg p-2">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-outer_space-500 dark:text-platinum-500 text-xl font-semibold">
              December 2024
            </h2>
            <button className="hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg p-2">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex space-x-2">
            <button className="bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300 rounded px-3 py-1 text-sm">
              Month
            </button>
            <button className="text-payne's_gray-500 dark:text-french_gray-400 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded px-3 py-1 text-sm">
              Week
            </button>
            <button className="text-payne's_gray-500 dark:text-french_gray-400 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded px-3 py-1 text-sm">
              Day
            </button>
          </div>
        </div>

        {/* Calendar Grid Placeholder */}
        <div className="bg-platinum-800 dark:bg-outer_space-400 flex h-96 items-center justify-center rounded-lg">
          <div className="text-payne's_gray-500 dark:text-french_gray-400 text-center">
            <Calendar size={48} className="mx-auto mb-2" />
            <p>Calendar Component Placeholder</p>
            <p className="text-sm">TODO: Implement with react-big-calendar or similar</p>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="dark:bg-outer_space-500 border-french_gray-300 dark:border-payne's_gray-400 rounded-lg border bg-white p-6">
        <h3 className="text-outer_space-500 dark:text-platinum-500 mb-4 text-lg font-semibold">
          Upcoming Deadlines
        </h3>
        <div className="space-y-3">
          {[
            { title: 'Website Redesign', date: 'Dec 15, 2024', type: 'Project Deadline' },
            { title: 'Team Meeting', date: 'Dec 18, 2024', type: 'Meeting' },
            { title: 'Mobile App Launch', date: 'Dec 22, 2024', type: 'Milestone' },
          ].map((event, index) => (
            <div
              key={index}
              className="bg-platinum-800 dark:bg-outer_space-400 flex items-center justify-between rounded-lg p-3"
            >
              <div>
                <div className="text-outer_space-500 dark:text-platinum-500 font-medium">
                  {event.title}
                </div>
                <div className="text-payne's_gray-500 dark:text-french_gray-400 text-sm">
                  {event.type}
                </div>
              </div>
              <div className="text-payne's_gray-500 dark:text-french_gray-400 text-sm">
                {event.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
