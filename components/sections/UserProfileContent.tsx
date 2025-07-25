import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function UserProfileContent() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // TODO 2.4: maybe replace this with useUser for better user actions
  const user = await currentUser();

  console.log(user);

  return (
    <div className="dark:bg-outer_space-500 border-french_gray-300 dark:border-payne's_gray-400 rounded-lg border bg-white p-6 lg:col-span-2">
      <h3 className="text-outer_space-500 dark:text-platinum-500 mb-6 text-lg font-semibold">
        Profile Settings
      </h3>

      <div className="space-y-6">
        <div>
          <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
            Full Name
          </label>
          <input
            type="text"
            defaultValue={`${user?.firstName} ${user?.lastName}`}
            className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
            Email Address
          </label>
          <input
            type="email"
            defaultValue={`${user?.emailAddresses[0].emailAddress}`}
            className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="text-outer_space-500 dark:text-platinum-500 mb-2 block text-sm font-medium">
            Role
          </label>
          <select className="border-french_gray-300 dark:border-payne's_gray-400 dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:ring-blue_munsell-500 w-full rounded-lg border bg-white px-3 py-2 focus:ring-2 focus:outline-hidden">
            <option>Project Manager</option>
            <option>Developer</option>
            <option>Designer</option>
            <option>QA Engineer</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button className="text-payne's_gray-500 dark:text-french_gray-400 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg px-4 py-2 transition-colors">
            Cancel
          </button>
          <button className="bg-blue_munsell-500 hover:bg-blue_munsell-600 rounded-lg px-4 py-2 text-white transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
