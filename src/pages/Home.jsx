import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  ClipboardList, 
  BarChart3, 
  Settings2, 
  ArrowRight,
  Clock, 
  CheckCircle2, 
  Flame, 
  TrendingUp,
  Plus
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { useApp } from '../context/AppContext';

export default function Home() {
  const { user, token } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      try {
        const response = await fetch('http://localhost:5000/api/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err.message);
      }
    };

    const fetchEvents = async () => {
      if (!token) return;
      try {
        const response = await fetch('http://localhost:5000/api/calendar', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.events) {
          // Sort events by date and startTime, filtering out past events
          const todayStr = new Date().toISOString().split('T')[0];
          const upcoming = data.events
            .filter(ev => {
              const evDateStr = new Date(ev.date).toISOString().split('T')[0];
              return evDateStr >= todayStr;
            })
            .sort((a, b) => {
              const dateDiff = new Date(a.date) - new Date(b.date);
              if (dateDiff !== 0) return dateDiff;
              return a.startTime.localeCompare(b.startTime);
            })
            .slice(0, 4);
          setEvents(upcoming);
        }
      } catch (err) {
        console.error('Error fetching dashboard calendar events:', err);
      }
    };

    fetchAnalytics();
    fetchEvents();
  }, [token]);

  // Store all dashboard data in one object
  const dashboardData = {
    userName: user ? user.fullName : 'John Doe',
    stats: [
      {
        title: 'Focus Time Today',
        value: analytics ? `${analytics.totalFocusHours.toFixed(1)} hours` : '0.0 hours',
        icon: Clock,
        gradient: 'from-orange-500 to-amber-500',
        trend: '+1.2h today',
        isPositiveTrend: true,
      },
      {
        title: 'Tasks Completed',
        value: analytics ? String(analytics.completedTasks) : '0',
        icon: CheckCircle2,
        gradient: 'from-emerald-500 to-teal-500',
        trend: 'Updated in real-time',
        isPositiveTrend: true,
      },
      {
        title: 'Current Streak',
        value: analytics ? `${analytics.currentStreak} days` : '0 days',
        icon: Flame,
        gradient: 'from-rose-500 to-orange-500',
        trend: 'No days missed',
        isPositiveTrend: true,
      },
      {
        title: 'Productivity Score',
        value: analytics ? `${analytics.productivityScore}%` : '0%',
        icon: TrendingUp,
        gradient: 'from-indigo-500 to-purple-500',
        trend: 'Peak efficiency',
        isPositiveTrend: true,
      },
    ],
  };

  const previewFeatures = [
    {
      title: 'Distraction-Free Timer',
      description: 'Pomodoro timer designed to keep you focused with ambient soundscapes and minimal UI.',
      icon: Play,
      color: 'from-orange-500 to-amber-500',
      path: '/timer',
    },
    {
      title: 'Task Matrix',
      description: 'Prioritize assignments using the Eisenhower matrix and check them off your list in flow state.',
      icon: ClipboardList,
      color: 'from-emerald-500 to-teal-500',
      path: '/tasks',
    },
    {
      title: 'Analytics & Insights',
      description: 'Understand your study patterns, peak focus hours, and weekly milestones visually.',
      icon: BarChart3,
      color: 'from-indigo-500 to-blue-500',
      path: '/analytics',
    },
    {
      title: 'Custom Workspaces',
      description: 'Personalize soundscapes, themes, blocking lists, and breaks to suit your learning styles.',
      icon: Settings2,
      color: 'from-purple-500 to-pink-500',
      path: '/settings',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10 transition-colors duration-300">
      
      {/* Hero Header */}
      <div className="max-w-4xl mb-10 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
          Unleash Your Potential with{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            FocusFlow
          </span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
          Welcome back, <span className="font-semibold text-slate-800 dark:text-slate-200">{dashboardData.userName}</span>. Here is your study overview for today. Get ready to dive into the flow zone.
        </p>
      </div>

      {/* Dashboard Stats Panel */}
      <section className="mb-12 max-w-5xl">
        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
          Performance Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardData.stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              gradient={stat.gradient}
              trend={stat.trend}
              isPositiveTrend={stat.isPositiveTrend}
            />
          ))}
        </div>
      </section>

      {/* Upcoming Schedule Section */}
      <section className="mb-12 max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Upcoming Study & Exam Schedule
          </h2>
          <Link
            to="/calendar"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center gap-1 transition-colors"
          >
            View Full Calendar <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 text-center flex flex-col items-center justify-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-full text-slate-400 dark:text-slate-500 mb-3">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">No Upcoming Events</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs">
              Your agenda is clean. Schedule study blocks, assignments, or exams to stay on track.
            </p>
            <Link
              to="/calendar"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:scale-102"
            >
              <Plus className="h-3.5 w-3.5" /> Schedule Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((ev) => {
              const isHigh = ev.priority === 'High';
              const isMedium = ev.priority === 'Medium';
              
              let catClasses = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400';
              let priorityBorder = 'border-slate-200 dark:border-slate-800';
              
              if (ev.category === 'Exam') {
                catClasses = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-450';
              } else if (ev.category === 'Assignment') {
                catClasses = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
              } else if (ev.category === 'Personal') {
                catClasses = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450';
              }
              
              if (isHigh) {
                priorityBorder = 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/10';
              } else if (isMedium) {
                priorityBorder = 'border-blue-200 dark:border-blue-900/40';
              }

              // Format date: UTC parsing safety
              const d = new Date(ev.date);
              const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

              return (
                <div
                  key={ev._id}
                  className={`bg-white dark:bg-slate-900/50 rounded-2xl p-5 border flex flex-col justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-200 ${priorityBorder}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide ${catClasses}`}>
                        {ev.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        {dateFormatted}
                      </span>
                    </div>
                    
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 truncate" title={ev.title}>
                      {ev.title}
                    </h3>
                    
                    {ev.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal line-clamp-2 mb-4">
                        {ev.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-auto">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-indigo-500" />
                      {ev.startTime} - {ev.endTime}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      ev.priority === 'High' 
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-450' 
                        : ev.priority === 'Medium' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' 
                          : 'bg-slate-150 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {ev.priority}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Features Preview Section */}
      <section className="max-w-5xl mb-12">
        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
          Explore FocusFlow Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {previewFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <Link
                key={feat.title}
                to={feat.path}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer block"
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-xl bg-gradient-to-br ${feat.color} p-3 text-white shadow-md transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-slate-100 mb-2 group-hover:text-indigo-500 transition-colors duration-200">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      {feat.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
                      Open Module <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Environment Status Banner */}
      <div className="max-w-5xl rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/5 blur-3xl transform translate-x-10 -translate-y-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold mb-1">Environment Setup Successful</h2>
            <p className="text-sm text-indigo-100 max-w-xl">
              Vite, React, Tailwind CSS v3, React Router, and Lucide React are configured and ready. Start adding your feature modules!
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-md hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all duration-150">
            Open Timer docs
          </button>
        </div>
      </div>

    </div>
  );
}
