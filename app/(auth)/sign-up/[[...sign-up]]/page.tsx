import { SignUp } from '@clerk/nextjs';

{
  /* TODO 2.3: add custom layout for this path*/
  // example: <- Home (COMPONENT)
}
export default function SignUpPage() {
  return (
    <div className="bg-platinum-900 dark:bg-outer_space-600 flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-outer_space-500 dark:text-platinum-500 mb-2 text-3xl font-bold">
            Join our project management platform
          </h1>
        </div>
      </div>
      {/* TODO 2.3: add custom styling*/}
      <SignUp />
    </div>
  );
}

/*
TODO: Task 2.3 Implementation Notes:
- Import SignUp from @clerk/nextjs
- Configure sign-up redirects
- Style to match design system
- Add proper error handling
- Set up webhook for user data sync (Task 2.5)
*/
