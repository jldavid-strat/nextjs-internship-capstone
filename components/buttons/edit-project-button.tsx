'use client';

import { useState } from 'react';
import { Pen } from 'lucide-react';
import { EditProjectModal } from '../modals/edit-project-modal';
import { Project } from '@/types/db.types';
import { Button } from '../ui/button';

type EditProjectProps = Pick<Project, 'title' | 'description' | 'status' | 'dueDate' | 'id'>;

export function EditProjectButton(projectData: EditProjectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant={'default'}
        className="text-md inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors hover:cursor-pointer"
      >
        <Pen size={20} className="mr-2" />
        Edit Project
      </Button>

      {isOpen && <EditProjectModal projectData={projectData} setIsOpen={setIsOpen} />}
    </>
  );
}
