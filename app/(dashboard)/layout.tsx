'use client';

import type React from 'react';

import { useState, Suspense } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import ProtectedPage from '@/components/protected/protected-page';
import { Input } from '@/components/ui/input';
import Sidebar from '@/components/layout/sidebar';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sideBarOpen, setSidebarOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  if (isLoaded) {
    if (!isSignedIn) return <ProtectedPage />;
  }

  return (
    <div className="bg-sidebar min-h-screen">
      {/* Mobile sidebar overlay */}
      <Sidebar sideBarOpen={sideBarOpen} setSideBarOpen={setSidebarOpen} />
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="bg-background sticky top-0 z-30 flex h-16 items-center gap-x-4 px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="hover:bg-accent rounded-lg p-2 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Search bar placeholder */}
            <div className="flex flex-1 items-center">
              <div className="relative max-w-md flex-1">
                <Search className="absolute top-1/2 left-3 -translate-y-1/2 transform" size={18} />
                <Input
                  type="text"
                  placeholder="Search projects, tasks..."
                  className="border-border h-12 w-full rounded-lg py-2 pr-4 pl-10 text-sm focus:ring focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button className="hover:bg-accent rounded-lg p-2">
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
