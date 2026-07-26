import React, { useState } from 'react';
import { Sparkles, Quote, RefreshCw } from 'lucide-react';

const QUOTES = [
  { text: "Focus is a muscle, and you are building it right now.", author: "FocusFlow AI" },
  { text: "Your mind is for having ideas, not holding them. Focus on the present.", author: "David Allen" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Deep work produces high quality results. Keep flowing!", author: "Cal Newport" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
];

export default function MotivationCard() {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);

  const handleNextQuote = () => {
    setAnimate(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
      setAnimate(false);
    }, 200);
  };

  const currentQuote = QUOTES[index];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-6 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between min-h-[190px]">
      
      {/* Background glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/10 to-transparent dark:via-rose-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Quote className="h-4.5 w-4.5 text-rose-500" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Daily Motivation
            </span>
          </div>
          <button 
            onClick={handleNextQuote}
            className="p-1.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-950 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-200 hover:rotate-180"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Quote content */}
        <div className="flex-1 flex flex-col justify-center">
          <p className={`text-sm md:text-base font-extrabold text-slate-800 dark:text-slate-200 tracking-tight leading-relaxed mb-2 transition-all duration-200 ${
            animate ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
          }`}>
            "{currentQuote.text}"
          </p>
          <span className={`text-xs text-slate-400 dark:text-slate-500 font-semibold tracking-wide transition-all duration-200 ${
            animate ? 'opacity-0' : 'opacity-100'
          }`}>
            — {currentQuote.author}
          </span>
        </div>
      </div>

    </div>
  );
}
