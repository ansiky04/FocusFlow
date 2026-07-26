import React from 'react';
import { CheckCircle2, Clock, PlusCircle, Flame, Sparkles } from 'lucide-react';

const RECENT_ACTIVITIES = [
  {
    id: 1,
    title: 'Focus Session Finished',
    description: 'Completed deep work on React Router integration',
    time: '25m ago',
    icon: Sparkles,
    color: 'text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/5',
  },
  {
    id: 2,
    title: 'Reached Daily Goal',
    description: 'Surpassed today\'s 4-hour focus duration goal',
    time: '1h ago',
    icon: Flame,
    color: 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/5',
  },
  {
    id: 3,
    title: 'Completed Pomodoro Session',
    description: 'Finished study session on Calculus limits',
    time: '2h ago',
    icon: Clock,
    color: 'text-orange-500 bg-orange-500/10 dark:bg-orange-500/5',
  },
  {
    id: 4,
    title: 'Completed Assignment',
    description: 'Marked "Chapter 3 Summary" task as done',
    time: '4h ago',
    icon: CheckCircle2,
    color: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/5',
  },
  {
    id: 5,
    title: 'Added New Task',
    description: 'Created task "Review Physics Lab notes"',
    time: 'Yesterday',
    icon: PlusCircle,
    color: 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/5',
  },
];

export default function ActivityTimeline() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between">
      
      {/* Background glow on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/10 to-transparent dark:via-indigo-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live timeline of your focus milestones
            </p>
          </div>
        </div>

        {/* Timeline body */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
          {RECENT_ACTIVITIES.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="relative group/item flex gap-4 transition-all duration-200">
                
                {/* Timeline node */}
                <div className={`absolute -left-[23px] top-0 rounded-full border border-white dark:border-slate-900 p-1.5 shadow-sm group-hover/item:scale-110 transition-transform duration-200 ${activity.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover/item:text-indigo-500 dark:group-hover/item:text-indigo-400 transition-colors duration-150">
                      {activity.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {activity.description}
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
