'use client';

import type React from 'react';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Home,
  FolderOpen,
  Users,
  Settings,
  Menu,
  X,
  BarChart3,
  Calendar,
  Bell,
  Search,
} from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import ProtectedPage from '@/components/protected/protected-page';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, current: true },
  { name: 'Projects', href: '/projects', icon: FolderOpen, current: false },
  { name: 'Team', href: '/team', icon: Users, current: false },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, current: false },
  { name: 'Calendar', href: '/calendar', icon: Calendar, current: false },
  { name: 'Settings', href: '/settings', icon: Settings, current: false },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  if (isLoaded) {
    if (!isSignedIn) return <ProtectedPage />;
  }

  return (
    <div className="bg-platinum-900 dark:bg-outer_space-600 min-h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`dark:bg-outer_space-500 border-french_gray-300 dark:border-payne's_gray-400 fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="border-french_gray-300 dark:border-payne's_gray-400 flex h-16 items-center justify-between border-b px-6">
          <Link href="/" className="text-blue_munsell-500 text-2xl font-bold">
            Task Flow
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg p-2 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              📋 <strong>Task 2.6:</strong> Create protected dashboard layout
            </p>
          </div>

          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-blue_munsell-100 dark:bg-blue_munsell-900 text-blue_munsell-700 dark:text-blue_munsell-300'
                      : "text-outer_space-500 dark:text-platinum-500 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400"
                  }`}
                >
                  <item.icon className="mr-3" size={20} />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-500 sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b bg-white px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg p-2 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Search bar placeholder */}
            <div className="flex flex-1 items-center">
              <div className="relative max-w-md flex-1">
                <Search
                  className="text-payne's_gray-500 dark:text-french_gray-400 absolute top-1/2 left-3 -translate-y-1/2 transform"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search projects, tasks..."
                  className="bg-platinum-500 dark:bg-payne's_gray-400 border-french_gray-300 dark:border-payne's_gray-300 text-outer_space-500 dark:text-platinum-500 placeholder-payne's_gray-500 dark:placeholder-french_gray-400 focus:ring-blue_munsell-500 w-full rounded-lg border py-2 pr-4 pl-10 focus:ring-2 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button className="hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg p-2">
                <Bell size={20} />
              </button>

              <ThemeToggle />

              <UserButton />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <Suspense>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}

// function DashboardHeader() {
//   return ();
// }
