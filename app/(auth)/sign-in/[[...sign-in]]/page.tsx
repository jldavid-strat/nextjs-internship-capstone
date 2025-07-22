import { SignIn } from '@clerk/nextjs';

// TODO: Task 2.3 - Create sign-in and sign-up pages
export default function SignInPage() {
  return (
    <div className="bg-platinum-900 dark:bg-outer_space-600 flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-outer_space-500 dark:text-platinum-500 mb-2 text-3xl font-bold">
            Welcome Back
          </h1>
          <p className="text-payne's_gray-500 dark:text-french_gray-400">
            Sign in to your project management account
          </p>
        </div>
        {/* TODO: Task 2.3 - Replace with actual Clerk SignIn component */}
        <SignIn />
      </div>
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
