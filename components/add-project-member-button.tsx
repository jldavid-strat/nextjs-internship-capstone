'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AddProjectMemberModal } from './modals/add-project-member-modal';

export function AddProjectMemberButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue_munsell-500 hover:bg-blue_munsell-600 inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors"
      >
        <Plus size={20} className="mr-2" />
        Add Project Member
      </button>

      {isOpen && <AddProjectMemberModal setIsOpen={setIsOpen} />}
    </>
  );
}
