'use client';

import { useState } from 'react';
import { CreateTaskModal } from './modals/create-task-modal';

type CreateTaskProps = {
  kanbanColumnId: string;
  projectId: string;
  kanbanName: string;
};

export default function CreateTaskButton(kanbanData: CreateTaskProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="border-french_gray-300 dark:border-payne's_gray-400 text-payne's_gray-500 dark:text-french_gray-400 hover:border-blue_munsell-500 hover:text-blue_munsell-500 w-full rounded-lg border-2 border-dashed p-3 transition-colors"
      >
        + Add task
      </button>

      {isOpen && <CreateTaskModal setIsOpen={setIsOpen} kanbanData={kanbanData} />}
    </>
  );
}
