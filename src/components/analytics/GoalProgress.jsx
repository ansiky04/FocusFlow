import React, { useEffect, useState } from 'react';
import { Target, CheckCircle2, Clock, Flame } from 'lucide-react';

const GOALS = [
  {
    id: 'focus-time',
    title: 'Daily Focus Hours',
    current: 4.5,
    target: 6.0,
    unit: 'h',
    icon: Clock,
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-500/10 dark:bg-orange-500/5',
  },
  {
    id: 'sessions',
    title: 'Focus Sessions',
    current: 9,
    target: 10,
    unit: ' sessions',
    icon: Target,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-500/10 dark:bg-indigo-500/5',
  },
  {
    id: 'tasks',
    title: 'Tasks Finished',
    current: 12,
    target: 15,
    unit: ' tasks',
    icon: CheckCircle2,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/5',
  },
  {
    id: 'streak',
    title: 'Weekly Streak',
    current: 5,
    target: 7,
    unit: ' days',
    icon: Flame,
    color: 'from-rose-500 to-orange-500',
    bgColor: 'bg-rose-500/10 dark:bg-rose-500/5',
  },
];

export default function GoalProgress() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between">
      
      {/* Background glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/10 to-transparent dark:via-indigo-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Target className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Goal Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track your milestones for today
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {GOALS.map((goal) => {
            const Icon = goal.icon;
            const percentage = Math.min((goal.current / goal.target) * 100, 100);
            
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {goal.title}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {goal.current}/{goal.target}{goal.unit} ({Math.round(percentage)}%)
                  </span>
                </div>
                
                {/* Progress bar background */}
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${goal.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ 
                      width: animated ? `${percentage}%` : '0%',
                    }}
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
