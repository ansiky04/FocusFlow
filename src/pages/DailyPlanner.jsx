import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sun,
  SunMedium,
  Sunset,
  Moon,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  MoreVertical,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  CloudSun,
  CloudRain,
  Wind,
  Droplets,
  BookOpen,
  Code,
  Dumbbell,
  Brain,
  FileText,
  CheckSquare,
  AlertCircle,
  GripVertical,
  Target,
  ArrowRight,
  RefreshCw,
  Quote,
  StickyNote,
  ListTodo,
  Check,
  X,
  Layers,
  Award,
  Zap,
  Tag,
  Link2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Curated motivational quotes for students
const MOTIVATIONAL_QUOTES = [
  { quote: "Focus is a muscle. The more you practice single-tasking, the stronger your flow state becomes.", author: "Cal Newport" },
  { quote: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.", author: "John C. Maxwell" },
  { quote: "You don't have to be extreme, just consistent. Progress is progress, no matter how small.", author: "Anonymous" },
  { quote: "The secret of getting ahead is getting started. Break complex tasks into small manageable chunks.", author: "Mark Twain" },
  { quote: "Deep work is the ability to focus without distraction on a cognitively demanding task.", author: "Cal Newport" },
  { quote: "Action is the foundational key to all success. Start where you are, use what you have.", author: "Arthur Ashe" }
];

// Time Blocks configuration
const TIME_BLOCKS = [
  {
    id: 'morning',
    name: 'Morning',
    timeRange: '06:00 AM – 12:00 PM',
    icon: SunMedium,
    color: 'amber',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60',
    headerBg: 'from-amber-500/10 to-orange-500/5 dark:from-amber-500/15 dark:to-orange-500/5',
    accentBorder: 'border-amber-200 dark:border-amber-800/80',
    accentText: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'afternoon',
    name: 'Afternoon',
    timeRange: '12:00 PM – 05:00 PM',
    icon: Sun,
    color: 'sky',
    badgeClass: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900/60',
    headerBg: 'from-sky-500/10 to-indigo-500/5 dark:from-sky-500/15 dark:to-indigo-500/5',
    accentBorder: 'border-sky-200 dark:border-sky-800/80',
    accentText: 'text-sky-600 dark:text-sky-400'
  },
  {
    id: 'evening',
    name: 'Evening',
    timeRange: '05:00 PM – 09:00 PM',
    icon: Sunset,
    color: 'indigo',
    badgeClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60',
    headerBg: 'from-indigo-500/10 to-purple-500/5 dark:from-indigo-500/15 dark:to-purple-500/5',
    accentBorder: 'border-indigo-200 dark:border-indigo-800/80',
    accentText: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    id: 'night',
    name: 'Night',
    timeRange: '09:00 PM – 00:00 AM+',
    icon: Moon,
    color: 'purple',
    badgeClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/60',
    headerBg: 'from-purple-500/10 to-slate-500/5 dark:from-purple-500/15 dark:to-slate-500/5',
    accentBorder: 'border-purple-200 dark:border-purple-800/80',
    accentText: 'text-purple-600 dark:text-purple-400'
  }
];

const CATEGORIES = [
  { id: 'Study', label: 'Study & Review', icon: BookOpen, color: 'indigo' },
  { id: 'Coding', label: 'Coding / Lab', icon: Code, color: 'emerald' },
  { id: 'Assignment', label: 'Assignment', icon: FileText, color: 'rose' },
  { id: 'Health', label: 'Health & Fitness', icon: Dumbbell, color: 'teal' },
  { id: 'Personal', label: 'Personal & Rest', icon: Brain, color: 'purple' },
  { id: 'Revision', label: 'Revision', icon: Target, color: 'amber' }
];

const PRIORITY_LEVELS = [
  { id: 'High', label: 'High Priority', badgeClass: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900' },
  { id: 'Medium', label: 'Medium Priority', badgeClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900' },
  { id: 'Low', label: 'Low Priority', badgeClass: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' }
];

const DEFAULT_PLANNER_TASKS = [
  {
    id: 'plan_1',
    title: 'Review Data Structures & Tree Algorithms',
    time: '08:30 AM',
    timeBlock: 'morning',
    priority: 'High',
    duration: 90, // minutes
    category: 'Study',
    completed: true,
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'plan_2',
    title: 'Operating Systems Assignment - Memory Virtualization',
    time: '10:30 AM',
    timeBlock: 'morning',
    priority: 'Medium',
    duration: 60,
    category: 'Assignment',
    completed: true,
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'plan_3',
    title: 'React State Management & Vite Frontend Build',
    time: '02:00 PM',
    timeBlock: 'afternoon',
    priority: 'High',
    duration: 120,
    category: 'Coding',
    completed: false,
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'plan_4',
    title: 'Gym Session & Cardio Workout',
    time: '05:30 PM',
    timeBlock: 'evening',
    priority: 'Medium',
    duration: 60,
    category: 'Health',
    completed: false,
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'plan_5',
    title: 'Read 20 Pages - Clean Architecture Book',
    time: '09:30 PM',
    timeBlock: 'night',
    priority: 'Low',
    duration: 30,
    category: 'Revision',
    completed: false,
    date: new Date().toISOString().split('T')[0]
  }
];

const DEFAULT_GOALS = [
  { id: 'goal_1', title: 'Complete Module 4 DSA Revision', completed: true },
  { id: 'goal_2', title: 'Finish OS Lab Simulation Assignment', completed: false },
  { id: 'goal_3', title: 'Maintain 4.5+ Hours of Deep Study Time', completed: false }
];

export default function DailyPlanner() {
  const { user } = useApp();
  const userStorageKey = user?.id || 'default_user';

  // Selected calendar day
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Motivational quote state (rotate on button or daily)
  const [quoteIndex, setQuoteIndex] = useState(() => {
    const day = new Date().getDate();
    return day % MOTIVATIONAL_QUOTES.length;
  });

  // LocalStorage tasks
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(`focusflow_daily_planner_v1_${userStorageKey}`);
      return saved ? JSON.parse(saved) : DEFAULT_PLANNER_TASKS;
    } catch {
      return DEFAULT_PLANNER_TASKS;
    }
  });

  // LocalStorage goals
  const [todayGoals, setTodayGoals] = useState(() => {
    try {
      const saved = localStorage.getItem(`focusflow_daily_goals_v1_${userStorageKey}`);
      return saved ? JSON.parse(saved) : DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  });

  // Notes state
  const [dailyNotes, setDailyNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(`focusflow_daily_notes_${userStorageKey}_${selectedDate}`);
      return saved || '• Completed binary search and recursion practice.\n• Review OS virtual memory paging tomorrow morning.\n• Prepare lab presentation notes.';
    } catch {
      return '';
    }
  });

  const [quickNotes, setQuickNotes] = useState(() => {
    try {
      return localStorage.getItem(`focusflow_quick_notes_${userStorageKey}`) || 'https://leetcode.com/problemset/all/\nMeeting with study group at 4:00 PM on Discord.';
    } catch {
      return '';
    }
  });

  const [tomorrowPlan, setTomorrowPlan] = useState(() => {
    try {
      return localStorage.getItem(`focusflow_tomorrow_plan_${userStorageKey}`) || '1. Database Normalization & SQL Queries\n2. Graph BFS / DFS traversal practice\n3. Review Chemistry Lab Report';
    } catch {
      return '';
    }
  });

  // Modal State for Adding / Editing Tasks
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [targetBlockForNewTask, setTargetBlockForNewTask] = useState('morning');

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState('09:00 AM');
  const [formTimeBlock, setFormTimeBlock] = useState('morning');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formDuration, setFormDuration] = useState(60);
  const [formCategory, setFormCategory] = useState('Study');
  const [formLinkedHabitId, setFormLinkedHabitId] = useState('');
  const [formError, setFormError] = useState('');

  // Active Habits for linking selector
  const [plannerHabits, setPlannerHabits] = useState([]);

  useEffect(() => {
    try {
      const savedHabits = localStorage.getItem(`focusflow_habits_v4_${userStorageKey}`);
      if (savedHabits) {
        const parsed = JSON.parse(savedHabits);
        if (Array.isArray(parsed)) {
          setPlannerHabits(parsed.filter(h => !h.isArchived));
        }
      }
    } catch {}
  }, [userStorageKey, isModalOpen]);

  // New Goal Input
  const [newGoalText, setNewGoalText] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverBlock, setDragOverBlock] = useState(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(`focusflow_daily_planner_v1_${userStorageKey}`, JSON.stringify(tasks));
  }, [tasks, userStorageKey]);

  useEffect(() => {
    localStorage.setItem(`focusflow_daily_goals_v1_${userStorageKey}`, JSON.stringify(todayGoals));
  }, [todayGoals, userStorageKey]);

  useEffect(() => {
    localStorage.setItem(`focusflow_daily_notes_${userStorageKey}_${selectedDate}`, dailyNotes);
  }, [dailyNotes, userStorageKey, selectedDate]);

  useEffect(() => {
    localStorage.setItem(`focusflow_quick_notes_${userStorageKey}`, quickNotes);
  }, [quickNotes, userStorageKey]);

  useEffect(() => {
    localStorage.setItem(`focusflow_tomorrow_plan_${userStorageKey}`, tomorrowPlan);
  }, [tomorrowPlan, userStorageKey]);

  // Date formatted display
  const dateDisplay = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, [selectedDate]);

  const isToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return selectedDate === todayStr;
  }, [selectedDate]);

  // Shift date helper
  const changeDateBy = (offset) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Filter tasks for the selected date
  const dayTasks = useMemo(() => {
    return tasks.filter(t => t.date === selectedDate);
  }, [tasks, selectedDate]);

  // Group tasks by timeBlock
  const tasksByBlock = useMemo(() => {
    const grouped = {
      morning: [],
      afternoon: [],
      evening: [],
      night: []
    };
    dayTasks.forEach(task => {
      if (grouped[task.timeBlock]) {
        grouped[task.timeBlock].push(task);
      } else {
        grouped.morning.push(task);
      }
    });
    return grouped;
  }, [dayTasks]);

  // Productivity and Right Panel Statistics
  const stats = useMemo(() => {
    const total = dayTasks.length;
    const completed = dayTasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    // Total planned duration (minutes)
    const totalStudyMins = dayTasks.reduce((acc, t) => acc + (Number(t.duration) || 0), 0);
    const completedMins = dayTasks.filter(t => t.completed).reduce((acc, t) => acc + (Number(t.duration) || 0), 0);
    const remainingMins = Math.max(0, totalStudyMins - completedMins);

    // Dynamic Focus Score (0 - 100)
    let score = 0;
    if (total > 0) {
      const taskRatio = completed / total;
      const timeRatio = totalStudyMins > 0 ? (completedMins / totalStudyMins) : 0;
      score = Math.round((taskRatio * 0.6 + timeRatio * 0.4) * 100);
    } else {
      score = 0;
    }

    const formatMins = (m) => {
      const hrs = Math.floor(m / 60);
      const mins = m % 60;
      if (hrs === 0) return `${mins}m`;
      if (mins === 0) return `${hrs}h`;
      return `${hrs}h ${mins}m`;
    };

    return {
      total,
      completed,
      pending,
      focusScore: score,
      totalStudyTimeFormatted: formatMins(totalStudyMins),
      remainingTimeFormatted: formatMins(remainingMins),
      completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [dayTasks]);

  // Toggle Task Completion and Sync with Habit Tracker if linked
  const handleToggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const nextCompleted = !task.completed;

    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: nextCompleted } : t
    ));

    // If task is linked to a habit, synchronize today's habit log in localStorage
    if (task.linkedHabitId) {
      try {
        const habitLogsKey = `focusflow_habit_logs_v4_${userStorageKey}`;
        const savedLogs = localStorage.getItem(habitLogsKey);
        let logsObj = savedLogs ? JSON.parse(savedLogs) : {};
        const logKey = `${task.linkedHabitId}_${task.date}`;

        if (nextCompleted) {
          logsObj[logKey] = { completed: true, value: 1 };
        } else {
          delete logsObj[logKey];
        }

        localStorage.setItem(habitLogsKey, JSON.stringify(logsObj));
      } catch (err) {
        console.warn('Error syncing planner task to habit log:', err);
      }
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e, blockId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverBlock !== blockId) {
      setDragOverBlock(blockId);
    }
  };

  const handleDragLeave = (e, blockId) => {
    if (dragOverBlock === blockId) {
      setDragOverBlock(null);
    }
  };

  const handleDrop = (e, targetBlockId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, timeBlock: targetBlockId } : t
      ));
    }
    setDraggedTaskId(null);
    setDragOverBlock(null);
  };

  // Open Create Modal for specific section
  const openCreateModalForBlock = (blockId) => {
    setEditingTaskId(null);
    setFormTitle('');
    setFormTime(blockId === 'morning' ? '09:00 AM' : blockId === 'afternoon' ? '02:00 PM' : blockId === 'evening' ? '06:00 PM' : '09:30 PM');
    setFormTimeBlock(blockId);
    setFormPriority('Medium');
    setFormDuration(60);
    setFormCategory('Study');
    setFormLinkedHabitId('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (task) => {
    setEditingTaskId(task.id);
    setFormTitle(task.title);
    setFormTime(task.time || '09:00 AM');
    setFormTimeBlock(task.timeBlock || 'morning');
    setFormPriority(task.priority || 'Medium');
    setFormDuration(task.duration || 60);
    setFormCategory(task.category || 'Study');
    setFormLinkedHabitId(task.linkedHabitId || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Save Task (Create or Edit)
  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please provide a task title.');
      return;
    }

    const matchedHabit = plannerHabits.find(h => h.id === formLinkedHabitId);

    const payload = {
      title: formTitle.trim(),
      time: formTime.trim(),
      timeBlock: formTimeBlock,
      priority: formPriority,
      duration: Number(formDuration) || 30,
      category: formCategory,
      linkedHabitId: formLinkedHabitId || undefined,
      relatedHabitTitle: matchedHabit ? matchedHabit.name : undefined,
      date: selectedDate
    };

    if (editingTaskId) {
      setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, ...payload } : t));
    } else {
      const newTask = {
        id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        ...payload,
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTasks(prev => [...prev, newTask]);
    }

    setIsModalOpen(false);
  };

  // Delete Task
  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Add Today's Goal
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newGoal = {
      id: `goal_${Date.now()}`,
      title: newGoalText.trim(),
      completed: false
    };
    setTodayGoals(prev => [...prev, newGoal]);
    setNewGoalText('');
    setIsAddingGoal(false);
  };

  // Toggle Goal
  const handleToggleGoal = (goalId) => {
    setTodayGoals(prev => prev.map(g => 
      g.id === goalId ? { ...g, completed: !g.completed } : g
    ));
  };

  // Delete Goal
  const handleDeleteGoal = (goalId) => {
    setTodayGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex];

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 transition-colors duration-300 relative min-h-full">
      <div className="max-w-7xl mx-auto space-y-6 pb-20">

        {/* TOP SECTION: DATE NAVIGATOR, MOTIVATIONAL QUOTE, FOCUS SCORE & WEATHER WIDGET */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Date Navigator */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-xs">
                <button
                  onClick={() => changeDateBy(-1)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Previous Day"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 px-2">
                  <CalendarIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white min-w-[180px] text-center">
                    {dateDisplay}
                  </span>
                </div>
                <button
                  onClick={() => changeDateBy(1)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Next Day"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {!isToday && (
                <button
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  Jump to Today
                </button>
              )}
            </div>

            {/* Quick Action: + Plan Task */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => openCreateModalForBlock('morning')}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold px-4 py-2 shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>+ Plan Task</span>
              </button>
            </div>

          </div>

          {/* Grid of Top Insight Widgets: Quote, Focus Score, Weather */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            
            {/* 1. Motivational Quote Widget (Col 6) */}
            <div className="md:col-span-6 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 flex items-start gap-3.5 relative group">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shrink-0">
                <Quote className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{currentQuote.quote}"
                </p>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
                  — {currentQuote.author}
                </span>
              </div>
              <button
                onClick={() => setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors opacity-60 group-hover:opacity-100 cursor-pointer"
                title="Next Quote"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* 2. Focus Score Widget (Col 3) */}
            <div className="md:col-span-3 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" /> Focus Score
                </span>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {stats.focusScore}<span className="text-xs font-normal text-slate-400">/100</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  {stats.completed} of {stats.total} planned items done
                </span>
              </div>

              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-600 dark:text-indigo-400 transition-all duration-700 ease-out"
                    strokeDasharray={`${stats.focusScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-slate-800 dark:text-slate-200">
                  {stats.focusScore}%
                </span>
              </div>
            </div>

            {/* 3. Weather Placeholder Widget (Col 3) */}
            <div className="md:col-span-3 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <CloudSun className="h-3 w-3 text-sky-500" /> Today's Forecast
                </span>
                <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  24°C <span className="text-xs font-semibold text-slate-500">Sunny & Clear</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-0.5"><Droplets className="h-2.5 w-2.5" /> 45%</span>
                  <span className="flex items-center gap-0.5"><Wind className="h-2.5 w-2.5" /> 12 km/h</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40">
                <CloudSun className="h-6 w-6" />
              </div>
            </div>

          </div>

        </div>

        {/* MAIN WORKSPACE GRID: TIME BLOCKS (COL 8) + RIGHT METRICS PANEL (COL 4) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 4-SECTION TIME BLOCKS (COL 8) */}
          <div className="xl:col-span-8 space-y-4">
            
            {TIME_BLOCKS.map((block) => {
              const BlockIcon = block.icon;
              const blockTasks = tasksByBlock[block.id] || [];
              const isOver = dragOverBlock === block.id;

              return (
                <div
                  key={block.id}
                  onDragOver={(e) => handleDragOver(e, block.id)}
                  onDragLeave={(e) => handleDragLeave(e, block.id)}
                  onDrop={(e) => handleDrop(e, block.id)}
                  className={`bg-white dark:bg-slate-900 border rounded-[14px] shadow-sm transition-all duration-200 overflow-hidden ${
                    isOver
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {/* Block Header */}
                  <div className={`px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r ${block.headerBg}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg border ${block.badgeClass}`}>
                        <BlockIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            {block.name}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono font-medium">
                            {block.timeRange}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700/80">
                        {blockTasks.length} {blockTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                      <button
                        onClick={() => openCreateModalForBlock(block.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={`Add task to ${block.name}`}
                      >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* Tasks List inside Block */}
                  <div className="p-3 space-y-2 min-h-[70px]">
                    {blockTasks.length === 0 ? (
                      <div className="py-4 text-center border-2 border-dashed border-slate-100 dark:border-slate-800/80 rounded-xl">
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          Drag tasks here or click <button onClick={() => openCreateModalForBlock(block.id)} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer">+ Add</button> to schedule.
                        </p>
                      </div>
                    ) : (
                      blockTasks.map((task) => {
                        const priorityInfo = PRIORITY_LEVELS.find(p => p.id === task.priority) || PRIORITY_LEVELS[1];
                        const categoryInfo = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[0];
                        const CatIcon = categoryInfo.icon;

                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 group cursor-grab active:cursor-grabbing ${
                              task.completed
                                ? 'bg-slate-50/60 dark:bg-slate-850/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                                : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-900/60 shadow-xs'
                            }`}
                          >
                            {/* Drag Grip & Checkbox */}
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 cursor-grab shrink-0">
                                <GripVertical className="h-4 w-4" />
                              </div>

                              <button
                                onClick={() => handleToggleTask(task.id)}
                                className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                  task.completed
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 text-transparent'
                                }`}
                              >
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className={`text-xs font-bold text-slate-900 dark:text-white block truncate ${
                                    task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                                  }`}>
                                    {task.title}
                                  </span>
                                  {(task.linkedHabitId || task.relatedHabitTitle) && (
                                    <span 
                                      className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 shrink-0"
                                      title={task.relatedHabitTitle ? `Linked Habit: ${task.relatedHabitTitle}` : "Linked with Habit Tracker"}
                                    >
                                      <Link2 className="h-2.5 w-2.5" />
                                      {task.relatedHabitTitle ? `Habit: ${task.relatedHabitTitle}` : 'Habit'}
                                    </span>
                                  )}
                                </div>

                                {/* Metadata Chips: Time, Duration, Category, Priority */}
                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-1">
                                  <span className="flex items-center gap-1 font-mono font-medium text-slate-600 dark:text-slate-300">
                                    <Clock className="h-3 w-3 text-indigo-500" />
                                    {task.time}
                                  </span>
                                  <span>•</span>
                                  <span className="font-medium text-slate-500">
                                    {task.duration} mins
                                  </span>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                                    <CatIcon className="h-2.5 w-2.5" />
                                    {task.category}
                                  </span>
                                  <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${priorityInfo.badgeClass}`}>
                                    {task.priority}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions: Edit, Move Timeblock, Delete */}
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <select
                                value={task.timeBlock}
                                onChange={(e) => {
                                  const target = e.target.value;
                                  setTasks(prev => prev.map(t => t.id === task.id ? { ...t, timeBlock: target } : t));
                                }}
                                className="text-[10px] font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-1.5 py-0.5 text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
                                title="Move to another time block"
                              >
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                                <option value="night">Night</option>
                              </select>

                              <button
                                onClick={() => openEditModal(task)}
                                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                title="Edit Task"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Delete Task"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}

          </div>

          {/* RIGHT SIDE PANEL: GOALS & METRICS (COL 4) */}
          <div className="xl:col-span-4 space-y-4">
            
            {/* CARD 1: TODAY'S KEY GOALS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Today's Goals
                  </h3>
                  <p className="text-[10px] text-slate-400">High-priority non-negotiable milestones</p>
                </div>
                <button
                  onClick={() => setIsAddingGoal(true)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>

              {isAddingGoal && (
                <form onSubmit={handleAddGoal} className="space-y-2 pt-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Enter main goal for today..."
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setIsAddingGoal(false); setNewGoalText(''); }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md cursor-pointer"
                    >
                      Save Goal
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {todayGoals.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">No goals set for today.</p>
                ) : (
                  todayGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        goal.completed
                          ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-slate-900 dark:text-white'
                          : 'bg-slate-50/70 dark:bg-slate-850/50 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div
                        onClick={() => handleToggleGoal(goal.id)}
                        className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                      >
                        <div className={`h-4 w-4 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                          goal.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {goal.completed && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <span className={`text-xs font-semibold truncate ${goal.completed ? 'line-through opacity-70' : ''}`}>
                          {goal.title}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Goal"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CARD 2: DAILY PERFORMANCE SUMMARY METRICS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Day Summary
                </h3>
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {stats.completionPercent}% Done
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionPercent}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Completed</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{stats.completed}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Pending</span>
                  <span className="text-lg font-bold text-amber-500 font-mono">{stats.pending}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Study Time</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{stats.totalStudyTimeFormatted}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Remaining Time</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">{stats.remainingTimeFormatted}</span>
                </div>

              </div>
            </div>

            {/* CARD 3: QUICK STUDY DISCIPLINE REMINDERS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" /> Focus Guidelines
              </span>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                  <span>Tackle high-priority cognitive tasks in the Morning block.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                  <span>Batch administrative tasks & labs in the Afternoon block.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                  <span>Reserve Night block for reading and light review.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: DAILY NOTES, QUICK NOTES SCRATCHPAD & TOMORROW'S PLAN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* SECTION 1: DAILY NOTES */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-3 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Daily Notes
              </h3>
              <span className="text-[10px] text-slate-400">Day Reflection</span>
            </div>
            <textarea
              rows={6}
              value={dailyNotes}
              onChange={(e) => setDailyNotes(e.target.value)}
              placeholder="Record key lecture points, takeaways, or concepts learned today..."
              className="w-full flex-1 p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans leading-relaxed"
            />
          </div>

          {/* SECTION 2: QUICK NOTES / SCRATCHPAD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-3 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <StickyNote className="h-4 w-4 text-amber-500" />
                Quick Scratchpad
              </h3>
              <span className="text-[10px] text-slate-400">Fast Capture</span>
            </div>
            <textarea
              rows={6}
              value={quickNotes}
              onChange={(e) => setQuickNotes(e.target.value)}
              placeholder="Paste links, temporary formulas, stray thoughts, questions for professors..."
              className="w-full flex-1 p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans leading-relaxed"
            />
          </div>

          {/* SECTION 3: TOMORROW'S PLAN */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-3 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Tomorrow's Plan
              </h3>
              <span className="text-[10px] text-slate-400">Preparation</span>
            </div>
            <textarea
              rows={6}
              value={tomorrowPlan}
              onChange={(e) => setTomorrowPlan(e.target.value)}
              placeholder="Queue up top 3 priorities and study blocks for tomorrow morning..."
              className="w-full flex-1 p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans leading-relaxed"
            />
          </div>

        </div>

      </div>

      {/* CREATE / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[14px] shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
            
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {editingTaskId ? 'Edit Planned Task' : 'Schedule Daily Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mx-5 mt-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTask} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g., Study Tree Traversal, Math Problem Set 3, React Lab..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Time Block Section
                  </label>
                  <select
                    value={formTimeBlock}
                    onChange={(e) => setFormTimeBlock(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="morning">Morning (06:00 - 12:00)</option>
                    <option value="afternoon">Afternoon (12:00 - 17:00)</option>
                    <option value="evening">Evening (17:00 - 21:00)</option>
                    <option value="night">Night (21:00 - 00:00+)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 08:30 AM, 02:00 PM"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Related Habit Selector */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Related Habit (Optional)
                </label>
                <select
                  value={formLinkedHabitId}
                  onChange={(e) => setFormLinkedHabitId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">None (Independent Task)</option>
                  {plannerHabits.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.category || 'Habit'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-3">
                {editingTaskId ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteTask(editingTaskId);
                      setIsModalOpen(false);
                    }}
                    className="px-3 py-1.5 font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs cursor-pointer"
                  >
                    {editingTaskId ? 'Save Changes' : 'Schedule Task'}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
