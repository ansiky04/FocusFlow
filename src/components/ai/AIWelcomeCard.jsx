import React, { useState, useEffect } from 'react';
import { Sparkles, Bot } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AIWelcomeCard() {
  const { user } = useApp();
  const [greeting, setGreeting] = useState('Welcome back');
  const [timeDetails, setTimeDetails] = useState('');
  const userName = user ? user.fullName : 'John Doe';

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('Good Morning');
      setTimeDetails('Start your day with a clear mind and focused goals.');
    } else if (hours < 18) {
      setGreeting('Good Afternoon');
      setTimeDetails('Maintain your momentum. You are doing great!');
    } else {
      setGreeting('Good Evening');
      setTimeDetails('Review your progress and wrap up your day with a calm reflection.');
    }
  }, []);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      
      {/* Background radial highlight on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/30 to-transparent dark:via-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      {/* Main Content */}
      <div className="relative z-10 flex items-start gap-4 flex-1">
        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3.5 text-white shadow-md transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300 flex-shrink-0">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-1.5">
            {greeting}, <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">{userName}</span>!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            {timeDetails} I'm here to optimize your focus, schedule customized pomodoros, and keep you motivated.
          </p>
        </div>
      </div>

      {/* AI Assistant Status */}
      <div className="relative z-10 flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 px-4 py-2 flex-shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          FocusFlow AI <span className="text-emerald-500 font-extrabold text-[10px]">ONLINE</span>
        </span>
      </div>

    </div>
  );
}
