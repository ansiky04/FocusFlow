import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ClipboardList, BarChart3, Home, Zap } from 'lucide-react';

import AIWelcomeCard from '../components/ai/AIWelcomeCard';
import AIStudyPlanner from '../components/ai/AIStudyPlanner';
import AIChat from '../components/ai/AIChat';
import MotivationCard from '../components/ai/MotivationCard';
import ProductivityTips from '../components/ai/ProductivityTips';
import StudyInsights from '../components/ai/StudyInsights';
import GoalTracker from '../components/ai/GoalTracker';
import DailyChallenge from '../components/ai/DailyChallenge';

export default function AIAssistant() {
  const quickActions = [
    {
      title: 'Start Focus Session',
      path: '/timer',
      icon: Play,
      color: 'from-orange-500 to-amber-500',
    },
    {
      title: 'Open Task Manager',
      path: '/tasks',
      icon: ClipboardList,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'View Analytics',
      path: '/analytics',
      icon: BarChart3,
      color: 'from-indigo-500 to-blue-500',
    },
    {
      title: 'View Dashboard',
      path: '/',
      icon: Home,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10 transition-colors duration-300">
      
      {/* Header */}
      <div className="max-w-6xl mb-8 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
          AI Study{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Assistant
          </span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
          Meet your personal AI copilot. Plan schedules, get tailored productivity recommendations, and chat with the assistant.
        </p>
      </div>

      <div className="max-w-7xl space-y-6">
        
        {/* Welcome Section */}
        <section>
          <AIWelcomeCard />
        </section>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Chat interface */}
            <AIChat />
            
            {/* AI Custom Study Planner */}
            <AIStudyPlanner />

            {/* Study insights mapping */}
            <StudyInsights />
          </div>

          {/* Sidebar Widgets Column (1 col) */}
          <div className="space-y-6">
            
            {/* Quick Actions Shortcuts Panel */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300">
              <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/10 to-transparent dark:via-indigo-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
              
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="h-4.5 w-4.5 text-indigo-500" />
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={index}
                      to={action.path}
                      className="group/btn relative overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 p-3 flex flex-col items-center justify-center text-center hover:scale-[1.02] hover:border-indigo-500/20 transition-all duration-200"
                    >
                      <div className={`rounded-lg bg-gradient-to-br ${action.color} p-2 text-white shadow-sm mb-2 group-hover/btn:scale-110 group-hover/btn:rotate-3 duration-300`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 group-hover/btn:text-indigo-500 dark:group-hover/btn:text-indigo-400 transition-colors">
                        {action.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Target and Goals tracking */}
            <GoalTracker />

            {/* Daily quests and points tracker */}
            <DailyChallenge />

            {/* Quote of the day cycler */}
            <MotivationCard />

            {/* Productivity guidelines */}
            <ProductivityTips />

          </div>

        </div>

      </div>
    </div>
  );
}
