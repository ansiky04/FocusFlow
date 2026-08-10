import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Plus, 
  Clock, 
  CheckCircle2, 
  ClipboardList, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Check,
  Trash2,
  Flame,
  Target,
  FileText,
  ListTodo,
  AlertCircle
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { useApp } from '../context/AppContext';

export default function Home() {
  const { user, token } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Habits State (Local persistence by date)
  const [habits, setHabits] = useState(() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`focusflow_habits_${todayStr}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'h1', title: 'Wake up early', completed: false },
      { id: 'h2', title: 'Study 2 Hours', completed: false },
      { id: 'h3', title: 'Drink Water', completed: false },
      { id: 'h4', title: 'Exercise', completed: false },
      { id: 'h5', title: 'Revision', completed: false },
    ];
  });

  // Quick Notes State
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('focusflow_quick_notes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

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

    const fetchTasks = async () => {
      if (!token) return;
      try {
        const response = await fetch('http://localhost:5000/api/tasks', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.tasks) {
          setTasks(data.tasks);
        }
      } catch (err) {
        console.error('Error fetching dashboard tasks:', err);
      }
    };

    fetchAnalytics();
    fetchEvents();
    fetchTasks();
  }, [token]);

  const handleToggleTask = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: nextStatus } : t));
    if (!token) return;
    try {
      await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const toggleHabit = (id) => {
    const updated = habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h);
    setHabits(updated);
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      localStorage.setItem(`focusflow_habits_${todayStr}`, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSaveNote = (e) => {
    e?.preventDefault();
    if (!newNoteText.trim()) return;
    const updated = [
      { 
        id: Date.now().toString(), 
        text: newNoteText.trim(), 
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
      },
      ...notes
    ];
    setNotes(updated);
    try {
      localStorage.setItem('focusflow_quick_notes', JSON.stringify(updated));
    } catch (e) {}
    setNewNoteText('');
    setIsAddingNote(false);
  };

  const handleDeleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    try {
      localStorage.setItem('focusflow_quick_notes', JSON.stringify(updated));
    } catch (e) {}
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user?.fullName ? user.fullName.split(' ')[0] : 'Ansik';
  const pendingTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const pendingTasksCount = pendingTasks.length;
  const completedTasksCount = analytics?.completedTasks ?? completedTasks.length;

  // Stat cards definition
  const stats = [
    {
      title: 'Focus Time Today',
      value: analytics ? `${analytics.totalFocusHours.toFixed(1)}h` : '0.0h',
      icon: Clock,
      trend: analytics?.totalFocusHours > 0 ? '+1.2h today' : null,
      isPositiveTrend: true,
    },
    {
      title: 'Tasks Completed',
      value: String(completedTasksCount),
      icon: CheckCircle2,
      trend: completedTasksCount > 0 ? 'Updated' : null,
      isPositiveTrend: true,
    },
    {
      title: 'Pending Tasks',
      value: String(pendingTasksCount),
      icon: ClipboardList,
      trend: pendingTasksCount > 0 ? `${pendingTasksCount} to do` : 'All caught up',
      isPositiveTrend: pendingTasksCount === 0,
    },
    {
      title: 'Productivity Score',
      value: analytics ? `${analytics.productivityScore}%` : '0%',
      icon: TrendingUp,
      trend: analytics?.productivityScore > 0 ? 'Score' : null,
      isPositiveTrend: true,
    },
  ];

  // Weekly metrics calculations
  const weeklyHours = analytics?.weeklyData 
    ? analytics.weeklyData.reduce((acc, d) => acc + (d.hours || 0), 0)
    : (analytics?.totalFocusHours || 0);
  const weeklyTarget = 20; // 20 hours target
  const weeklyHoursPct = Math.min(100, Math.round((weeklyHours / weeklyTarget) * 100));

  const totalTasksCount = tasks.length;
  const weeklyCompletionPct = totalTasksCount > 0 
    ? Math.round((completedTasks.length / totalTasksCount) * 100) 
    : (analytics?.productivityScore || 0);

  const streakDays = analytics?.currentStreak || 0;
  const streakPct = Math.min(100, Math.round((streakDays / 7) * 100));
  const goalProgressPct = analytics?.productivityScore || 0;

  const completedHabitsCount = habits.filter(h => h.completed).length;

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Compact Hero Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {getGreeting()}, {userName} 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Stay focused and make today productive.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/timer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-[14px] shadow-sm hover:shadow transition-all duration-150"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Start Focus Session</span>
            </Link>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-[14px] shadow-sm hover:shadow transition-all duration-150"
            >
              <Plus className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              <span>Add Task</span>
            </Link>
          </div>
        </div>

        {/* 4 Equal Statistic Cards */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
                isPositiveTrend={stat.isPositiveTrend}
              />
            ))}
          </div>
        </section>

        {/* Today's Schedule */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Today's Schedule
            </h2>
            <Link
              to="/calendar"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center gap-1 transition-colors"
            >
              View Full Calendar <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm text-center text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
              <span>📅</span> No events scheduled today
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {events.map((ev) => {
                const isHigh = ev.priority === 'High';
                const isMedium = ev.priority === 'Medium';
                
                let catClasses = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300';
                if (ev.category === 'Exam') {
                  catClasses = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300';
                } else if (ev.category === 'Assignment') {
                  catClasses = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300';
                } else if (ev.category === 'Personal') {
                  catClasses = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300';
                }

                const d = new Date(ev.date);
                const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

                return (
                  <div
                    key={ev._id}
                    className="bg-white dark:bg-slate-900 rounded-[14px] p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow transition-shadow flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${catClasses}`}>
                          {ev.category}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          {dateFormatted}
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={ev.title}>
                        {ev.title}
                      </h3>
                      
                      {ev.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                          {ev.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5 mt-auto text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="h-3.5 w-3.5 text-indigo-500" />
                        {ev.startTime} - {ev.endTime}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        isHigh 
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400' 
                          : isMedium 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
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

        {/* Dashboard 2-Column Grid: Today's Tasks, Habit Tracker, Weekly Progress, Quick Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* SECTION 1: Today's Tasks */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Today's Tasks
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {pendingTasksCount} pending · {completedTasks.length} done
                  </span>
                  <Link
                    to="/tasks"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center gap-0.5 transition-colors ml-1"
                  >
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {tasks.length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No tasks for today.</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 mb-3">All clear! Add a task to start tracking.</p>
                  <Link
                    to="/tasks"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-[10px] shadow-sm transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Task
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tasks.slice(0, 4).map((t) => {
                    const isDone = t.status === 'Completed';
                    const priorityLower = (t.priority || 'medium').toLowerCase();
                    const isHigh = priorityLower === 'high';
                    const isLow = priorityLower === 'low';

                    const todayStr = new Date().toISOString().split('T')[0];
                    const isDueToday = t.dueDate ? t.dueDate.startsWith(todayStr) : false;

                    return (
                      <div
                        key={t._id}
                        onClick={() => handleToggleTask(t)}
                        className={`flex items-center justify-between p-2.5 rounded-[10px] border transition-all cursor-pointer ${
                          isDone
                            ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-65'
                            : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            className={`h-4 w-4 rounded-[5px] border flex items-center justify-center flex-shrink-0 transition-colors ${
                              isDone
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                            }`}
                          >
                            {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                          </button>
                          <span
                            className={`text-xs font-medium truncate ${
                              isDone
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-100'
                            }`}
                            title={t.title}
                          >
                            {t.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          {isDueToday && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                              Due Today
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              isHigh
                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                                : isLow
                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                            }`}
                          >
                            {t.priority || 'Medium'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {tasks.length > 4 && (
              <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  to="/tasks"
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  + {tasks.length - 4} more tasks
                </Link>
              </div>
            )}
          </div>

          {/* SECTION 2: Habit Tracker */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Habit Tracker
                  </h2>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {completedHabitsCount} of {habits.length} completed
                </span>
              </div>

              {/* Habit Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${habits.length > 0 ? (completedHabitsCount / habits.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Habits List */}
              <div className="space-y-2">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`flex items-center justify-between p-2.5 rounded-[10px] border transition-all cursor-pointer ${
                      habit.completed
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-900/40'
                        : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className={`h-4 w-4 rounded-[5px] border flex items-center justify-center flex-shrink-0 transition-colors ${
                          habit.completed
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                        }`}
                      >
                        {habit.completed && <Check className="h-3 w-3 stroke-[3]" />}
                      </button>
                      <span className={`text-xs font-medium ${
                        habit.completed 
                          ? 'text-slate-500 dark:text-slate-400 line-through' 
                          : 'text-slate-800 dark:text-slate-100'
                      }`}>
                        {habit.title}
                      </span>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      habit.completed
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {habit.completed ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 text-right">
              Resets daily at midnight
            </p>
          </div>

          {/* SECTION 3: Weekly Progress */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Weekly Progress
                </h2>
              </div>
              <Link
                to="/analytics"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center gap-0.5 transition-colors"
              >
                Analytics <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {/* Weekly Study Hours */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Weekly Study Hours</span>
                  <span className="font-bold text-slate-900 dark:text-white">{weeklyHours.toFixed(1)}h / {weeklyTarget}h</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${weeklyHoursPct}%` }}
                  />
                </div>
              </div>

              {/* Weekly Completion % */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Task Completion Rate</span>
                  <span className="font-bold text-slate-900 dark:text-white">{weeklyCompletionPct}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${weeklyCompletionPct}%` }}
                  />
                </div>
              </div>

              {/* Current Streak */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Current Streak</span>
                  <span className="font-bold text-slate-900 dark:text-white">{streakDays} / 7 days</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${streakPct}%` }}
                  />
                </div>
              </div>

              {/* Goal Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Overall Goal Progress</span>
                  <span className="font-bold text-slate-900 dark:text-white">{goalProgressPct}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${goalProgressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Quick Notes */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Quick Notes
                  </h2>
                </div>
                {!isAddingNote && (
                  <button
                    onClick={() => setIsAddingNote(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Note
                  </button>
                )}
              </div>

              {/* Add Note Form */}
              {isAddingNote && (
                <form onSubmit={handleSaveNote} className="mb-3.5 space-y-2">
                  <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Type a quick study reminder or formula..."
                    rows={2}
                    autoFocus
                    className="w-full text-xs p-2.5 rounded-[10px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNote(false);
                        setNewNoteText('');
                      }}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-[8px] shadow-sm transition-all"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              {/* Notes List or Empty State */}
              {notes.length === 0 && !isAddingNote ? (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 mb-2">
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No notes yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 mb-3">Jot down formulas, ideas, or quick reminders.</p>
                  <button
                    onClick={() => setIsAddingNote(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-[10px] shadow-sm transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Note
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                  {notes.map((n) => (
                    <div
                      key={n.id}
                      className="group flex items-start justify-between p-2.5 rounded-[10px] border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
                          {n.text}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 inline-block">
                          {n.date}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                        title="Delete note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notes.length > 0 && !isAddingNote && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 text-right">
                {notes.length} note{notes.length > 1 ? 's' : ''} saved locally
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}


