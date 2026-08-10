import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Timer, 
  CheckSquare, 
  CalendarClock,
  CheckCircle2,
  Calendar,
  BarChart2, 
  Settings, 
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { isMobileMenuOpen, closeMobileMenu } = useApp();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Focus Timer', path: '/timer', icon: Timer },
    { name: 'Daily Planner', path: '/planner', icon: CalendarClock },
    { name: 'Task Manager', path: '/tasks', icon: CheckSquare },
    { name: 'Habit Tracker', path: '/habits', icon: CheckCircle2 },
    { name: 'Study Calendar', path: '/calendar', icon: Calendar },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Focus Shield', path: '/shield', icon: ShieldAlert },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const renderNavLinks = () => (
    <nav className="space-y-1.5">
      {menuItems.map((item) => {
        const Icon = item.icon;
        
        return (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  const renderFooterInfo = () => (
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
        onClick={closeMobileMenu}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-150"
      >
        <HelpCircle className="h-5 w-5 shrink-0" />
        <span>Support & Help</span>
      </a>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 flex-col justify-between transition-colors duration-300">
        <div className="px-4 py-6">
          {renderNavLinks()}
        </div>
        {renderFooterInfo()}
      </aside>

      {/* Mobile Drawer Overlay (visible on < md when isMobileMenuOpen === true) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
            onClick={closeMobileMenu} 
          />

          {/* Sliding Drawer Container */}
          <aside className="relative z-10 w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto animate-slide-in-left">
            <div className="px-4 py-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Navigation</span>
                <button 
                  onClick={closeMobileMenu}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
              {renderNavLinks()}
            </div>
            {renderFooterInfo()}
          </aside>
        </div>
      )}
    </>
  );
}
