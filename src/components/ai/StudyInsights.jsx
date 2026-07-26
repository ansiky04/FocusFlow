import React from 'react';
import { Sun, Hourglass, TrendingUp, Calendar, Zap } from 'lucide-react';

const INSIGHTS = [
  {
    label: 'Best Study Window',
    value: '9:00 AM - 11:00 AM',
    desc: 'Peak concentration period',
    icon: Sun,
    color: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/5',
  },
  {
    label: 'Avg Session Duration',
    value: '35 minutes',
    desc: 'Optimal length for depth',
    icon: Hourglass,
    color: 'text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/5',
  },
  {
    label: 'Weekly Improvement',
    value: '+14.5% Focus Time',
    desc: 'VS last 7-day average',
    icon: TrendingUp,
    color: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/5',
  },
  {
    label: 'Strongest Study Day',
    value: 'Saturdays',
    desc: 'Average 7.2 hours logged',
    icon: Calendar,
    color: 'text-purple-500 bg-purple-500/10 dark:bg-purple-500/5',
  },
];

export default function StudyInsights() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between">
      
      {/* Background glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/10 to-transparent dark:via-purple-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      <div className="relative z-10 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Study Insights
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized cognitive trends & study patterns
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INSIGHTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index} 
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:scale-[1.02] transition-transform duration-200 flex flex-col justify-between min-h-[110px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                    {item.label}
                  </span>
                  <div className={`p-1.5 rounded-lg ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-0.5 leading-tight">
                    {item.value}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
