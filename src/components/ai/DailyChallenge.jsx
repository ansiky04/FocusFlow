import React from 'react';
import { Trophy, CheckSquare, Award } from 'lucide-react';

const CHALLENGES = [
  {
    id: 1,
    task: 'Complete 4 Pomodoro Sessions',
    current: 4,
    target: 4,
    completed: true,
    points: 100,
  },
  {
    id: 2,
    task: 'Finish 3 Workspace Tasks',
    current: 2,
    target: 3,
    completed: false,
    points: 75,
  },
  {
    id: 3,
    task: 'Study for 2 Hours straight',
    current: 2,
    target: 2,
    completed: true,
    points: 120,
  },
];

export default function DailyChallenge() {
  const totalPointsEarned = CHALLENGES.filter(c => c.completed).reduce((acc, curr) => acc + curr.points, 0);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between">
      
      {/* Background glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/10 to-transparent dark:via-yellow-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      <div className="relative z-10 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-500 rounded-lg">
              <Trophy className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Focus Challenge
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete quests to unlock special badges
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-widest">Points</span>
            <span className="text-sm font-black text-yellow-600 dark:text-yellow-400">+{totalPointsEarned} pts</span>
          </div>
        </div>

        {/* Challenge check-list */}
        <div className="space-y-3.5">
          {CHALLENGES.map((challenge) => (
            <div 
              key={challenge.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                challenge.completed 
                  ? 'border-emerald-500/30 bg-emerald-500/5 dark:border-emerald-500/10 dark:bg-emerald-500/2' 
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Custom checkmark circle */}
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all duration-200 ${
                  challenge.completed 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-slate-300 dark:border-slate-700'
                }`}>
                  {challenge.completed && <CheckSquare className="h-3 w-3" />}
                </div>
                <div>
                  <h4 className={`text-xs md:text-sm font-bold leading-none mb-1.5 ${
                    challenge.completed ? 'text-slate-600 dark:text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {challenge.task}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/60 px-1.5 py-0.5 rounded">
                    Progress: {challenge.current}/{challenge.target}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Award className={`h-4 w-4 ${challenge.completed ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-600'}`} />
                <span className={`text-[10px] font-bold ${challenge.completed ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`}>
                  +{challenge.points} XP
                </span>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
