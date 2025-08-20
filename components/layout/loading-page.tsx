import { Loader2 } from 'lucide-react';

export default function LoadingPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Loader2 className="h-25 w-25 animate-spin text-gray-400" />
    </div>
  );
}
