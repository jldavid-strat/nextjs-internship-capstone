import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  useEffect(() => {
    redirect('/sign-in');
  }, []);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-2 border bg-white p-10">
      <h1 className="text-center text-3xl font-bold">
        You must be logged in to access this page
      </h1>

      <Loader2 className="animate-spin"></Loader2>
      <p>Redirecting you to sign in page</p>
    </div>
  );
}
