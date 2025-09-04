'use client';

import Link from 'next/link';
import { ThemeToggle } from './theme/theme-toggle';

export function Header() {
  return (
    <header className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-500/80 border-b bg-white/80 backdrop-blur-xs">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-blue_munsell-500 text-2xl font-bold">
              TaskFlow
            </Link>
          </div>

          <nav className="hidden space-x-8 md:flex">
            <Link
              href="#features"
              className="text-outer_space-500 dark:text-platinum-500 hover:text-blue_munsell-500 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-outer_space-500 dark:text-platinum-500 hover:text-blue_munsell-500 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#about"
              className="text-outer_space-500 dark:text-platinum-500 hover:text-blue_munsell-500 transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="bg-blue_munsell-500 hover:bg-blue_munsell-600 rounded-lg px-4 py-2 text-white transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
