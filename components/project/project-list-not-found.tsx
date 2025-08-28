import { FolderX } from 'lucide-react';
import React from 'react';

export default function ProjectListNotFound() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 p-2">
      <FolderX size={40} className="text-muted-foreground" />
      <h2 className="text-muted-foreground my-2">No projects found</h2>
    </div>
  );
}
