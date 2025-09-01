'use client';

import { Project } from '@/types/db.types';
import { ChartSpline, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import AddKanbaColumnForm from '../forms/add-kanban-column-modal-form';

export default function ProjectHeaderButtons({ projectId }: { projectId: Project['id'] }) {
  const router = useRouter();
  return (
    <div className="flex items-center space-x-2">
      <AddKanbaColumnForm projectId={projectId} />
      <Button type="button">
        <ChartSpline size={12} />
        Analytics
      </Button>
      <button
        className="hover:text-foreground/30 rounded-lg p-2 transition-colors hover:cursor-pointer"
        onClick={() => {
          router.push(`${projectId}/settings`);
        }}
      >
        <Settings size={20} />
      </button>
    </div>
  );
}
