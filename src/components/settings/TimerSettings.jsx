import React, { useState, useEffect } from 'react';
import { Clock, Save, RotateCcw, Check, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function TimerSettings() {
  const { userSettings, setUserSettings } = useApp();

  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [autoStartBreak, setAutoStartBreak] = useState(false);
  const [autoStartNextSession, setAutoStartNextSession] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Sync state with context
  useEffect(() => {
    if (userSettings) {
      if (userSettings.focusDuration !== undefined) setFocusDuration(userSettings.focusDuration);
      if (userSettings.shortBreak !== undefined) setShortBreak(userSettings.shortBreak);
      if (userSettings.longBreak !== undefined) setLongBreak(userSettings.longBreak);
      if (userSettings.autoStartBreak !== undefined) setAutoStartBreak(userSettings.autoStartBreak);
      if (userSettings.autoStartNextSession !== undefined) setAutoStartNextSession(userSettings.autoStartNextSession);
      if (userSettings.enableNotifications !== undefined) setEnableNotifications(userSettings.enableNotifications);
    }
  }, [userSettings]);

  const handleSave = () => {
    const updated = {
      focusDuration,
      shortBreak,
      longBreak,
      autoStartBreak,
      autoStartNextSession,
      enableNotifications,
    };
    // Save to LocalStorage
    localStorage.setItem('focusflow_timer_settings', JSON.stringify(updated));
    // Update global context
    setUserSettings(updated);

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleReset = () => {
    setFocusDuration(25);
    setShortBreak(5);
    setLongBreak(15);
    setAutoStartBreak(false);
    setAutoStartNextSession(false);
    setEnableNotifications(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Timer & Focus Settings
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure Pomodoro durations and automated focus timer actions
        </p>
      </div>

      {/* Durations inputs */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Session Durations (Minutes)
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Focus Duration */}
          <div className="space-y-1.5 p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
              Focus Session
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="180"
                value={focusDuration}
                onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500/80"
              />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">min</span>
            </div>
          </div>

          {/* Short Break Duration */}
          <div className="space-y-1.5 p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
              Short Break
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="60"
                value={shortBreak}
                onChange={(e) => setShortBreak(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500/80"
              />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">min</span>
            </div>
          </div>

          {/* Long Break Duration */}
          <div className="space-y-1.5 p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
              Long Break
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="120"
                value={longBreak}
                onChange={(e) => setLongBreak(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500/80"
              />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Automations and Switches */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Automation & Notifications
        </h4>
        
        <div className="space-y-3.5">
          {/* Auto Start Break */}
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-950/10 cursor-pointer hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
            <div>
              <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                Auto Start Breaks
              </span>
              <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
                Automatically start the break timer once a focus session expires
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoStartBreak}
              onChange={(e) => setAutoStartBreak(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
          </label>

          {/* Auto Start Next Session */}
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-950/10 cursor-pointer hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
            <div>
              <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                Auto Start Next Focus Session
              </span>
              <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
                Automatically trigger the next focus sprint when break period is finished
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoStartNextSession}
              onChange={(e) => setAutoStartNextSession(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
          </label>

          {/* Enable Notifications */}
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/20 dark:border-slate-800 dark:bg-slate-950/10 cursor-pointer hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
            <div>
              <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-0.5 flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-indigo-500" />
                Enable System Sound Alert
              </span>
              <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">
                Play alerts in browser tab when focus sessions or breaks are finished
              </span>
            </div>
            <input
              type="checkbox"
              checked={enableNotifications}
              onChange={(e) => setEnableNotifications(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-slate-100 dark:border-slate-800/80 my-2" />

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-xl transition-all duration-200"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Timer Settings
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-500/10 hover:scale-102 active:scale-98 transition-all duration-200"
        >
          <Save className="h-4 w-4" />
          Save Timer Settings
        </button>
      </div>

      {/* Saved Notification */}
      {showSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white font-bold text-xs md:text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4" />
          Timer configurations updated!
        </div>
      )}

    </div>
  );
}
