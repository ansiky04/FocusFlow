import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Timer, 
  CheckSquare, 
  Calendar,
  BarChart2, 
  Settings, 
  HelpCircle,
  ShieldAlert,
  Bot,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Focus Timer', path: '/timer', icon: Timer },
    { name: 'Task Manager', path: '/tasks', icon: CheckSquare },
    { name: 'Study Calendar', path: '/calendar', icon: Calendar },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'AI Assistant', path: '/ai', icon: Bot },
    { name: 'AI Coach', path: '/coach', icon: Sparkles },
    { name: 'Focus Shield', path: '/shield', icon: ShieldAlert },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 flex flex-col justify-between transition-colors duration-300">
      
      {/* Sidebar Navigation Links */}
      <div className="px-4 py-6">
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed select-none group"
                  title="Coming Soon in next phases"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                  <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-500 px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Info */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-3.5 border border-indigo-500/20 dark:border-indigo-500/10">
          <h4 className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" /> Study Zone Active
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Distractions are minimized. Get ready to flow.
          </p>
        </div>

        <a 
          href="#help" 
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-150"
        >
          <HelpCircle className="h-5 w-5" />
          <span>Support & Help</span>
        </a>
      </div>

    </aside>
  );
}
