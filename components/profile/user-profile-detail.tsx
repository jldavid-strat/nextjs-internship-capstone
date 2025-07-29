'use client';

import { useUser } from '@clerk/nextjs';
import { Fragment, useState } from 'react';
import { Edit, Loader2 } from 'lucide-react';

// TODO: handle updates or changes to email addresses
// TODO: add interface to do password-related actions (change password and forgot password)

export default function UserProfileDetail() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const disabledCursorStyle = isEditing ? 'cursor-not-allowed' : ' ';

  if (!isLoaded)
    return <Loader2 className="dark:text-platinum-500 animate-spin"></Loader2>;
  if (!isSignedIn) return <div>User is not signed in.</div>;

  const updateUser = async (formData: FormData) => {
    setIsEditing(false);
    setIsLoading(true);

    await user.update({
      firstName: formData.get('first-name') as string,
      lastName: formData.get('last-name') as string,
    });
    setIsLoading(false);
  };

  return (
    <div className="dark:bg-outer_space-500 border-french_gray-300 dark:border-payne's_gray-400 rounded-lg border bg-white p-6 lg:col-span-2">
      <header className="flex justify-between">
        <h3 className="text-outer_space-500 dark:text-platinum-500 mb-6 text-lg font-semibold">
          Profile Settings
        </h3>
        <button
          className="hover:bg-platinum-700 h-fit w-fit hover:cursor-pointer"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="dark:text-platinum-500" />
        </button>
      </header>

      <form action={updateUser}>
        <div className="space-y-6">
          <div>
            <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
              First Name
            </label>
            <input
              type="text"
              defaultValue={`${user.firstName}`}
              name="first-name"
              className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
              Last Name
            </label>
            <input
              type="text"
              defaultValue={`${user.lastName}`}
              name="last-name"
              className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              defaultValue={`${user.emailAddresses[0].emailAddress}`}
              disabled={isEditing}
              className={`border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden ${disabledCursorStyle}`}
            />
            {isEditing && (
              <p className="mt-2 text-sm text-red-400">
                Updating primary email is now allowed for now
              </p>
            )}
          </div>
          <div>
            <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
              Role
            </label>
            <select
              disabled
              className={`border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden ${disabledCursorStyle}`}
            >
              <option>Project Manager</option>
              <option>Developer</option>
              <option>Designer</option>
              <option>QA Engineer</option>
            </select>
            {isEditing && (
              <p className="mt-2 text-sm text-red-400">
                Updating user role is now allowed for now
              </p>
            )}
          </div>

          {/* buttons */}
          {isLoading ? (
            <div className="flex gap-4">
              <p>Updating...</p>
              <Loader2 className="dark:text-platinum-500 animate-spin"></Loader2>
            </div>
          ) : (
            isEditing && (
              <div className="flex justify-end space-x-3 pt-4">
                <Fragment>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                    className="text-payne's_gray-500 dark:text-french_gray-400 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg px-4 py-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue_munsell-500 hover:bg-blue_munsell-600 rounded-lg px-4 py-2 text-white transition-colors"
                  >
                    Save Changes
                  </button>
                </Fragment>
              </div>
            )
          )}
        </div>
      </form>
    </div>
  );
}
