import UserProfileDetail from '@/components/profile/user-profile-detail';
import { User, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and application preferences
        </p>
      </div>

      {/* Implementation Tasks Banner */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-yellow-800">
          ⚙️ Settings Implementation Tasks
        </h3>
        <ul className="space-y-1 text-sm text-yellow-700">
          <li>• Task 2.4: Implement user session management</li>
          <li>• Task 6.4: Implement project member management and permissions</li>
        </ul>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Settings Navigation */}
        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4 text-lg font-semibold">Settings</h3>
          <nav className="space-y-2">
            {[
              { name: 'Profile', icon: User, active: true },
              { name: 'Notifications', icon: Bell, active: false },
              { name: 'Security', icon: Shield, active: false },
              { name: 'Appearance', icon: Palette, active: false },
            ].map((item) => (
              <button
                key={item.name}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-primary text-background hover: cursor-pointer'
                    : 'hover: bg-accent hover: cursor-pointer'
                }`}
              >
                <item.icon className="mr-3" size={16} />
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* User Information */}
        <UserProfileDetail />
      </div>
    </div>
  );
}
