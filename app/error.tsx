'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body>
        <div className="bg-background flex min-h-screen w-full items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <div className="bg-card border-border rounded-2xl border p-8 shadow-lg">
              <div className="mb-6 flex justify-center">
                <AlertTriangle className="text-destructive h-12 w-12" />
              </div>
              <h1 className="text-foreground mb-2 text-3xl font-bold">
                Oops! Something went wrong
              </h1>
              <p className="text-muted-foreground mb-6">
                An unexpected error occurred. Please try again later or return to the home page.
              </p>
              <div className="flex justify-center gap-3">
                <Button asChild variant="default">
                  <Link href="/">Go Home</Link>
                </Button>
                <Button variant="outline" onClick={() => reset()}>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
