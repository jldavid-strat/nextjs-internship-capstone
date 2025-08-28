import { SearchX } from 'lucide-react';
import React from 'react';

export default function ProjectTeamNotFound() {
  return (
    <div className="flex h-30 flex-col items-center justify-center p-2">
      <SearchX size={40} className="text-muted-foreground" />
      <h2 className="text-muted-foreground my-2">No project teams found</h2>
    </div>
  );
}
