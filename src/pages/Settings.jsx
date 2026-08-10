import React, { useState } from 'react';
import { 
  User, 
  Target, 
  Clock, 
  Moon, 
  Palette, 
  Bell, 
  Database 
} from 'lucide-react';

import ProfileSettings from '../components/settings/ProfileSettings';
import GoalSettings from '../components/settings/GoalSettings';
import TimerSettings from '../components/settings/TimerSettings';
import ThemeSettings from '../components/settings/ThemeSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import BackupSettings from '../components/settings/BackupSettings';

const SETTINGS_SECTIONS = [
  { id: 'profile', name: 'Profile Settings', icon: User, component: ProfileSettings },
  { id: 'goals', name: 'Study Goals', icon: Target, component: GoalSettings },
  { id: 'timer', name: 'Timer & Durations', icon: Clock, component: TimerSettings },
  { id: 'theme', name: 'Theme Mode', icon: Moon, component: ThemeSettings },
  { id: 'appearance', name: 'Appearance Preferences', icon: Palette, component: AppearanceSettings },
  { id: 'notifications', name: 'Notifications Alert', icon: Bell, component: NotificationSettings },
  { id: 'backup', name: 'Backup & Database', icon: Database, component: BackupSettings },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const ActiveComponent = SETTINGS_SECTIONS.find(tab => tab.id === activeTab)?.component || ProfileSettings;

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 md:px-8 md:py-10 transition-colors duration-300">
      
      {/* Header */}
      <div className="max-w-6xl mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
          App{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Settings
          </span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
          Customize FocusFlow variables, study goals, layout themes, and backup profiles locally.
        </p>
      </div>

      {/* Main Settings Grid */}
      <div className="max-w-6xl flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Column: Responsive Tabs (Horizontal scroll on mobile, Vertical stack on desktop) */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-3 md:pb-0 scrollbar-none scroll-smooth">
            {SETTINGS_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeTab === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                      : 'text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900/60 dark:hover:bg-slate-900/90'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                  <span>{section.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Column: Settings Content Wrapper */}
        <div className="flex-1 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 md:p-8 hover:shadow-lg transition-all duration-300">
          <div className="relative z-10">
            <ActiveComponent />
          </div>
        </div>

      </div>

    </div>
  );
}
