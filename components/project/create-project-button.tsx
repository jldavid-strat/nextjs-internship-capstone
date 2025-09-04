'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function CreateProjectButton() {
  return (
    <Button
      onClick={() => redirect('/projects/create')}
      className="bg-blue_munsell-500 hover:bg-blue_munsell-600 inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors"
    >
      <Plus size={20} className="mr-2" />
      New Project
    </Button>
  );
}
