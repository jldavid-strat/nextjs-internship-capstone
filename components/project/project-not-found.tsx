'use client';

import { SearchX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export function ProjectNotFound() {
  const router = useRouter();
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 p-2">
      <SearchX size={40} className="text-muted-foreground" />
      <div className="flex flex-col justify-center text-center">
        <h2 className="text-muted-foreground">Failed to retrieve this project</h2>
        <p
          className="text-muted-foreground hover:text-muted-foreground/30 hover: cursor-pointer underline"
          onClick={() => {
            router.refresh();
          }}
        >
          Try again
        </p>
      </div>
    </div>
  );
}

export function ProjectDataNotFound({ message, icon }: { message: string; icon: React.ReactNode }) {
  return (
    <div className="flex h-30 flex-col items-center justify-center p-2">
      {icon}
      <h2 className="text-muted-foreground my-2">{message}</h2>
    </div>
  );
}
