import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Flame,
  Award,
  Sparkles,
  Volume2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTime } from '../utils/helpers';

const MOTIVATIONAL_QUOTES = [
  "Focus is a muscle, and you are building it right now.",
  "Deep work produces high quality results. Keep flowing!",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Your mind is for having ideas, not holding them. Focus on the present.",
  "The secret of getting ahead is getting started.",
  "Work hard in silence, let your success be your noise.",
  "The only way to do great work is to love what you do."
];

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
    durations,
    handleStartPause,
    handleReset,
    handleSkip,
    playAlertSound,
    setUserSettings,
    activeSession,
    userSettings,
    token
  } = useApp();

  const [selectedDurationType, setSelectedDurationType] = useState(() => {
    return localStorage.getItem('focusflow_last_duration_type') || 'preset';
  });
  const [selectedPresetValue, setSelectedPresetValue] = useState(() => {
    const val = localStorage.getItem('focusflow_last_preset_value');
    return val ? parseInt(val) : 25;
  });
  const [customDurationValue, setCustomDurationValue] = useState(() => {
    return localStorage.getItem('focusflow_last_custom_duration') || '50';
  });
  const [inputError, setInputError] = useState('');

  const syncPausedSessionDuration = (seconds) => {
    if (!token) return;
    fetch('http://localhost:5000/api/sessions/active', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'paused', remainingTime: seconds })
    }).then(res => res.json()).catch(err => console.error('Failed to sync paused session duration:', err));
  };

  const handleSelectPreset = (mins) => {
    setSelectedDurationType('preset');
    setSelectedPresetValue(mins);
    localStorage.setItem('focusflow_last_duration_type', 'preset');
    localStorage.setItem('focusflow_last_preset_value', mins.toString());

    // Update global settings
    setUserSettings(prev => ({ ...prev, focusDuration: mins }));

    // If timer is paused/stopped, update timeLeft and sync to paused session on server
    if (!isActive) {
      setTimeLeft(mins * 60);
      if (activeSession) {
        syncPausedSessionDuration(mins * 60);
      }
    }
  };

  const handleSelectCustom = () => {
    setSelectedDurationType('custom');
    localStorage.setItem('focusflow_last_duration_type', 'custom');

    const mins = parseInt(customDurationValue) || 50;
    if (!isNaN(mins) && mins >= 1 && mins <= 180) {
      setInputError('');
      setUserSettings(prev => ({ ...prev, focusDuration: mins }));
      if (!isActive) {
        setTimeLeft(mins * 60);
        if (activeSession) {
          syncPausedSessionDuration(mins * 60);
        }
      }
    } else {
      setInputError('Please enter a duration between 1 and 180 minutes.');
    }
  };

  const handleCustomDurationChange = (val) => {
    setCustomDurationValue(val);
    localStorage.setItem('focusflow_last_custom_duration', val);

    const mins = parseInt(val);
    if (!isNaN(mins) && mins >= 1 && mins <= 180) {
      setInputError('');
      setUserSettings(prev => ({ ...prev, focusDuration: mins }));
      if (!isActive) {
        setTimeLeft(mins * 60);
        if (activeSession) {
          syncPausedSessionDuration(mins * 60);
        }
      }
    } else {
      setInputError('Please enter a duration between 1 and 180 minutes.');
    }
  };

  // Calculate circular progress
  const totalDuration = durations[mode];
  const progress = (totalDuration - timeLeft) / totalDuration;
  const radius = 120;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Active theme configuration mappings
  const modeSettings = {
    focus: {
      color: 'from-orange-500 to-amber-500',
      label: 'Focus Session',
      bgGlow: 'shadow-orange-500/10 dark:shadow-orange-500/5',
      badge: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
      stroke: 'stroke-orange-500',
    },
    short: {
      color: 'from-emerald-500 to-teal-500',
      label: 'Short Break',
      bgGlow: 'shadow-emerald-500/10 dark:shadow-emerald-500/5',
      badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      stroke: 'stroke-emerald-500',
    },
    long: {
      color: 'from-blue-500 to-indigo-500',
      label: 'Long Break',
      bgGlow: 'shadow-blue-500/10 dark:shadow-blue-500/5',
      badge: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      stroke: 'stroke-blue-500',
    },
  };

  const activeTheme = modeSettings[mode];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col items-center justify-start md:justify-center relative">

      {/* Motivational Toast Banner on Completion */}
      {showQuoteToast && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-bounce">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3 border border-indigo-400/20">
            <Sparkles className="h-6 w-6 text-yellow-300 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Session Completed!</h4>
              <p className="text-xs text-indigo-100 italic">"{quote}"</p>
            </div>
            <button
              onClick={() => setShowQuoteToast(false)}
              className="text-white/60 hover:text-white text-xs font-semibold ml-auto"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-md flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-8">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3 ${activeTheme.badge}`}>
            <span className={`h-2 w-2 rounded-full bg-current`} />
            {activeTheme.label}
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Focus Timer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Maximize efficiency and shield yourself from distractions.
          </p>
        </div>

        {/* Circular Progress Timer & Digital Countdown */}
        <div className={`relative flex items-center justify-center bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-full p-6 shadow-2xl ${activeTheme.bgGlow} transition-all duration-500 mb-8`}>

          <svg className="w-72 h-72 transform -rotate-90">
            {/* Background circular track */}
            <circle
              cx="144"
              cy="144"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            {/* Active countdown circular track */}
            <circle
              cx="144"
              cy="144"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`${activeTheme.stroke} transition-all duration-300 ease-out`}
            />
          </svg>

          {/* Absolute Central Text Area */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
              {mode === 'focus' ? 'Focusing' : 'Break'}
            </span>
          </div>

        </div>

        {/* Quick Mode Switcher */}
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-full max-w-sm justify-between mb-8 border border-slate-200/50 dark:border-slate-800/80">
          <button
            onClick={() => setMode('focus')}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all duration-200 ${mode === 'focus'
              ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            Focus ({userSettings?.focusDuration || 25}m)
          </button>
          <button
            onClick={() => setMode('short')}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all duration-200 ${mode === 'short'
              ? 'bg-white dark:bg-slate-850 text-emerald-500 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => setMode('long')}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all duration-200 ${mode === 'long'
              ? 'bg-white dark:bg-slate-850 text-blue-500 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Focus Duration Selector (Preset / Custom) */}
        {mode === 'focus' && (
          <div className="w-full max-w-sm mb-8 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                Focus Duration
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
              {[10, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  disabled={isActive}
                  onClick={() => handleSelectPreset(mins)}
                  className={`text-center py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${selectedDurationType === 'preset' && selectedPresetValue === mins
                    ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-md'
                    : 'text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                >
                  {mins}m
                </button>
              ))}
              <button
                disabled={isActive}
                onClick={handleSelectCustom}
                className={`text-center py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${selectedDurationType === 'custom'
                  ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-md'
                  : 'text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
              >
                Custom
              </button>
            </div>

            {selectedDurationType === 'custom' && (
              <div className="space-y-1.5 animate-fade-in">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    disabled={isActive}
                    value={customDurationValue}
                    onChange={(e) => handleCustomDurationChange(e.target.value)}
                    placeholder="Enter minutes (1-180)"
                    className="w-full bg-transparent text-sm focus:outline-none text-slate-800 dark:text-white font-semibold disabled:opacity-75"
                  />
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-550">mins</span>
                </div>
                {inputError && (
                  <p className="text-[11px] text-rose-500 dark:text-rose-450 font-bold pl-1">
                    {inputError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Primary Action Controls */}
        <div className="flex items-center gap-4 w-full max-w-sm justify-center mb-8">

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="rounded-2xl p-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800/60 dark:hover:text-slate-200 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
            title="Reset Session"
          >
            <RotateCcw className="h-6 w-6" />
          </button>

          {/* Start / Pause Toggle */}
          <button
            onClick={handleStartPause}
            disabled={selectedDurationType === 'custom' && !!inputError && !isActive}
            className={`rounded-2xl px-8 py-4 bg-gradient-to-r ${activeTheme.color} text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isActive ? (
              <>
                <Pause className="h-5 w-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5 fill-current" />
                <span>Start Session</span>
              </>
            )}
          </button>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="rounded-2xl p-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800/60 dark:hover:text-slate-200 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
            title="Skip Current Mode"
          >
            <SkipForward className="h-6 w-6" />
          </button>

        </div>

        {/* Stats & Quote Footer */}
        <div className="w-full space-y-4">

          {/* Session Progress indicator */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-100 dark:bg-orange-950/40 p-2 text-orange-500">
                <Flame className="h-5 w-5 fill-current" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Daily Completed</p>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Focus Sessions</h4>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${i < completedSessions
                    ? 'bg-orange-500 scale-110 shadow-sm shadow-orange-500/20'
                    : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  title={`${completedSessions} focus slots completed`}
                />
              ))}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                {completedSessions}
              </span>
            </div>
          </div>

          {/* Motivational Quote block */}
          <div className="bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/20 dark:border-indigo-900/10 rounded-2xl p-4 flex items-start gap-3">
            <Award className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mb-1">Study Insight</p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                "{quote}"
              </p>
            </div>
          </div>

          {/* Sound Synthesizer Testing Button */}
          <button
            onClick={playAlertSound}
            className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400 mx-auto transition-colors duration-150"
          >
            <Volume2 className="h-3.5 w-3.5" /> Test alarm sound
          </button>

        </div>

      </div>

    </div>
  );
}
