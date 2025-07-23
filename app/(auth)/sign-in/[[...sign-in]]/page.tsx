import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="bg-platinum-900 dark:bg-outer_space-600 flex min-h-screen flex-col items-center justify-center border px-4">
      <div className="my-2 w-full max-w-md">
        <h1 className="text-outer_space-500 dark:text-platinum-500 mb-2 text-center text-3xl font-bold">
          Continue with your projects!
        </h1>
        {/* TODO 2.3: add custom styling*/}
      </div>
      <SignIn />
    </div>
  );
}

/*
TODO: Task 2.3 Implementation Notes:
- Import SignIn from @clerk/nextjs
- Configure sign-in redirects
- Style to match design system
- Add proper error handling
*/
