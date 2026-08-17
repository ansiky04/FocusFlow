import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Clock,
  CheckCircle2,
  Flame,
  Sliders,
  Volume2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/helpers';
import { API_BASE_URL } from '../utils/api';

export default function Timer() {
  const {
    mode,
    setMode,
    timeLeft,
    setTimeLeft,
    isActive,
    completedSessions,
    quote,
    showQuoteToast,
    setShowQuoteToast,
    durations,
    handleStartPause,
    handleReset,
    handleSkip,
    playAlertSound,
    setUserSettings,
    userSettings,
    token
  } = useApp();

  const [analytics, setAnalytics] = useState(null);
  const [alarmVolume, setAlarmVolume] = useState(() => {
    return parseInt(localStorage.getItem('focusflow_alarm_volume') || '80');
  });

  // Fetch real analytics for session statistics (Today's Focus Time, Streak)
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/analytics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
        }
      } catch (err) {
        console.error('Error fetching analytics in Timer:', err);
      }
    };

    fetchAnalytics();
  }, [token]);

  const handleDurationChange = (key, val) => {
    const num = Math.max(1, parseInt(val) || 1);
    setUserSettings(prev => ({ ...prev, [key]: num }));
    if (!isActive) {
      if (mode === 'focus' && key === 'focusDuration') setTimeLeft(num * 60);
      if (mode === 'short' && key === 'shortBreak') setTimeLeft(num * 60);
      if (mode === 'long' && key === 'longBreak') setTimeLeft(num * 60);
    }
  };

  const handleToggleSetting = (key) => {
    setUserSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVolumeChange = (val) => {
    const vol = parseInt(val) || 0;
    setAlarmVolume(vol);
    localStorage.setItem('focusflow_alarm_volume', vol.toString());
  };

  // Calculate circular progress
  const totalDuration = durations[mode] || 25 * 60;
  const progress = Math.min(1, Math.max(0, (totalDuration - timeLeft) / totalDuration));
  const radius = 110;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 transition-colors duration-300 relative">
      
      {/* Motivational Toast on Session Completion */}
      {showQuoteToast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-[14px] p-4 shadow-lg border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="min-w-0 pr-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">Session Completed!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{quote}"</p>
            </div>
            <button
              onClick={() => setShowQuoteToast(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold ml-auto"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Focus Timer
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Stay in the flow zone and boost your study productivity.
            </p>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (7 cols): Timer Card + Session Statistics */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Timer Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-6 shadow-sm flex flex-col items-center">
              
              {/* Three Mode Buttons */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-[10px] w-full max-w-sm mb-6">
                <button
                  onClick={() => setMode('focus')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-[8px] transition-all ${
                    mode === 'focus'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Focus ({userSettings?.focusDuration || 25}m)
                </button>
                <button
                  onClick={() => setMode('short')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-[8px] transition-all ${
                    mode === 'short'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Short Break ({userSettings?.shortBreak || 5}m)
                </button>
                <button
                  onClick={() => setMode('long')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-[8px] transition-all ${
                    mode === 'long'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Long Break ({userSettings?.longBreak || 15}m)
                </button>
              </div>

              {/* Large Circular Countdown Timer */}
              <div className="relative flex items-center justify-center my-2">
                <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  {/* Active Progress Track */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-indigo-600 dark:text-indigo-500 transition-all duration-300 ease-out"
                  />
                </svg>

                {/* Center Content: Mode label & MM:SS */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full mb-1">
                    {mode === 'focus' ? 'Focus' : mode === 'short' ? 'Short Break' : 'Long Break'}
                  </span>
                  <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                    {isActive ? 'Session in progress' : 'Paused / Ready'}
                  </span>
                </div>
              </div>

              {/* Timer Control Action Buttons */}
              <div className="flex items-center gap-3 mt-6">
                {/* Reset Button */}
                <button
                  onClick={handleReset}
                  className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-[12px] shadow-sm hover:shadow transition-all"
                  title="Reset Timer"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                {/* Start / Pause Button */}
                <button
                  onClick={handleStartPause}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-[12px] shadow-sm hover:shadow flex items-center gap-2 transition-all min-w-[140px] justify-center"
                >
                  {isActive ? (
                    <>
                      <Pause className="h-4 w-4 fill-white" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-white" />
                      <span>Start</span>
                    </>
                  )}
                </button>

                {/* Skip Button */}
                <button
                  onClick={handleSkip}
                  className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-[12px] shadow-sm hover:shadow transition-all"
                  title="Skip Session"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>

            </div>

            {/* Session Statistics Section */}
            <div>
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                Session Statistics
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {/* Today's Focus Time */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm text-center">
                  <div className="flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white block">
                    {analytics ? `${analytics.totalFocusHours.toFixed(1)}h` : '0.0h'}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Today's Focus Time
                  </span>
                </div>

                {/* Sessions Completed */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm text-center">
                  <div className="flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white block">
                    {completedSessions}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Sessions Completed
                  </span>
                </div>

                {/* Current Streak */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm text-center">
                  <div className="flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
                    <Flame className="h-4 w-4" />
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white block">
                    {analytics ? `${analytics.currentStreak}d` : '0d'}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Current Streak
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (5 cols): Session Settings */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Session Settings
                </h2>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              {/* Focus Duration */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Focus Duration</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{userSettings?.focusDuration || 25} min</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  disabled={isActive}
                  value={userSettings?.focusDuration || 25}
                  onChange={(e) => handleDurationChange('focusDuration', e.target.value)}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
                />
              </div>

              {/* Short Break */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Short Break</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{userSettings?.shortBreak || 5} min</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  disabled={isActive}
                  value={userSettings?.shortBreak || 5}
                  onChange={(e) => handleDurationChange('shortBreak', e.target.value)}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
                />
              </div>

              {/* Long Break */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Long Break</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{userSettings?.longBreak || 15} min</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  disabled={isActive}
                  value={userSettings?.longBreak || 15}
                  onChange={(e) => handleDurationChange('longBreak', e.target.value)}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
                />
              </div>

              {/* Alarm Volume */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Alarm Volume</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{alarmVolume}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={alarmVolume}
                    onChange={(e) => handleVolumeChange(e.target.value)}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <button
                    onClick={playAlertSound}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Test alarm sound"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {/* Auto Start Breaks */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">Auto Start Breaks</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Begin break timer automatically</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('autoStartBreak')}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                    userSettings?.autoStartBreak ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                      userSettings?.autoStartBreak ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Auto Start Focus */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">Auto Start Focus</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Resume focus after break ends</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('autoStartNextSession')}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                    userSettings?.autoStartNextSession ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
                      userSettings?.autoStartNextSession ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

