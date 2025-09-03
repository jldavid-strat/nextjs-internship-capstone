'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ErrorPage() {
  const router = useRouter();
  return (
    <div className="bg-background flex min-h-screen w-full items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-card border-border rounded-2xl border p-8 shadow-lg">
          <div className="mb-6 flex justify-center">
            <AlertTriangle className="text-destructive h-12 w-12" />
          </div>
          <h1 className="text-foreground mb-2 text-3xl font-bold">Oops! Something went wrong</h1>
          <p className="text-muted-foreground mb-6">
            An unexpected error occurred. Please try again later or return to the home page.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild variant="default">
              <Link href="/">Go Home</Link>
            </Button>
            <Button variant="outline" onClick={() => router.refresh()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
