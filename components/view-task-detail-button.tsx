'use client';

import { useState } from 'react';
import { ViewTaskDetailModal } from './modals/view-task-detail-modal';
import { Task } from '@/types/db.types';

type ViewTaskProps = Pick<
  Task,
  'id' | 'projectId' | 'title' | 'description' | 'detail' | 'priority' | 'startDate' | 'dueDate'
>;

export default function ViewTaskDetailButton(taskData: ViewTaskProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="hover: cursor-pointer text-sm text-gray-400"
      >
        View/Edit
      </button>

      {isOpen && <ViewTaskDetailModal setIsOpen={setIsOpen} taskData={taskData} />}
    </>
  );
}
