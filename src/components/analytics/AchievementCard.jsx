import React from 'react';
import { Award, Flame, Star, BookOpen, Target } from 'lucide-react';

const ACHIEVEMENTS = [
  {
    id: 'first-session',
    title: 'First Focus Session',
    description: 'Completed your first 25-minute study sprint',
    icon: Award,
    gradient: 'from-amber-400 to-orange-500',
    glow: 'group-hover:shadow-amber-500/10 dark:group-hover:shadow-amber-500/5',
    unlocked: true,
  },
  {
    id: 'streak-5',
    title: '5-Day Streak',
    description: 'Maintained your focus streak for 5 consecutive days',
    icon: Flame,
    gradient: 'from-rose-500 to-orange-500',
    glow: 'group-hover:shadow-rose-500/10 dark:group-hover:shadow-rose-500/5',
    unlocked: true,
  },
  {
    id: 'prod-master',
    title: 'Productivity Master',
    description: 'Achieved a daily productivity score above 90%',
    icon: Star,
    gradient: 'from-indigo-400 to-purple-500',
    glow: 'group-hover:shadow-indigo-500/10 dark:group-hover:shadow-indigo-500/5',
    unlocked: true,
  },
  {
    id: 'study-champ',
    title: 'Study Champion',
    description: 'Logged a total of 50 focus sessions',
    icon: BookOpen,
    gradient: 'from-emerald-400 to-teal-500',
    glow: 'group-hover:shadow-emerald-500/10 dark:group-hover:shadow-emerald-500/5',
    unlocked: true,
  },
  {
    id: 'goal-achiever',
    title: 'Goal Achiever',
    description: 'Completed all your daily goals 3 days in a row',
    icon: Target,
    gradient: 'from-cyan-400 to-blue-500',
    glow: 'group-hover:shadow-cyan-500/10 dark:group-hover:shadow-cyan-500/5',
    unlocked: true,
  },
];

export default function AchievementCard() {
  return (
    <div className="group/main relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300">
      
      {/* Background glow on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/10 to-transparent dark:via-indigo-500/2 opacity-0 group-hover/main:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      <div className="relative z-10">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Milestones & Achievements
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Badges earned throughout your learning journey
        </p>

        {/* Badges list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {ACHIEVEMENTS.map((badge) => {
            const Icon = badge.icon;
            return (
              <div 
                key={badge.id}
                className={`group relative overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 p-4 flex flex-col items-center text-center hover:scale-[1.03] hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-lg ${badge.glow} transition-all duration-300`}
              >
                {/* Badge circle with background gradient glow */}
                <div className="relative mb-3">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${badge.gradient} opacity-20 blur-md group-hover:scale-120 transition-transform duration-300`} />
                  <div className={`relative rounded-full bg-gradient-to-br ${badge.gradient} p-3 text-white shadow-md shadow-slate-100 dark:shadow-none group-hover:rotate-12 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 leading-tight">
                  {badge.title}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
