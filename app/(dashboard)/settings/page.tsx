import { ThemeDropdown } from '@/components/dropdowns/theme-dropdown';
import UserProfileDetail from '@/components/profile/user-profile-detail';

export default function SettingsPage() {
  return (
    <div className="w-[800px] space-y-6">
      <div>
        <h1 className="text-primary text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and application preferences
        </p>
      </div>

      {/* Settings Sections */}
      {/* User Information */}
      <UserProfileDetail />
      <div className="border-border bg-input/30 mb-4 flex flex-row items-center justify-between rounded-sm border-1 p-4">
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-primary">Appearance</p>
            <p className="text-muted-foreground text-sm">Change the appearance of the website</p>
          </div>
          <ThemeDropdown />
        </div>
      </div>
    </div>
  );
}
