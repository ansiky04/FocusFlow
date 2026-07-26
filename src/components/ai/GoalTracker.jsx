import React, { useState, useEffect } from 'react';
import { Target, TrendingUp } from 'lucide-react';

const GOALS_DATA = [
  {
    type: 'Daily Goal',
    current: 4.5,
    target: 6.0,
    unit: ' hrs',
    color: 'from-orange-500 to-amber-500',
  },
  {
    type: 'Weekly Goal',
    current: 26,
    target: 30,
    unit: ' hrs',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    type: 'Monthly Goal',
    current: 88,
    target: 120,
    unit: ' hrs',
    color: 'from-emerald-500 to-teal-500',
  },
];

export default function GoalTracker() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between">
      
      {/* Glow highlight */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/10 to-transparent dark:via-indigo-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      <div className="relative z-10 w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Goal Tracker
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your long-term performance objectives
            </p>
          </div>
        </div>

        {/* Goals Progress Bars */}
        <div className="space-y-6">
          {GOALS_DATA.map((goal, idx) => {
            const percentage = Math.min((goal.current / goal.target) * 100, 100);
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {goal.type}
                  </span>
                  <span className="font-extrabold text-slate-500 dark:text-slate-400">
                    {goal.current}/{goal.target}{goal.unit} ({Math.round(percentage)}%)
                  </span>
                </div>
                {/* Progress bar line */}
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${goal.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: animated ? `${percentage}%` : '0%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
