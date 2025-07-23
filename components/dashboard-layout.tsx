'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from './theme-provider';
import {
  Home,
  FolderOpen,
  Users,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  BarChart3,
  Calendar,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

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
            TaskFlow
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg p-2 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="text-outer_space-500 dark:text-platinum-500 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors"
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
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="bg-platinum-500 dark:bg-payne's_gray-500 text-outer_space-500 dark:text-platinum-500 hover:bg-french_gray-500 dark:hover:bg-payne's_gray-400 rounded-lg p-2 transition-colors"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <div className="bg-blue_munsell-500 flex h-8 w-8 items-center justify-center rounded-full font-semibold text-white">
                U
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
