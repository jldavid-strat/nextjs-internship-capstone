import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen w-full items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-card border-border rounded-2xl border p-8 shadow-lg">
          <div className="mb-6 flex justify-center">
            <SearchX className="text-muted-foreground h-12 w-12" />
          </div>
          <h1 className="text-foreground mb-2 text-3xl font-bold">404 - Page Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/">Go back home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
