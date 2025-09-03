'use client';

import { Project } from '@/types/db.types';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import React from 'react';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Ellipsis, Settings } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function ProjectCardDropdown({ projectId }: { projectId: Project['id'] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'outline'} className="border-0 bg-transparent dark:bg-transparent">
          <Ellipsis size={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          className="flex w-full items-center"
          onSelect={() => {
            redirect(`projects/${projectId}/settings`);
          }}
        >
          <Settings size={10} />
          <span className="hover: w-full cursor-pointer text-sm">Settings</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
