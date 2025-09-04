'use client';

import { X } from 'lucide-react';
import { ExampleTable } from '../data-table/member-table';

export function AddProjectMemberModal({ setIsOpen }: { setIsOpen: (setValue: boolean) => void }) {
  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-card mx-4 w-full max-w-md rounded-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-outer_space-500 dark:text-platinum-500 text-lg font-semibold">
            Add New Project Member
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded p-1"
          >
            <X size={20} />
          </button>
        </div>
        <ExampleTable>
          <div>Some Table</div>
        </ExampleTable>
      </div>
    </div>
  );
}
