import React, { useState, useEffect } from 'react';
import { Target, Save, RotateCcw, Check, Sparkles } from 'lucide-react';

export default function GoalSettings() {
  const [dailyGoal, setDailyGoal] = useState(6.0);
  const [weeklyGoal, setWeeklyGoal] = useState(30.0);
  const [monthlyGoal, setMonthlyGoal] = useState(120.0);
  const [targetSessions, setTargetSessions] = useState(10);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    const savedGoals = localStorage.getItem('focusflow_study_goals');
    if (savedGoals) {
      try {
        const data = JSON.parse(savedGoals);
        if (data.dailyGoal !== undefined) setDailyGoal(Number(data.dailyGoal));
        if (data.weeklyGoal !== undefined) setWeeklyGoal(Number(data.weeklyGoal));
        if (data.monthlyGoal !== undefined) setMonthlyGoal(Number(data.monthlyGoal));
        if (data.targetSessions !== undefined) setTargetSessions(Number(data.targetSessions));
      } catch (e) {
        console.warn("Failed to load study goals:", e);
      }
    }
  }, []);

  const handleSave = () => {
    const data = { dailyGoal, weeklyGoal, monthlyGoal, targetSessions };
    localStorage.setItem('focusflow_study_goals', JSON.stringify(data));
    
    // Dispatch storage event to alert other modules
    window.dispatchEvent(new Event('storage'));

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleReset = () => {
    setDailyGoal(6.0);
    setWeeklyGoal(30.0);
    setMonthlyGoal(120.0);
    setTargetSessions(10);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Study Goal Settings
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Define your target study duration milestones and daily Pomodoro goals
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Daily Study Goal */}
        <div className="space-y-2 p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
            Daily Study Goal
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="24"
              step="0.5"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 min-w-[60px] text-right">
              {dailyGoal.toFixed(1)} hrs
            </span>
          </div>
        </div>

        {/* Target Sessions */}
        <div className="space-y-2 p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
            Daily Target Pomodoro Sessions
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              max="50"
              value={targetSessions}
              onChange={(e) => setTargetSessions(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500/80"
            />
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 min-w-[60px] text-right">
              {targetSessions} sessions
            </span>
          </div>
        </div>

        {/* Weekly Study Goal */}
        <div className="space-y-2 p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
            Weekly Study Goal
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="5"
              max="168"
              step="1"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(Number(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 min-w-[60px] text-right">
              {weeklyGoal} hrs
            </span>
          </div>
        </div>

        {/* Monthly Study Goal */}
        <div className="space-y-2 p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
            Monthly Study Goal
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="20"
              max="720"
              step="5"
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(Number(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 min-w-[60px] text-right">
              {monthlyGoal} hrs
            </span>
          </div>
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
          Reset Goals
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-500/10 hover:scale-102 active:scale-98 transition-all duration-200"
        >
          <Save className="h-4 w-4" />
          Save Goals
        </button>
      </div>

      {/* Saved Notification */}
      {showSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white font-bold text-xs md:text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4" />
          Study goals updated successfully!
        </div>
      )}

    </div>
  );
}
