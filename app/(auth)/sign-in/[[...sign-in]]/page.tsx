import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="my-2 w-full max-w-md">
        <h1 className="mb-2 text-center text-3xl font-bold">Continue with your projects!</h1>
      </div>
      <SignIn />
    </div>
  );
}
