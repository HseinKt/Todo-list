import React from 'react';
import { User, Shield } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="flex-1 bg-white dark:bg-neutral-950 p-8 overflow-y-auto text-neutral-800 dark:text-neutral-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage profiles, credentials, alerts, and active connections.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <User size={18} className="text-violet-600 dark:text-violet-400" />
            Personal Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value="Sarah Jenkins"
                className="w-full bg-neutral-200/50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-lg text-sm text-neutral-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value="sarah.j@example.com"
                className="w-full bg-neutral-200/50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-lg text-sm text-neutral-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield size={18} className="text-violet-600 dark:text-violet-400" />
            Security Controls
          </h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-neutral-950 dark:text-white">Two-Factor Authentication (2FA)</p>
              <p className="text-xs text-neutral-500 mt-0.5">Toggle MFA authentication during secure logins.</p>
            </div>
            <button className="bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/40 dark:hover:bg-violet-900/60 text-violet-600 dark:text-violet-400 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition">
              Setup TOTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
