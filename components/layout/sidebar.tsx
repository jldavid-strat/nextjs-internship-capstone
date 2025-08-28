'use client';

import Link from 'next/link';
import {
  Home,
  FolderOpen,
  Users,
  Settings,
  X,
  BarChart3,
  Calendar,
  Menu,
  PanelRightClose,
  PanelLeftClose,
} from 'lucide-react';
import { ThemeToggle } from '../theme/theme-toggle';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
];

type SideBarProps = {
  sideBarOpen: boolean;
  setSideBarOpen: (state: boolean) => void;
};

export default function Sidebar({ sideBarOpen, setSideBarOpen }: SideBarProps) {
  return (
    <>
      {/* Mobile sidebar overlay */}
      {sideBarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setSideBarOpen(false)}
        />
      )}
      <div
        className={`border-border fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-black/20 transition-transform duration-300 ease-in-out lg:translate-x-0 ${sideBarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" className="text-primary text-2xl font-bold">
            TaskFlow
          </Link>
          {/* <button
            onClick={() => setSideBarOpen(false)}
            className="hover:bg-accent rounded-lg p-2 md:visible"
          >
            <PanelLeftClose size={20} />
          </button> */}
          <button
            onClick={() => setSideBarOpen(false)}
            className="hover:bg-accent rounded-lg p-2 lg:hidden"
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
                  className="hover:bg-accent flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                >
                  <item.icon className="mr-3" size={20} />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
