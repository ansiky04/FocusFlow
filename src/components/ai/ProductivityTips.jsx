import React from 'react';
import { Compass, BookOpen, Heart, Eye } from 'lucide-react';

const TIPS = [
  {
    title: 'The 50/10 Rule',
    description: 'Work intensely for 50 minutes, then take a 10-minute active rest. Great for deep cognitive tasks.',
    icon: Compass,
    color: 'text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/5',
  },
  {
    title: 'Active Recall',
    description: 'After reading a concept, close the notes and write down everything you remember. Boosts memory retrieval.',
    icon: BookOpen,
    color: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/5',
  },
  {
    title: 'Hydration & Posture',
    description: 'Stand up and stretch during break periods. Keep water at your desk to keep your mind oxygenated.',
    icon: Heart,
    color: 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/5',
  },
  {
    title: 'Minimize Tab Overload',
    description: 'Keep only 2 browser tabs open: one for the focus timer and one for your main study document.',
    icon: Eye,
    color: 'text-orange-500 bg-orange-500/10 dark:bg-orange-500/5',
  },
];

export default function ProductivityTips() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between">
      
      {/* Background glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/10 to-transparent dark:via-indigo-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      <div className="relative z-10">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Productivity Hacking
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Science-backed focus techniques & habits
        </p>

        <div className="space-y-4">
          {TIPS.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div 
                key={index} 
                className="flex items-start gap-4 p-3 rounded-xl border border-slate-50 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-950/20 hover:border-slate-100 dark:hover:border-slate-800 transition-colors duration-150"
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${tip.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                    {tip.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tip.description}
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
