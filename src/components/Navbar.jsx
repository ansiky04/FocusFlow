import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, 
  Moon, 
  Bell, 
  Sparkles, 
  LogOut, 
  Flame, 
  Coffee, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  Check, 
  Inbox 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import logoUrl from '../assets/logo.svg';

export default function Navbar() {
  const { 
    theme, 
    toggleTheme, 
    user, 
    logout,
    userNotifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationItem,
    clearAllNotificationItems
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format notification time
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Get corresponding icon and style for category
  const getCategoryDetails = (category) => {
    switch (category) {
      case 'Focus':
        return {
          icon: <Flame className="h-4 w-4 text-orange-500" />,
          bgColor: 'bg-orange-50 dark:bg-orange-950/20'
        };
      case 'Break':
        return {
          icon: <Coffee className="h-4 w-4 text-emerald-500" />,
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/20'
        };
      case 'Goal':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-purple-500" />,
          bgColor: 'bg-purple-50 dark:bg-purple-950/20'
        };
      case 'Study':
      case 'Exam':
      case 'Assignment':
      default:
        return {
          icon: <Calendar className="h-4 w-4 text-indigo-500" />,
          bgColor: 'bg-indigo-50 dark:bg-indigo-950/20'
        };
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85 transition-colors duration-300">
      <div className="flex h-16 items-center justify-between px-6">
        
        {/* Branding */}
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="FocusFlow Logo" className="h-8 w-8 animate-pulse" />
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-wide">
            FocusFlow
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Sparkles className="h-3 w-3" /> v1.0
          </span>
        </div>
 
        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 transition-all duration-200 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          {/* Notification Button and Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 transition-all duration-200 cursor-pointer"
              aria-label="Notifications"
            >
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-fade-in">
                  {unreadCount}
                </span>
              )}
              <Bell className="h-5 w-5" />
            </button>

            {/* Dropdown Card */}
            {isOpen && (
              <div className="absolute right-0 mt-2.5 w-[330px] sm:w-[380px] rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden animate-scale-in z-50">
                
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Notifications</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                      {unreadCount} unread messages
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markAllNotificationsAsRead()}
                      className="text-[10px] font-extrabold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Check className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
                  {userNotifications.length > 0 ? (
                    userNotifications.map((notif) => {
                      const details = getCategoryDetails(notif.category);
                      return (
                        <div 
                          key={notif._id} 
                          className={`flex items-start gap-3 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 group relative transition-colors ${
                            !notif.read ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : ''
                          }`}
                        >
                          {/* Category Badge Icon */}
                          <div className={`p-2 rounded-xl flex-shrink-0 ${details.bgColor}`}>
                            {details.icon}
                          </div>

                          {/* Message Content */}
                          <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-xs font-bold truncate ${
                                !notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                              }`}>
                                {notif.title}
                              </span>
                              <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                {formatTime(notif.createdAt)}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>

                          {/* Action overlay options */}
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notif.read && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); markNotificationAsRead(notif._id); }}
                                className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 shadow-sm transition-all cursor-pointer"
                                title="Mark as read"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteNotificationItem(notif._id); }}
                              className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 shadow-sm transition-all cursor-pointer"
                              title="Delete notification"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Unread indicator dot */}
                          {!notif.read && (
                            <span className="absolute right-3.5 top-4 h-1.5 w-1.5 rounded-full bg-indigo-500 group-hover:scale-0 transition-transform" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl mb-3 text-slate-350 dark:text-slate-600">
                        <Inbox className="h-7 w-7" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">All caught up!</span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">
                        You'll see study reminders, break completion, and focus alerts here.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {userNotifications.length > 0 && (
                  <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-850/20 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button 
                      onClick={() => clearAllNotificationItems()}
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-450 transition-colors cursor-pointer"
                    >
                      Clear all notifications
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
 
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
 
          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] transition-transform group-hover:scale-105 duration-200">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white uppercase tracking-wider">
                {user ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'JD'}
              </div>
            </div>
            <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-500 transition-colors duration-200">
              {user ? user.fullName : 'John Doe'}
            </span>
          </div>
 
          {user && (
            <button
              onClick={logout}
              className="rounded-full p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-all duration-200 cursor-pointer"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
 
      </div>
    </header>
  );
}

