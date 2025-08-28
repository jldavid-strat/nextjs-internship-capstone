'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import CreateProjectModal from '../modals/ex-create-project-modal';

export function CreateProjectButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-blue_munsell-500 hover:bg-blue_munsell-600 inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors"
      >
        <Plus size={20} className="mr-2" />
        New Project
      </Button>

      {isOpen && <CreateProjectModal isOpen={isOpen} setIsOpen={setIsOpen} />}
    </>
  );
}
