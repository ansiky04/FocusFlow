import React, { useState, useEffect } from 'react';
import { Save, Check, BellRing, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function NotificationSettings() {
  const { 
    notificationSettings, 
    setNotificationSettings, 
    requestNotificationPermission, 
    notificationPermission 
  } = useApp();

  const [focusAlerts, setFocusAlerts] = useState(notificationSettings.focusAlerts);
  const [breakAlerts, setBreakAlerts] = useState(notificationSettings.breakAlerts);
  const [dailyReminders, setDailyReminders] = useState(notificationSettings.dailyReminders);
  const [achievementBadges, setAchievementBadges] = useState(notificationSettings.achievementBadges);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    setFocusAlerts(notificationSettings.focusAlerts);
    setBreakAlerts(notificationSettings.breakAlerts);
    setDailyReminders(notificationSettings.dailyReminders);
    setAchievementBadges(notificationSettings.achievementBadges);
  }, [notificationSettings]);

  const handleSave = () => {
    setNotificationSettings({
      focusAlerts,
      breakAlerts,
      dailyReminders,
      achievementBadges
    });

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Notification Settings
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Control how and when FocusFlow sends notifications and study reminders
        </p>
      </div>

      {/* Browser Permission Alert Banner */}
      {notificationPermission !== 'granted' && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                Browser Notifications Disabled
              </span>
              <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">
                To receive desktop alerts for study reminders and break completions, enable browser permissions.
              </span>
            </div>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            Allow Notifications
          </button>
        </div>
      )}

      {/* Preferences Toggles */}
      <div className="space-y-3.5">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
          <BellRing className="h-4 w-4 text-indigo-500" />
          Alert Categories
        </h4>

        {/* Focus Alerts */}
        <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-950/10 cursor-pointer hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
          <div>
            <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
              Focus Session Alerts
            </span>
            <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
              Receive alert notifications when a study or work session completes
            </span>
          </div>
          <input
            type="checkbox"
            checked={focusAlerts}
            onChange={(e) => setFocusAlerts(e.target.checked)}
            className="w-4 h-4 accent-indigo-500 cursor-pointer"
          />
        </label>

        {/* Break Alerts */}
        <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-950/10 cursor-pointer hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
          <div>
            <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
              Break Session Alerts
            </span>
            <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
              Receive notifications when break times end so you can return to flow
            </span>
          </div>
          <input
            type="checkbox"
            checked={breakAlerts}
            onChange={(e) => setBreakAlerts(e.target.checked)}
            className="w-4 h-4 accent-indigo-500 cursor-pointer"
          />
        </label>

        {/* Daily Reminders */}
        <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-950/10 cursor-pointer hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
          <div>
            <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
              Daily Reminders
            </span>
            <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
              Get nudged to complete your daily focus hours target if pending
            </span>
          </div>
          <input
            type="checkbox"
            checked={dailyReminders}
            onChange={(e) => setDailyReminders(e.target.checked)}
            className="w-4 h-4 accent-indigo-500 cursor-pointer"
          />
        </label>

        {/* Achievement Notifications */}
        <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-950/10 cursor-pointer hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
          <div>
            <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
              Achievement Alerts
            </span>
            <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
              Notify you immediately when unlocking special performance badges or milestone streaks
            </span>
          </div>
          <input
            type="checkbox"
            checked={achievementBadges}
            onChange={(e) => setAchievementBadges(e.target.checked)}
            className="w-4 h-4 accent-indigo-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Action */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-500/10 hover:scale-102 active:scale-98 transition-all duration-200 cursor-pointer"
        >
          <Save className="h-4 w-4" />
          Save Notifications
        </button>
      </div>

      {/* Success Notification */}
      {showSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white font-bold text-xs md:text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4 inline" />
          Notification settings updated!
        </div>
      )}

    </div>
  );
}
