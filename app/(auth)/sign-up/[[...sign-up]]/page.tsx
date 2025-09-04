import { SignUp } from '@clerk/nextjs';

{
  /* TODO 2.3: add custom layout for this path*/
  // example: <- Home (COMPONENT)
}
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Join our project management platform</h1>
        </div>
      </div>
      {/* TODO 2.3: add custom styling*/}
      <SignUp />
    </div>
  );
}
