'use client';

import { useUser } from '@clerk/nextjs';
import { Fragment, useState } from 'react';
import { Edit, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

// TODO: handle updates or changes to email addresses
// TODO: add interface to do password-related actions (change password and forgot password)

export default function UserProfileDetail() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const disabledCursorStyle = isEditing ? 'hover: cursor-not-allowed' : ' ';

  if (!isLoaded) return <Loader2 className="bg-card animate-spin"></Loader2>;
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
    <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
      <header className="flex justify-between">
        <h3 className="mb-6 text-lg font-semibold">Profile Settings</h3>
        <button
          className="h-fit w-fit hover:cursor-pointer"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit className="hover:text-accent" />
        </button>
      </header>

      <form action={updateUser}>
        <div className="space-y-6">
          <div>
            <label className="text-muted-foreground block text-sm font-medium">First Name</label>
            <Input
              type="text"
              defaultValue={`${user.firstName}`}
              name="first-name"
              readOnly={!isEditing}
            />
          </div>
          <div>
            <label className="text-muted-foreground block text-sm font-medium">Last Name</label>
            <Input
              type="text"
              defaultValue={`${user.lastName}`}
              name="last-name"
              readOnly={!isEditing}
            />
          </div>
          <div>
            <label className="text-muted-foreground block text-sm font-medium">Email Address</label>
            <Input
              type="email"
              defaultValue={`${user.emailAddresses[0].emailAddress}`}
              readOnly={!isEditing}
            />

            {isEditing && (
              <p className="mt-2 text-sm text-red-400">
                Updating primary email is now allowed for now
              </p>
            )}
          </div>
          <div>
            <label className="text-muted-foreground block text-sm font-medium">Role</label>
            <select
              disabled
              className={`bg-input border-border w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-hidden ${disabledCursorStyle}`}
            >
              <option>Project Manager</option>
              <option>Developer</option>
              <option>Designer</option>
              <option>QA Engineer</option>
            </select>
            {isEditing && (
              <p className="mt-2 text-sm text-red-400">Updating user role is now allowed for now</p>
            )}
          </div>

          {/* buttons */}
          {isLoading ? (
            <div className="flex gap-4">
              <p>Updating...</p>
              <Loader2 className="bg-background animate-spin"></Loader2>
            </div>
          ) : (
            isEditing && (
              <div className="flex justify-end space-x-3 pt-4">
                <Fragment>
                  <Button onClick={() => setIsEditing(false)} disabled={isLoading} variant="cancel">
                    Cancel
                  </Button>
                  <Button type="submit" variant="submit" disabled={isLoading}>
                    Save Changes
                  </Button>
                </Fragment>
              </div>
            )
          )}
        </div>
      </form>
    </div>
  );
}
