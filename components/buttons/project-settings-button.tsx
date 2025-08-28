'use client';

import { Project } from '@/types/db.types';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProjectSettingsButton({ projectId }: { projectId: Project['id'] }) {
  const router = useRouter();
  return (
    <button
      className="hover:text-foreground/30 rounded-lg p-2 transition-colors hover:cursor-pointer"
      onClick={() => {
        router.push(`${projectId}/settings`);
      }}
    >
      <Settings size={20} />
    </button>
  );
}
