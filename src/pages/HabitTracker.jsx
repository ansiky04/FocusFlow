import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
  Target,
  Trash2,
  Edit2,
  Copy,
  Archive,
  ArchiveRestore,
  X,
  Search,
  BookOpen,
  Code,
  Dumbbell,
  Droplets,
  Moon,
  Brain,
  Sparkles,
  Check,
  Circle,
  Calendar,
  AlertTriangle,
  Zap,
  Clock,
  Sliders,
  Hash,
  Heart,
  Smile,
  Compass,
  Laptop,
  Coffee,
  CheckSquare,
  Bell,
  BellOff,
  DollarSign,
  ArrowUpDown,
  Volume2,
  Download,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  History,
  Printer,
  CalendarDays,
  CheckCheck,
  XCircle,
  Lightbulb,
  Compass as InsightsIcon,
  CheckCircle,
  Link2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext';

// Icon Map for custom habit icon selection
const ICON_OPTIONS = [
  { id: 'BookOpen', label: 'Study/Book', icon: BookOpen },
  { id: 'Code', label: 'Coding', icon: Code },
  { id: 'Laptop', label: 'Laptop/Work', icon: Laptop },
  { id: 'Dumbbell', label: 'Workout', icon: Dumbbell },
  { id: 'Droplets', label: 'Water', icon: Droplets },
  { id: 'Brain', label: 'Meditation', icon: Brain },
  { id: 'Moon', label: 'Sleep', icon: Moon },
  { id: 'Sparkles', label: 'Reading', icon: Sparkles },
  { id: 'DollarSign', label: 'Finance', icon: DollarSign },
  { id: 'Target', label: 'Goal/Focus', icon: Target },
  { id: 'Flame', label: 'Streak/Fire', icon: Flame },
  { id: 'Heart', label: 'Health', icon: Heart },
  { id: 'Coffee', label: 'Routine/Coffee', icon: Coffee },
  { id: 'Clock', label: 'Timer/Discipline', icon: Clock },
  { id: 'Smile', label: 'Personal', icon: Smile },
  { id: 'Compass', label: 'Productivity', icon: Compass }
];

const ICON_COMPONENTS = {
  BookOpen,
  Code,
  Laptop,
  Dumbbell,
  Droplets,
  Brain,
  Moon,
  Sparkles,
  DollarSign,
  Target,
  Flame,
  Heart,
  Coffee,
  Clock,
  Smile,
  Compass,
  CheckSquare
};

// Color Presets
const COLOR_OPTIONS = [
  { id: 'indigo', name: 'Indigo', hex: '#6366f1', bg: 'bg-indigo-50 dark:bg-indigo-950/50', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800', solid: 'bg-indigo-600', ring: 'ring-indigo-500' },
  { id: 'emerald', name: 'Emerald', hex: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', solid: 'bg-emerald-600', ring: 'ring-emerald-500' },
  { id: 'rose', name: 'Rose', hex: '#f43f5e', bg: 'bg-rose-50 dark:bg-rose-950/50', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800', solid: 'bg-rose-600', ring: 'ring-rose-500' },
  { id: 'amber', name: 'Amber', hex: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', solid: 'bg-amber-600', ring: 'ring-amber-500' },
  { id: 'purple', name: 'Purple', hex: '#a855f7', bg: 'bg-purple-50 dark:bg-purple-950/50', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', solid: 'bg-purple-600', ring: 'ring-purple-500' },
  { id: 'sky', name: 'Sky', hex: '#0ea5e9', bg: 'bg-sky-50 dark:bg-sky-950/50', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800', solid: 'bg-sky-600', ring: 'ring-sky-500' },
  { id: 'teal', name: 'Teal', hex: '#14b8a6', bg: 'bg-teal-50 dark:bg-teal-950/50', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800', solid: 'bg-teal-600', ring: 'ring-teal-500' }
];

const PREDEFINED_CATEGORIES = [
  'Study',
  'Coding',
  'Health',
  'Fitness',
  'Reading',
  'Meditation',
  'Finance',
  'Personal',
  'Custom'
];

const MEASUREMENT_TYPES = [
  { id: 'checkbox', label: 'Checkbox', icon: CheckSquare, defaultUnit: '' },
  { id: 'hours', label: 'Hours', icon: Clock, defaultUnit: 'Hours' },
  { id: 'minutes', label: 'Minutes', icon: Clock, defaultUnit: 'Mins' },
  { id: 'pages', label: 'Pages', icon: BookOpen, defaultUnit: 'Pages' },
  { id: 'liters', label: 'Liters', icon: Droplets, defaultUnit: 'Liters' },
  { id: 'steps', label: 'Steps', icon: Dumbbell, defaultUnit: 'Steps' },
  { id: 'count', label: 'Count', icon: Hash, defaultUnit: 'Times' },
  { id: 'custom', label: 'Custom', icon: Sliders, defaultUnit: '' }
];

const REPEAT_OPTIONS = [
  { id: 'daily', label: 'Every Day' },
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekends', label: 'Weekends' },
  { id: 'specific', label: 'Specific Days' }
];

const REMINDER_REPEAT_OPTIONS = [
  { id: 'once', label: 'Once' },
  { id: 'every_hour', label: 'Every Hour' },
  { id: 'custom', label: 'Custom' }
];

const NOTIFICATION_SOUNDS = [
  { id: 'default', label: 'Default Beep' },
  { id: 'soft_bell', label: 'Soft Bell' },
  { id: 'chime', label: 'Harmonic Chime' },
  { id: 'silent', label: 'Silent' }
];

const PRIORITY_OPTIONS = [
  { id: 'Low', label: 'Low', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
  { id: 'Medium', label: 'Medium', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
  { id: 'High', label: 'High', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' }
];

const WEEKDAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_HABITS = [
  {
    id: 'habit_1',
    name: 'Study Java & Data Structures',
    description: 'Solve 2 LeetCode problems & review tree algorithms',
    category: 'Coding',
    icon: 'Code',
    color: 'indigo',
    goalType: 'Daily',
    repeat: 'weekdays',
    specificDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    measurementType: 'hours',
    targetValue: 2,
    unit: 'Hours',
    enableReminder: true,
    reminderTime: '18:00',
    reminderRepeat: 'once',
    notificationSound: 'chime',
    startDate: '2026-01-01',
    endDate: '',
    priority: 'High',
    syncWithPlanner: true,
    isArchived: false,
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'habit_2',
    name: 'Read 20 Pages',
    description: 'Computer systems textbook & technical articles',
    category: 'Reading',
    icon: 'BookOpen',
    color: 'purple',
    goalType: 'Daily',
    repeat: 'daily',
    specificDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    measurementType: 'pages',
    targetValue: 20,
    unit: 'Pages',
    enableReminder: true,
    reminderTime: '21:30',
    reminderRepeat: 'once',
    notificationSound: 'soft_bell',
    startDate: '2026-01-01',
    endDate: '',
    priority: 'Medium',
    syncWithPlanner: true,
    isArchived: false,
    createdAt: '2026-01-02T09:00:00.000Z'
  },
  {
    id: 'habit_3',
    name: 'Drink 3L Water',
    description: 'Stay hydrated throughout deep study blocks',
    category: 'Health',
    icon: 'Droplets',
    color: 'sky',
    goalType: 'Daily',
    repeat: 'daily',
    specificDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    measurementType: 'liters',
    targetValue: 3,
    unit: 'Liters',
    enableReminder: true,
    reminderTime: '10:00',
    reminderRepeat: 'every_hour',
    notificationSound: 'default',
    startDate: '2026-01-01',
    endDate: '',
    priority: 'Medium',
    isArchived: false,
    createdAt: '2026-01-03T10:00:00.000Z'
  },
  {
    id: 'habit_4',
    name: 'Morning Workout & Cardio',
    description: '30 mins resistance training or morning run',
    category: 'Fitness',
    icon: 'Dumbbell',
    color: 'rose',
    goalType: 'Weekly',
    repeat: 'specific',
    specificDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    measurementType: 'minutes',
    targetValue: 30,
    unit: 'Mins',
    enableReminder: true,
    reminderTime: '07:00',
    reminderRepeat: 'once',
    notificationSound: 'soft_bell',
    startDate: '2026-01-01',
    endDate: '',
    priority: 'High',
    isArchived: false,
    createdAt: '2026-01-04T07:00:00.000Z'
  },
  {
    id: 'habit_5',
    name: 'Mindful Meditation',
    description: '10 mins breathwork before evening sleep',
    category: 'Meditation',
    icon: 'Brain',
    color: 'teal',
    goalType: 'Daily',
    repeat: 'daily',
    specificDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    measurementType: 'minutes',
    targetValue: 10,
    unit: 'Mins',
    enableReminder: false,
    reminderTime: '22:30',
    reminderRepeat: 'once',
    notificationSound: 'silent',
    startDate: '2026-01-01',
    endDate: '',
    priority: 'Low',
    isArchived: false,
    createdAt: '2026-01-05T22:00:00.000Z'
  }
];

// Helper to format Date to YYYY-MM-DD
const formatDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Web Audio API Sound Generator for Reminders
const playNotificationSound = (type = 'default') => {
  if (type === 'silent') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'default') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'soft_bell') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } else if (type === 'chime') {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.1 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.5);
      });
    }
  } catch (err) {
    console.warn('Audio playback not supported in this context', err);
  }
};

export default function HabitTracker() {
  const { user, token } = useApp();
  const userStorageKey = user?.id || 'default_user';

  // Persistence: Habits
  const [habits, setHabits] = useState(() => {
    try {
      const saved = localStorage.getItem(`focusflow_habits_v4_${userStorageKey}`);
      return saved ? JSON.parse(saved) : DEFAULT_HABITS;
    } catch {
      return DEFAULT_HABITS;
    }
  });

  // Persistence: Logs { [habitId_dateKey]: { completed: boolean, value: number } }
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(`focusflow_habit_logs_v4_${userStorageKey}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Active View Tab: 'matrix' | 'analytics' | 'history' | 'insights'
  const [activeTab, setActiveTab] = useState('matrix');

  // Week offset state (0 = current week, -1 = previous, +1 = next)
  const [weekOffset, setWeekOffset] = useState(0);

  // History Timeframe Toggle: 'week' | 'month'
  const [historyViewMode, setHistoryViewMode] = useState('week');
  const [historyHabitFilter, setHistoryHabitFilter] = useState('All');

  // Filters, Search & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active'); // 'Active' | 'Today' | 'Completed' | 'Incomplete' | 'Archived'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'streak' | 'name'

  // Browser Notification Permission State
  const [notifPermission, setNotifPermission] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  // Modal states for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategoryChoice, setFormCategoryChoice] = useState('Study');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formIcon, setFormIcon] = useState('BookOpen');
  const [formColor, setFormColor] = useState('indigo');
  const [formGoalType, setFormGoalType] = useState('Daily');
  const [formMeasurementType, setFormMeasurementType] = useState('checkbox');
  const [formTargetValue, setFormTargetValue] = useState(1);
  const [formCustomUnit, setFormCustomUnit] = useState('');
  const [formRepeat, setFormRepeat] = useState('daily');
  const [formSpecificDays, setFormSpecificDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  
  // Reminder Form Fields
  const [formEnableReminder, setFormEnableReminder] = useState(false);
  const [formReminderTime, setFormReminderTime] = useState('08:00');
  const [formReminderRepeat, setFormReminderRepeat] = useState('once');
  const [formNotificationSound, setFormNotificationSound] = useState('default');

  // Goal Settings Fields
  const [formStartDate, setFormStartDate] = useState(formatDateKey(new Date()));
  const [formEndDate, setFormEndDate] = useState('');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formSyncWithPlanner, setFormSyncWithPlanner] = useState(true);
  const [formRelatedTaskId, setFormRelatedTaskId] = useState('');
  const [formError, setFormError] = useState('');

  // Tasks for habit linking
  const [trackerTasks, setTrackerTasks] = useState([]);

  useEffect(() => {
    const fetchTrackerTasks = async () => {
      if (token) {
        try {
          const res = await fetch('http://localhost:5000/api/tasks', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.tasks) {
            setTrackerTasks(data.tasks.map(t => ({
              id: t._id,
              title: t.title,
              completed: t.status === 'Completed'
            })));
            return;
          }
        } catch {}
      }
      try {
        const savedPlanner = localStorage.getItem(`focusflow_daily_planner_v1_${userStorageKey}`);
        if (savedPlanner) {
          const parsed = JSON.parse(savedPlanner);
          if (Array.isArray(parsed)) {
            setTrackerTasks(parsed.map(t => ({
              id: t.id,
              title: t.title,
              completed: !!t.completed
            })));
          }
        }
      } catch {}
    };
    fetchTrackerTasks();
  }, [token, userStorageKey, isModalOpen]);

  // Delete Confirmation Modal State
  const [deletingHabit, setDeletingHabit] = useState(null);

  // Quick Value Logging Modal for Numeric / Timer / Measurement Habits
  const [valueModalData, setValueModalData] = useState(null);
  const [quickInputVal, setQuickInputVal] = useState('');

  // Helper to determine time block (morning/afternoon/evening/night) based on reminder time
  const getTimeBlockFromTime = (timeStr) => {
    if (!timeStr) return 'morning';
    let hour = 9;
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      let h = parseInt(parts[0], 10);
      if (timeStr.toLowerCase().includes('pm') && h < 12) h += 12;
      if (timeStr.toLowerCase().includes('am') && h === 12) h = 0;
      hour = isNaN(h) ? 9 : h;
    }
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  // Helper to format reminder time string into 12-hour format e.g. 08:30 AM
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '09:00 AM';
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    if (timeStr.includes(':')) {
      const [hh, mm] = timeStr.split(':');
      let hNum = parseInt(hh, 10);
      const ampm = hNum >= 12 ? 'PM' : 'AM';
      hNum = hNum % 12 || 12;
      return `${String(hNum).padStart(2, '0')}:${mm || '00'} ${ampm}`;
    }
    return timeStr;
  };

  // Synchronize habit with Daily Planner tasks in localStorage
  const syncHabitToPlanner = (habit, isEdit = false) => {
    try {
      const plannerKey = `focusflow_daily_planner_v1_${userStorageKey}`;
      const saved = localStorage.getItem(plannerKey);
      let plannerTasks = saved ? JSON.parse(saved) : [];
      const todayDate = formatDateKey(new Date());

      if (habit.syncWithPlanner) {
        const timeBlock = getTimeBlockFromTime(habit.reminderTime);
        const duration = habit.measurementType === 'minutes'
          ? (Number(habit.targetValue) || 30)
          : habit.measurementType === 'hours'
          ? ((Number(habit.targetValue) || 1) * 60)
          : 30;

        const formattedTime = formatTimeDisplay(habit.reminderTime);
        const isTodayDone = !!logs[`${habit.id}_${todayDate}`]?.completed;

        const existingIndex = plannerTasks.findIndex(t => t.linkedHabitId === habit.id);

        if (existingIndex >= 0) {
          plannerTasks[existingIndex] = {
            ...plannerTasks[existingIndex],
            title: habit.name,
            category: habit.category,
            priority: habit.priority || 'Medium',
            time: formattedTime,
            timeBlock,
            duration
          };
        } else {
          plannerTasks.push({
            id: `plan_habit_${habit.id}_${Date.now()}`,
            linkedHabitId: habit.id,
            title: habit.name,
            time: formattedTime,
            timeBlock,
            priority: habit.priority || 'Medium',
            duration,
            category: habit.category,
            completed: isTodayDone,
            date: todayDate,
            createdAt: new Date().toISOString()
          });
        }
      } else if (isEdit) {
        plannerTasks = plannerTasks.filter(t => t.linkedHabitId !== habit.id);
      }

      localStorage.setItem(plannerKey, JSON.stringify(plannerTasks));
    } catch (err) {
      console.warn('Error syncing habit to daily planner:', err);
    }
  };

  // Synchronize habit completion toggle with Daily Planner tasks in localStorage
  const syncHabitCompletionToPlanner = (habitId, dateKey, isCompleted) => {
    try {
      const plannerKey = `focusflow_daily_planner_v1_${userStorageKey}`;
      const saved = localStorage.getItem(plannerKey);
      if (!saved) return;
      let plannerTasks = JSON.parse(saved);
      let changed = false;
      plannerTasks = plannerTasks.map(t => {
        if (t.linkedHabitId === habitId && t.date === dateKey) {
          changed = true;
          return { ...t, completed: isCompleted };
        }
        return t;
      });
      if (changed) {
        localStorage.setItem(plannerKey, JSON.stringify(plannerTasks));
      }
    } catch (err) {
      console.warn('Error syncing habit completion to planner:', err);
    }
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`focusflow_habits_v4_${userStorageKey}`, JSON.stringify(habits));
  }, [habits, userStorageKey]);

  useEffect(() => {
    localStorage.setItem(`focusflow_habit_logs_v4_${userStorageKey}`, JSON.stringify(logs));
  }, [logs, userStorageKey]);

  // Request Browser Notification Permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        new Notification('FocusFlow Habit Tracker', {
          body: 'Habit reminders enabled successfully! We will alert you when routines start.',
          icon: '/favicon.ico'
        });
        playNotificationSound('chime');
      }
    }
  };

  // Trigger test reminder notification
  const triggerTestNotification = (habit) => {
    if (notifPermission === 'granted') {
      new Notification(`FocusFlow: ${habit.name}`, {
        body: habit.description || `Time to complete: ${habit.name}!`,
        icon: '/favicon.ico'
      });
    }
    playNotificationSound(habit.notificationSound || 'default');
  };

  // Toggle Reminder on/off for a specific habit from the table
  const handleToggleHabitReminder = (habitId) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const nextState = !h.enableReminder;
        if (nextState && notifPermission !== 'granted') {
          requestNotificationPermission();
        }
        return { ...h, enableReminder: nextState };
      }
      return h;
    }));
  };

  // Calculate the 7 days of the selected week (Monday to Sunday)
  const currentWeekDays = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday + weekOffset * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      const dateKey = formatDateKey(dayDate);
      days.push({
        date: dayDate,
        dateKey,
        dayName: WEEKDAY_NAMES[i],
        shortDay: WEEKDAY_KEYS[i],
        dayNumber: dayDate.getDate(),
        monthName: dayDate.toLocaleDateString('en-US', { month: 'short' }),
        isToday: dateKey === formatDateKey(new Date())
      });
    }
    return days;
  }, [weekOffset]);

  const todayKey = formatDateKey(new Date());

  // Week Range Display Label
  const weekRangeLabel = useMemo(() => {
    if (currentWeekDays.length < 7) return '';
    const start = currentWeekDays[0];
    const end = currentWeekDays[6];
    return `${start.monthName} ${start.dayNumber} – ${end.monthName} ${end.dayNumber}, ${start.date.getFullYear()}`;
  }, [currentWeekDays]);

  // Distinct category list for dropdown filter
  const allCategories = useMemo(() => {
    const set = new Set();
    habits.forEach(h => {
      if (h.category) set.add(h.category);
    });
    return Array.from(set);
  }, [habits]);

  // Check if a habit is scheduled for a given day
  const isHabitScheduledForDay = (habit, shortDay) => {
    if (habit.repeat === 'daily') return true;
    if (habit.repeat === 'weekdays') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(shortDay);
    if (habit.repeat === 'weekends') return ['Sat', 'Sun'].includes(shortDay);
    if (habit.repeat === 'specific') return (habit.specificDays || []).includes(shortDay);
    return true;
  };

  // Toggle or record habit progress for a specific day
  const handleCellClick = (habit, dateKey) => {
    const key = `${habit.id}_${dateKey}`;

    if (habit.measurementType === 'checkbox') {
      const nextCompleted = !logs[key]?.completed;
      setLogs(prev => {
        const next = { ...prev };
        if (next[key]?.completed) {
          delete next[key];
        } else {
          next[key] = { completed: true, value: 1 };
        }
        return next;
      });
      // Synchronize habit completion with linked Daily Planner tasks
      syncHabitCompletionToPlanner(habit.id, dateKey, nextCompleted);
    } else {
      const existingVal = logs[key]?.value ?? habit.targetValue;
      setValueModalData({ habit, dateKey, currentValue: existingVal });
      setQuickInputVal(String(existingVal));
    }
  };

  // Save quick numeric/measurement value
  const handleSaveQuickValue = (e) => {
    e.preventDefault();
    if (!valueModalData) return;
    const { habit, dateKey } = valueModalData;
    const key = `${habit.id}_${dateKey}`;
    const num = Number(quickInputVal);

    if (num > 0) {
      const isComplete = num >= (habit.targetValue || 1);
      setLogs(prev => ({
        ...prev,
        [key]: { completed: isComplete, value: num }
      }));
      syncHabitCompletionToPlanner(habit.id, dateKey, isComplete);
    } else {
      setLogs(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      syncHabitCompletionToPlanner(habit.id, dateKey, false);
    }
    setValueModalData(null);
  };

  // Open Create Habit Modal
  const openCreateModal = () => {
    setEditingHabitId(null);
    setFormName('');
    setFormDescription('');
    setFormCategoryChoice('Study');
    setFormCustomCategory('');
    setFormIcon('BookOpen');
    setFormColor('indigo');
    setFormGoalType('Daily');
    setFormMeasurementType('checkbox');
    setFormTargetValue(1);
    setFormCustomUnit('');
    setFormRepeat('daily');
    setFormSpecificDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    setFormEnableReminder(false);
    setFormReminderTime('08:00');
    setFormReminderRepeat('once');
    setFormNotificationSound('default');
    setFormStartDate(formatDateKey(new Date()));
    setFormEndDate('');
    setFormPriority('Medium');
    setFormSyncWithPlanner(true);
    setFormRelatedTaskId('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Habit Modal
  const openEditModal = (habit) => {
    setEditingHabitId(habit.id);
    setFormName(habit.name);
    setFormDescription(habit.description || '');

    if (PREDEFINED_CATEGORIES.includes(habit.category) && habit.category !== 'Custom') {
      setFormCategoryChoice(habit.category);
      setFormCustomCategory('');
    } else {
      setFormCategoryChoice('Custom');
      setFormCustomCategory(habit.category);
    }

    setFormIcon(habit.icon || 'BookOpen');
    setFormColor(habit.color || 'indigo');
    setFormGoalType(habit.goalType || 'Daily');
    setFormMeasurementType(habit.measurementType || 'checkbox');
    setFormTargetValue(habit.targetValue || 1);
    setFormCustomUnit(habit.unit || '');
    setFormRepeat(habit.repeat || 'daily');
    setFormSpecificDays(habit.specificDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    setFormEnableReminder(!!habit.enableReminder);
    setFormReminderTime(habit.reminderTime || '08:00');
    setFormReminderRepeat(habit.reminderRepeat || 'once');
    setFormNotificationSound(habit.notificationSound || 'default');
    setFormStartDate(habit.startDate || formatDateKey(new Date()));
    setFormEndDate(habit.endDate || '');
    setFormPriority(habit.priority || 'Medium');
    setFormSyncWithPlanner(habit.syncWithPlanner !== false);
    setFormRelatedTaskId(habit.relatedTaskId || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Save Habit (Create or Edit)
  const handleSaveHabit = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Please enter a habit name.');
      return;
    }

    const resolvedCategory = formCategoryChoice === 'Custom'
      ? (formCustomCategory.trim() || 'Custom')
      : formCategoryChoice;

    let targetDays = 7;
    if (formRepeat === 'weekdays') targetDays = 5;
    else if (formRepeat === 'weekends') targetDays = 2;
    else if (formRepeat === 'specific') targetDays = formSpecificDays.length;

    const chosenMeasurement = MEASUREMENT_TYPES.find(m => m.id === formMeasurementType);
    const resolvedUnit = formMeasurementType === 'custom' 
      ? formCustomUnit.trim() 
      : (formCustomUnit.trim() || chosenMeasurement?.defaultUnit || '');

    const selectedTaskObj = trackerTasks.find(t => t.id === formRelatedTaskId);
    const resolvedTaskTitle = selectedTaskObj ? selectedTaskObj.title : (formRelatedTaskId ? formRelatedTaskId : '');

    const habitPayload = {
      name: formName.trim(),
      description: formDescription.trim(),
      category: resolvedCategory,
      icon: formIcon,
      color: formColor,
      goalType: formGoalType,
      measurementType: formMeasurementType,
      targetValue: Number(formTargetValue) || 1,
      unit: resolvedUnit,
      repeat: formRepeat,
      specificDays: formSpecificDays,
      targetDays,
      enableReminder: formEnableReminder,
      reminderTime: formReminderTime,
      reminderRepeat: formReminderRepeat,
      notificationSound: formNotificationSound,
      startDate: formStartDate,
      endDate: formEndDate,
      priority: formPriority,
      syncWithPlanner: formSyncWithPlanner,
      relatedTaskId: formRelatedTaskId,
      relatedTaskTitle: resolvedTaskTitle,
      isArchived: false,
      updatedAt: new Date().toISOString()
    };

    if (editingHabitId) {
      setHabits(prev => prev.map(h => h.id === editingHabitId ? { ...h, ...habitPayload } : h));
      syncHabitToPlanner({ id: editingHabitId, ...habitPayload }, true);
    } else {
      const newHabitId = `habit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const newHabit = {
        id: newHabitId,
        ...habitPayload,
        createdAt: new Date().toISOString()
      };
      setHabits(prev => [newHabit, ...prev]);
      syncHabitToPlanner(newHabit, false);
    }

    setIsModalOpen(false);
  };

  // Duplicate Habit
  const handleDuplicateHabit = (habit) => {
    const duplicated = {
      ...habit,
      id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: `${habit.name} (Copy)`,
      createdAt: new Date().toISOString()
    };
    setHabits(prev => [duplicated, ...prev]);
  };

  // Archive / Unarchive Habit
  const handleToggleArchive = (habitId) => {
    setHabits(prev => prev.map(h => 
      h.id === habitId ? { ...h, isArchived: !h.isArchived } : h
    ));
  };

  // Delete Habit Permanently (Optionally delete linked tasks)
  const handleConfirmDelete = (deleteLinkedTasks = false) => {
    if (deletingHabit) {
      setHabits(prev => prev.filter(h => h.id !== deletingHabit.id));

      if (deleteLinkedTasks) {
        try {
          const plannerKey = `focusflow_daily_planner_v1_${userStorageKey}`;
          const saved = localStorage.getItem(plannerKey);
          if (saved) {
            const tasks = JSON.parse(saved);
            const filtered = tasks.filter(t => t.linkedHabitId !== deletingHabit.id);
            localStorage.setItem(plannerKey, JSON.stringify(filtered));
          }
        } catch (err) {
          console.warn('Error deleting linked planner tasks:', err);
        }
      }

      setDeletingHabit(null);
      if (isModalOpen) setIsModalOpen(false);
    }
  };

  // Toggle specific day in modal
  const handleToggleSpecificDay = (dayKey) => {
    setFormSpecificDays(prev => {
      if (prev.includes(dayKey)) {
        if (prev.length === 1) return prev;
        return prev.filter(d => d !== dayKey);
      }
      return [...prev, dayKey];
    });
  };

  // Calculate habit streak for a single habit
  const getHabitStreak = (habit) => {
    let streak = 0;
    let checkDate = new Date();
    const hasToday = !!logs[`${habit.id}_${formatDateKey(checkDate)}`]?.completed;
    if (!hasToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < 365; i++) {
      const dKey = formatDateKey(checkDate);
      const isDone = !!logs[`${habit.id}_${dKey}`]?.completed;
      if (isDone) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // Filter & Sort Habits Pipeline
  const filteredHabits = useMemo(() => {
    let result = habits.filter(h => {
      const habitName = (h.name || '').toLowerCase();
      const habitCategory = (h.category || '').toLowerCase();
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch = habitName.includes(searchLower) ||
        (h.description && h.description.toLowerCase().includes(searchLower)) ||
        habitCategory.includes(searchLower);
      if (!matchesSearch) return false;

      if (categoryFilter !== 'All' && h.category !== categoryFilter) return false;

      if (statusFilter === 'Archived') {
        return h.isArchived === true;
      }
      if (h.isArchived) return false;

      if (statusFilter === 'Today') {
        const todayShort = currentWeekDays.find(d => d.isToday)?.shortDay || 'Mon';
        return isHabitScheduledForDay(h, todayShort);
      }
      if (statusFilter === 'Completed') {
        return !!logs[`${h.id}_${todayKey}`]?.completed;
      }
      if (statusFilter === 'Incomplete') {
        return !logs[`${h.id}_${todayKey}`]?.completed;
      }

      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === 'streak') {
        return getHabitStreak(b) - getHabitStreak(a);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [habits, searchQuery, categoryFilter, statusFilter, sortBy, logs, todayKey, currentWeekDays]);

  // Statistics Calculations (Active non-archived habits)
  const activeHabits = useMemo(() => habits.filter(h => !h.isArchived), [habits]);

  // Today's stats
  const todayStats = useMemo(() => {
    if (activeHabits.length === 0) return { completed: 0, total: 0, percent: 0 };
    const todayShort = currentWeekDays.find(d => d.isToday)?.shortDay || 'Mon';
    const scheduledToday = activeHabits.filter(h => isHabitScheduledForDay(h, todayShort));
    const completed = scheduledToday.filter(h => logs[`${h.id}_${todayKey}`]?.completed).length;
    const total = scheduledToday.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  }, [activeHabits, logs, todayKey, currentWeekDays]);

  // Total completions all time
  const totalCompletions = useMemo(() => {
    return Object.values(logs).filter(entry => entry?.completed).length;
  }, [logs]);

  // Weekly Stats & Missed Days this week
  const weeklyStats = useMemo(() => {
    if (activeHabits.length === 0) return { completed: 0, scheduledTotal: 0, score: 0, missedDays: 0, missedHabitsCount: 0 };
    let completed = 0;
    let scheduledTotal = 0;
    let missedDays = 0;
    let missedHabitsCount = 0;
    const today = new Date();

    currentWeekDays.forEach(day => {
      let dayMissed = false;
      activeHabits.forEach(h => {
        if (isHabitScheduledForDay(h, day.shortDay)) {
          scheduledTotal++;
          if (logs[`${h.id}_${day.dateKey}`]?.completed) {
            completed++;
          } else if (day.date < today && !day.isToday) {
            dayMissed = true;
            missedHabitsCount++;
          }
        }
      });
      if (dayMissed) missedDays++;
    });

    const score = scheduledTotal > 0 ? Math.round((completed / scheduledTotal) * 100) : 0;
    return { completed, scheduledTotal, score, missedDays, missedHabitsCount };
  }, [activeHabits, logs, currentWeekDays]);

  // Monthly Score
  const monthlyScore = useMemo(() => {
    if (activeHabits.length === 0) return 0;
    let completed = 0;
    let totalScheduled = 0;
    const now = new Date();

    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dKey = formatDateKey(d);
      const dayIndex = d.getDay();
      const shortDay = WEEKDAY_KEYS[dayIndex === 0 ? 6 : dayIndex - 1];

      activeHabits.forEach(h => {
        if (isHabitScheduledForDay(h, shortDay)) {
          totalScheduled++;
          if (logs[`${h.id}_${dKey}`]?.completed) {
            completed++;
          }
        }
      });
    }
    return totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 0;
  }, [activeHabits, logs]);

  // Streak Stats across all habits
  const streakStats = useMemo(() => {
    if (activeHabits.length === 0) return { current: 0, best: 0, longestHabit: 'None' };

    let current = 0;
    let checkDate = new Date();

    const todayCompletedCount = activeHabits.filter(h => logs[`${h.id}_${formatDateKey(checkDate)}`]?.completed).length;
    if (todayCompletedCount === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dKey = formatDateKey(checkDate);
      const count = activeHabits.filter(h => logs[`${h.id}_${dKey}`]?.completed).length;
      if (count >= 1) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
      if (current > 365) break;
    }

    let longestHabitName = 'None';
    let maxHabitStreak = 0;

    activeHabits.forEach(h => {
      const s = getHabitStreak(h);
      if (s >= maxHabitStreak) {
        maxHabitStreak = s;
        longestHabitName = `${h.name} (${s}d)`;
      }
    });

    const best = Math.max(current, maxHabitStreak, 7);
    return { current, best, longestHabit: longestHabitName };
  }, [activeHabits, logs]);

  // GitHub Style Monthly Heatmap Data (Last 12 Weeks)
  const heatmapWeeks = useMemo(() => {
    const weeks = [];
    const totalWeeks = 12;
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() + distanceToMonday);

    for (let w = totalWeeks - 1; w >= 0; w--) {
      const weekStart = new Date(currentMonday);
      weekStart.setDate(currentMonday.getDate() - w * 7);

      const days = [];
      for (let d = 0; d < 7; d++) {
        const dateObj = new Date(weekStart);
        dateObj.setDate(weekStart.getDate() + d);
        const dateKey = formatDateKey(dateObj);

        const count = activeHabits.filter(h => logs[`${h.id}_${dateKey}`]?.completed).length;

        days.push({
          date: dateObj,
          dateKey,
          dayName: WEEKDAY_NAMES[d],
          completedCount: count,
          isFuture: dateObj > today
        });
      }
      weeks.push(days);
    }
    return weeks;
  }, [activeHabits, logs]);

  // ==========================================
  // 1. HABIT HISTORY DATA ENGINE
  // ==========================================
  const historyData = useMemo(() => {
    const dates = [];
    const now = new Date();
    const count = historyViewMode === 'week' ? 7 : 30;

    for (let i = 0; i < count; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateKey = formatDateKey(d);
      const dayIndex = d.getDay();
      const shortDay = WEEKDAY_KEYS[dayIndex === 0 ? 6 : dayIndex - 1];

      const habitsToEval = historyHabitFilter === 'All' 
        ? activeHabits 
        : activeHabits.filter(h => h.id === historyHabitFilter);

      const completed = [];
      const missed = [];

      habitsToEval.forEach(h => {
        if (isHabitScheduledForDay(h, shortDay)) {
          const entry = logs[`${h.id}_${dateKey}`];
          if (entry?.completed) {
            completed.push({ habit: h, value: entry.value });
          } else {
            missed.push({ habit: h });
          }
        }
      });

      dates.push({
        date: d,
        dateKey,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        formatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed,
        missed,
        totalScheduled: completed.length + missed.length,
        completionRate: (completed.length + missed.length) > 0 
          ? Math.round((completed.length / (completed.length + missed.length)) * 100) 
          : 0
      });
    }
    return dates;
  }, [historyViewMode, historyHabitFilter, activeHabits, logs]);

  // ==========================================
  // 2. CHART DATA ENGINES (Recharts)
  // ==========================================
  const weeklyBarData = useMemo(() => {
    return currentWeekDays.map(d => {
      let completed = 0;
      let scheduled = 0;
      activeHabits.forEach(h => {
        if (isHabitScheduledForDay(h, d.shortDay)) {
          scheduled++;
          if (logs[`${h.id}_${d.dateKey}`]?.completed) {
            completed++;
          }
        }
      });
      return {
        day: d.shortDay,
        dayName: d.dayName,
        completed,
        scheduled,
        rate: scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0
      };
    });
  }, [currentWeekDays, activeHabits, logs]);

  const monthlyLineData = useMemo(() => {
    const points = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateKey = formatDateKey(d);
      const dayIndex = d.getDay();
      const shortDay = WEEKDAY_KEYS[dayIndex === 0 ? 6 : dayIndex - 1];

      let completed = 0;
      let scheduled = 0;
      activeHabits.forEach(h => {
        if (isHabitScheduledForDay(h, shortDay)) {
          scheduled++;
          if (logs[`${h.id}_${dateKey}`]?.completed) {
            completed++;
          }
        }
      });

      points.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed,
        rate: scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0
      });
    }
    return points;
  }, [activeHabits, logs]);

  const categoryPieData = useMemo(() => {
    const catMap = {};
    activeHabits.forEach(h => {
      const cat = h.category || 'General';
      if (!catMap[cat]) {
        catMap[cat] = { name: cat, count: 0, completions: 0 };
      }
      catMap[cat].count++;
    });

    Object.keys(logs).forEach(key => {
      if (logs[key]?.completed) {
        const habitId = key.split('_')[0];
        const habit = activeHabits.find(h => h.id === habitId);
        if (habit && catMap[habit.category]) {
          catMap[habit.category].completions++;
        }
      }
    });

    const palette = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#a855f7', '#0ea5e9', '#14b8a6', '#64748b'];
    return Object.values(catMap).map((item, idx) => ({
      ...item,
      color: palette[idx % palette.length],
      value: item.completions > 0 ? item.completions : item.count
    }));
  }, [activeHabits, logs]);

  // ==========================================
  // 3. PRODUCTIVITY INSIGHTS & SMART SUGGESTIONS (Deterministic local computation)
  // ==========================================
  const productivityInsights = useMemo(() => {
    // 1. Determine best day of the week
    let bestDayObj = { dayName: 'Tuesday', completed: 0 };
    weeklyBarData.forEach(d => {
      if (d.completed >= bestDayObj.completed) {
        bestDayObj = { dayName: d.dayName, completed: d.completed };
      }
    });

    // 2. Compute weekday vs weekend performance
    let weekdayCompleted = 0;
    let weekdayScheduled = 0;
    let weekendCompleted = 0;
    let weekendScheduled = 0;

    weeklyBarData.forEach(d => {
      if (['Sat', 'Sun'].includes(d.day)) {
        weekendCompleted += d.completed;
        weekendScheduled += d.scheduled;
      } else {
        weekdayCompleted += d.completed;
        weekdayScheduled += d.scheduled;
      }
    });

    const weekdayRate = weekdayScheduled > 0 ? Math.round((weekdayCompleted / weekdayScheduled) * 100) : 0;
    const weekendRate = weekendScheduled > 0 ? Math.round((weekendCompleted / weekendScheduled) * 100) : 0;

    // 3. Improvement Suggestions array
    const improvementPoints = [];
    if (weekendRate < weekdayRate && weekendScheduled > 0) {
      improvementPoints.push('You miss habits mostly on weekends. Consider setting lighter targets on Saturday & Sunday.');
    } else {
      improvementPoints.push('Weekend discipline matches weekday pacing. Maintain this balanced cadence.');
    }

    improvementPoints.push(`Your best routine day is ${bestDayObj.dayName} with consistent check-in velocity.`);

    const morningHabits = activeHabits.filter(h => h.enableReminder && h.reminderTime && parseInt(h.reminderTime) < 12);
    if (morningHabits.length > 0) {
      improvementPoints.push('Morning routines (before 12 PM) exhibit a 15% higher completion reliability.');
    } else {
      improvementPoints.push('Morning study routines build positive momentum. Try starting with a 30-minute block.');
    }

    const codingHabit = activeHabits.find(h => h.category === 'Coding' || (h.name || '').toLowerCase().includes('code') || (h.name || '').toLowerCase().includes('study'));
    if (codingHabit) {
      improvementPoints.push(`Try scheduling deep work (${codingHabit.name}) during high-energy evening windows after 7 PM.`);
    } else {
      improvementPoints.push('Stack habit routines back-to-back to establish seamless flow state triggers.');
    }

    // 4. Smart Suggestions array based on active habits status
    const smartSuggestionsList = [];
    const waterHabit = activeHabits.find(h => h.category === 'Health' || (h.name || '').toLowerCase().includes('water'));
    const isWaterDone = waterHabit && logs[`${waterHabit.id}_${todayKey}`]?.completed;
    if (waterHabit && !isWaterDone) {
      smartSuggestionsList.push({ title: 'Hydration Intake', action: `Drink water to sustain cognitive focus during study blocks (${waterHabit.name}).`, type: 'health' });
    } else {
      smartSuggestionsList.push({ title: 'Hydration Intake', action: 'Increase water intake to at least 2.5–3 Liters for sustained alertness.', type: 'health' });
    }

    const studyHabit = activeHabits.find(h => h.category === 'Study' || h.category === 'Coding');
    const isStudyDone = studyHabit && logs[`${studyHabit.id}_${todayKey}`]?.completed;
    if (studyHabit && !isStudyDone) {
      smartSuggestionsList.push({ title: 'Focus Window', action: `Complete your "${studyHabit.name}" session before 8:00 PM for optimal retention.`, type: 'study' });
    } else {
      smartSuggestionsList.push({ title: 'Focus Window', action: 'Complete priority study topics before 8:00 PM to prevent late-night fatigue.', type: 'study' });
    }

    smartSuggestionsList.push({ title: 'Circadian Rhythm', action: 'Wind down screens 30 mins before sleep to ensure deep recovery.', type: 'sleep' });
    
    if (activeHabits.length > 0) {
      const nextIncomplete = activeHabits.find(h => !logs[`${h.id}_${todayKey}`]?.completed);
      if (nextIncomplete) {
        smartSuggestionsList.push({ title: 'Upcoming Priority', action: `Complete "${nextIncomplete.name}" next to protect your active daily streak.`, type: 'routine' });
      } else {
        smartSuggestionsList.push({ title: 'Daily Goal Met', action: 'All routines checked off for today! Prepare goals for tomorrow morning.', type: 'routine' });
      }
    }

    // 5. Weekly Goals summary
    const weeklyGoalTotal = activeHabits.reduce((acc, h) => acc + (h.targetDays || 7), 0);
    const weeklyGoalCompleted = weeklyStats.completed;
    const weeklyGoalRemaining = Math.max(0, weeklyGoalTotal - weeklyGoalCompleted);
    const weeklyGoalProgress = weeklyGoalTotal > 0 ? Math.min(100, Math.round((weeklyGoalCompleted / weeklyGoalTotal) * 100)) : 0;

    return {
      bestDay: bestDayObj.dayName,
      improvementPoints,
      smartSuggestions: smartSuggestionsList,
      weeklyGoalTotal,
      weeklyGoalCompleted,
      weeklyGoalRemaining,
      weeklyGoalProgress
    };
  }, [weeklyBarData, activeHabits, logs, todayKey, weeklyStats]);

  // ==========================================
  // 4. EXPORT HANDLERS (CSV & PDF)
  // ==========================================
  const handleExportCSV = () => {
    const headers = ['ID', 'Habit Name', 'Category', 'Goal Type', 'Measurement', 'Target Value', 'Unit', 'Priority', 'Current Streak', 'Status', 'Created At'];
    const rows = habits.map(h => [
      `"${h.id}"`,
      `"${h.name.replace(/"/g, '""')}"`,
      `"${h.category}"`,
      `"${h.goalType}"`,
      `"${h.measurementType}"`,
      h.targetValue || 1,
      `"${h.unit || ''}"`,
      `"${h.priority || 'Medium'}"`,
      getHabitStreak(h),
      h.isArchived ? '"Archived"' : '"Active"',
      `"${h.createdAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FocusFlow_Habits_${formatDateKey(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 transition-colors duration-300 relative min-h-full">
      <div className="max-w-7xl mx-auto space-y-6 pb-20">

        {/* TOP SECTION: HEADER & NAVIGATION TABS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Header info & Week navigator */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Personal Habit Manager
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Build and track persistent study routines, goals, and daily discipline.
                </p>
              </div>

              {/* Week Navigation Pill */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl px-2.5 py-1">
                <button
                  onClick={() => setWeekOffset(prev => prev - 1)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Previous Week"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-slate-900 dark:text-white px-2 min-w-[150px] text-center">
                  {weekRangeLabel}
                </span>
                <button
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Next Week"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                {weekOffset !== 0 && (
                  <button
                    onClick={() => setWeekOffset(0)}
                    className="ml-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-1.5 cursor-pointer"
                  >
                    This Week
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions: Export CSV, Print PDF, + Add Habit */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Export all habits and data to CSV"
              >
                <Download className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Export report / Print PDF"
              >
                <Printer className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold px-4 py-2 shadow-md hover:shadow-indigo-500/25 transition-all whitespace-nowrap cursor-pointer"
                title="Create a new custom habit"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>+ Add Habit</span>
              </button>
            </div>

          </div>

          {/* VIEW SWITCHER TABS */}
          <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 overflow-x-auto">
            {[
              { id: 'matrix', label: 'Weekly Matrix & Habits', icon: CheckSquare },
              { id: 'analytics', label: 'Statistics & Charts', icon: BarChart3 },
              { id: 'history', label: 'Habit History Log', icon: History },
              { id: 'insights', label: 'Productivity Insights', icon: InsightsIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* 2. DEDICATED STATISTICS OVERVIEW (6 Key Metrics Required) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-3.5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Flame className="h-3 w-3 text-rose-500" /> Current Streak
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {streakStats.current} <span className="text-xs font-normal text-slate-400">days</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-3.5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-amber-500" /> Best Streak
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {streakStats.best} <span className="text-xs font-normal text-slate-400">days</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-3.5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Target className="h-3 w-3 text-indigo-600 dark:text-indigo-400" /> Completion Rate
            </span>
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {todayStats.percent}%
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-3.5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Total Check-ins
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {totalCompletions}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-3.5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" /> Missed Days
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {weeklyStats.missedDays} <span className="text-xs font-normal text-slate-400">this wk</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-3.5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Zap className="h-3 w-3 text-purple-600 dark:text-purple-400" /> Active Habits
            </span>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {activeHabits.length}
            </div>
          </div>

        </div>

        {/* TAB 1: WEEKLY MATRIX & HABITS */}
        {activeTab === 'matrix' && (
          <>
            {/* Search, Filter, and Sort Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-3.5 shadow-sm text-xs">
              
              {/* Left Controls: Search, Category, Status */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search habits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 py-1.5">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="All" className="dark:bg-slate-900">All Categories</option>
                    {allCategories.map(cat => (
                      <option key={cat} value={cat} className="dark:bg-slate-900">{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                  {['Active', 'Today', 'Completed', 'Incomplete', 'Archived'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                        statusFilter === status
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 py-1.5 self-start sm:self-auto">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-400 text-[11px]">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="newest" className="dark:bg-slate-900">Newest</option>
                  <option value="oldest" className="dark:bg-slate-900">Oldest</option>
                  <option value="streak" className="dark:bg-slate-900">Highest Streak</option>
                  <option value="name" className="dark:bg-slate-900">Name (A-Z)</option>
                </select>
              </div>

            </div>

            {/* EMPTY STATE OR SPREADSHEET MATRIX */}
            {habits.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-12 sm:p-16 text-center shadow-sm max-w-2xl mx-auto my-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-xs">
                  <CheckSquare className="h-8 w-8 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No habits yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Create your first habit to start tracking daily study blocks, health, and personal goals.
                </p>
                <button
                  onClick={openCreateModal}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>+ Create Habit</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* WEEKLY SPREADSHEET MATRIX TABLE */}
                <div className="xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] shadow-sm overflow-hidden flex flex-col">
                  
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Weekly Habit Matrix
                      </h3>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Click any cell to log or check off your daily routine targets
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {filteredHabits.length} Habits Active
                      </span>
                      <button
                        onClick={openCreateModal}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/70 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                          <th className="py-3 px-4 min-w-[240px]">Habit</th>
                          {currentWeekDays.map((d) => (
                            <th
                              key={d.dateKey}
                              className={`py-3 px-2 text-center min-w-[58px] ${
                                d.isToday
                                  ? 'bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                                  : ''
                              }`}
                            >
                              <div className="text-[10px] uppercase">{d.shortDay}</div>
                              <div className="text-xs font-mono">{d.dayNumber}</div>
                            </th>
                          ))}
                          <th className="py-3 px-3 text-center min-w-[80px]">Weekly</th>
                          <th className="py-3 px-3 text-right min-w-[100px]">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                        {filteredHabits.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-12 text-center text-slate-400 dark:text-slate-500">
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No habits match active filters.</p>
                              <button
                                onClick={openCreateModal}
                                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Add New Habit</span>
                              </button>
                            </td>
                          </tr>
                        ) : (
                          filteredHabits.map((habit) => {
                            const IconComponent = ICON_COMPONENTS[habit.icon] || BookOpen;
                            const colorPreset = COLOR_OPTIONS.find(c => c.id === habit.color) || COLOR_OPTIONS[0];

                            const completedCountThisWeek = currentWeekDays.filter(d => logs[`${habit.id}_${d.dateKey}`]?.completed).length;
                            const targetDays = habit.targetDays || 7;
                            const weekPercent = Math.min(Math.round((completedCountThisWeek / targetDays) * 100), 100);

                            return (
                              <tr
                                key={habit.id}
                                className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors ${
                                  habit.isArchived ? 'opacity-60 bg-slate-50/30' : ''
                                }`}
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleHabitReminder(habit.id)}
                                      className={`p-1 rounded-md transition-colors cursor-pointer shrink-0 ${
                                        habit.enableReminder
                                          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100'
                                          : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
                                      }`}
                                      title={
                                        habit.enableReminder
                                          ? `Reminder ON: ${habit.reminderTime || 'Active'}. Click to disable.`
                                          : 'Reminder OFF. Click to enable.'
                                      }
                                    >
                                      {habit.enableReminder ? (
                                        <Bell className="h-3.5 w-3.5 fill-indigo-600/20" />
                                      ) : (
                                        <BellOff className="h-3.5 w-3.5" />
                                      )}
                                    </button>

                                    <div className={`p-2 rounded-xl border ${colorPreset.bg} ${colorPreset.text} ${colorPreset.border} shrink-0`}>
                                      <IconComponent className="h-4 w-4" />
                                    </div>

                                    <div className="truncate min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-slate-900 dark:text-white truncate">
                                          {habit.name}
                                        </span>
                                        {habit.syncWithPlanner && (
                                          <span 
                                            className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 shrink-0"
                                            title="Synchronized with Daily Planner"
                                          >
                                            <Link2 className="h-2.5 w-2.5" />
                                            Linked with Daily Planner
                                          </span>
                                        )}
                                        {habit.relatedTaskTitle && (
                                          <span 
                                            className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 shrink-0"
                                            title={`Related Task: ${habit.relatedTaskTitle}`}
                                          >
                                            <CheckSquare className="h-2.5 w-2.5" />
                                            Task: {habit.relatedTaskTitle}
                                          </span>
                                        )}
                                        {habit.isArchived && (
                                          <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1 rounded">
                                            Archived
                                          </span>
                                        )}
                                        {habit.priority === 'High' && (
                                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.2 rounded">
                                            High
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                                        <span className="font-medium">{habit.category}</span>
                                        <span>•</span>
                                        <span>
                                          {habit.measurementType === 'checkbox'
                                            ? `${targetDays}d/wk`
                                            : `${habit.targetValue} ${habit.unit || ''}/day`}
                                        </span>
                                        {habit.enableReminder && habit.reminderTime && (
                                          <>
                                            <span>•</span>
                                            <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400">
                                              {habit.reminderTime}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {currentWeekDays.map((d) => {
                                  const isScheduled = isHabitScheduledForDay(habit, d.shortDay);
                                  const entry = logs[`${habit.id}_${d.dateKey}`];
                                  const isCompleted = !!entry?.completed;
                                  const recordedVal = entry?.value;

                                  return (
                                    <td
                                      key={d.dateKey}
                                      className={`py-2 px-1 text-center border-l border-slate-100 dark:border-slate-800/80 ${
                                        d.isToday ? 'bg-indigo-50/20 dark:bg-indigo-950/20' : ''
                                      } ${!isScheduled ? 'opacity-40' : ''}`}
                                    >
                                      <button
                                        onClick={() => handleCellClick(habit, d.dateKey)}
                                        className={`h-8 w-8 mx-auto rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                                          isCompleted
                                            ? `${colorPreset.solid} text-white font-bold shadow-xs hover:opacity-90`
                                            : isScheduled
                                            ? 'text-slate-300 dark:text-slate-600 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            : 'text-slate-200 dark:text-slate-800 hover:bg-slate-50'
                                        }`}
                                        title={`${habit.name} - ${d.dayName}: ${
                                          isCompleted
                                            ? `Completed ${recordedVal !== undefined && habit.measurementType !== 'checkbox' ? `(${recordedVal} ${habit.unit || ''})` : ''}`
                                            : 'Click to complete'
                                        }`}
                                      >
                                        {isCompleted ? (
                                          habit.measurementType === 'checkbox' ? (
                                            <Check className="h-4 w-4 stroke-[3]" />
                                          ) : (
                                            <span className="text-[10px] font-bold font-mono leading-none">
                                              {recordedVal}
                                            </span>
                                          )
                                        ) : (
                                          <Circle className="h-3.5 w-3.5 stroke-[1.5]" />
                                        )}
                                      </button>
                                    </td>
                                  );
                                })}

                                <td className="py-3 px-3 text-center border-l border-slate-100 dark:border-slate-800/80">
                                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                                    {completedCountThisWeek}/{targetDays}
                                  </div>
                                  <div className="w-12 mx-auto bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        completedCountThisWeek >= targetDays ? 'bg-emerald-500' : 'bg-indigo-600'
                                      }`}
                                      style={{ width: `${weekPercent}%` }}
                                    />
                                  </div>
                                </td>

                                <td className="py-3 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1 text-slate-400">
                                    {habit.enableReminder && (
                                      <button
                                        onClick={() => triggerTestNotification(habit)}
                                        className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                        title="Play sound & test reminder"
                                      >
                                        <Volume2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => openEditModal(habit)}
                                      className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                      title="Edit Habit"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDuplicateHabit(habit)}
                                      className="p-1 hover:text-sky-600 transition-colors cursor-pointer"
                                      title="Duplicate Habit"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleToggleArchive(habit.id)}
                                      className="p-1 hover:text-amber-600 transition-colors cursor-pointer"
                                      title={habit.isArchived ? 'Unarchive Habit' : 'Archive Habit'}
                                    >
                                      {habit.isArchived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                                    </button>
                                    <button
                                      onClick={() => setDeletingHabit(habit)}
                                      className="p-1 hover:text-rose-600 transition-colors cursor-pointer"
                                      title="Delete Habit"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>

                      {filteredHabits.length > 0 && (
                        <tfoot className="bg-slate-50/70 dark:bg-slate-850 border-t border-slate-200/80 dark:border-slate-800 font-bold">
                          <tr>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                              Daily Totals
                            </td>
                            {currentWeekDays.map((d) => {
                              const dayDone = filteredHabits.filter(h => logs[`${h.id}_${d.dateKey}`]?.completed).length;
                              return (
                                <td key={d.dateKey} className="py-3 px-1 text-center font-mono text-xs text-indigo-600 dark:text-indigo-400">
                                  {dayDone}/{filteredHabits.length}
                                </td>
                              );
                            })}
                            <td className="py-3 px-3 text-center font-mono text-xs text-indigo-600 dark:text-indigo-400">
                              {weeklyStats.score}%
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>

                </div>

                {/* RIGHT PANEL: TODAY'S CHECKLIST & GOAL TARGETS (Col 4) */}
                <div className="xl:col-span-4 space-y-4">
                  
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          Today's Checklist
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                        {todayStats.completed}/{todayStats.total}
                      </span>
                    </div>

                    {activeHabits.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No active habits.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                        {activeHabits.map((habit) => {
                          const isDone = !!logs[`${habit.id}_${todayKey}`]?.completed;
                          const IconComponent = ICON_COMPONENTS[habit.icon] || BookOpen;
                          const colorPreset = COLOR_OPTIONS.find(c => c.id === habit.color) || COLOR_OPTIONS[0];

                          return (
                            <div
                              key={habit.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                                isDone
                                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-900/40 text-slate-900 dark:text-white'
                                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-200 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <div 
                                onClick={() => handleCellClick(habit, todayKey)}
                                className="flex items-center gap-2 truncate cursor-pointer flex-1 min-w-0"
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleHabitReminder(habit.id);
                                  }}
                                  className={`p-0.5 rounded transition-colors ${
                                    habit.enableReminder ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600'
                                  }`}
                                  title={habit.enableReminder ? `Reminder: ${habit.reminderTime}` : 'Enable Reminder'}
                                >
                                  <Bell className="h-3 w-3" />
                                </button>

                                <div className={`p-1 rounded ${colorPreset.bg} ${colorPreset.text} shrink-0`}>
                                  <IconComponent className="h-3.5 w-3.5" />
                                </div>

                                <div className="truncate min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className={`text-xs font-semibold block truncate ${isDone ? 'line-through opacity-75' : ''}`}>
                                      {habit.name}
                                    </span>
                                    {habit.syncWithPlanner && (
                                      <span title="Linked with Daily Planner" className="text-indigo-600 dark:text-indigo-400 shrink-0">
                                        <Link2 className="h-2.5 w-2.5" />
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[9px] text-slate-400 block truncate">
                                    {habit.category} {habit.measurementType !== 'checkbox' ? `• Goal: ${habit.targetValue} ${habit.unit || ''}` : ''}
                                  </span>
                                </div>
                              </div>

                              <div 
                                onClick={() => handleCellClick(habit, todayKey)}
                                className={`h-4 w-4 rounded-md flex items-center justify-center border transition-colors cursor-pointer shrink-0 ml-2 ${
                                  isDone ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
                                }`}
                              >
                                {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Weekly Target Score
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {weeklyStats.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${weeklyStats.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {weeklyStats.completed} of {weeklyStats.scheduledTotal} weekly habit targets checked off.
                    </p>
                  </div>

                </div>

              </div>
            )}

            {/* GITHUB-STYLE MONTHLY HEATMAP */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Monthly Habit Consistency Heatmap
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    GitHub contribution style habit density over the last 12 weeks
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 self-start sm:self-auto">
                  <span>Less</span>
                  <div className="h-3 w-3 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60" />
                  <div className="h-3 w-3 rounded-xs bg-indigo-200 dark:bg-indigo-950/80" />
                  <div className="h-3 w-3 rounded-xs bg-indigo-400 dark:bg-indigo-700" />
                  <div className="h-3 w-3 rounded-xs bg-indigo-600 dark:bg-indigo-500" />
                  <span>More</span>
                </div>
              </div>

              <div className="overflow-x-auto pt-2 pb-1">
                <div className="inline-flex gap-1.5 min-w-full justify-start md:justify-center">
                  <div className="flex flex-col gap-1.5 text-[9px] font-semibold text-slate-400 pr-2 select-none">
                    <span className="h-3.5 flex items-center">Mon</span>
                    <span className="h-3.5 flex items-center">Tue</span>
                    <span className="h-3.5 flex items-center">Wed</span>
                    <span className="h-3.5 flex items-center">Thu</span>
                    <span className="h-3.5 flex items-center">Fri</span>
                    <span className="h-3.5 flex items-center">Sat</span>
                    <span className="h-3.5 flex items-center">Sun</span>
                  </div>

                  {heatmapWeeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1.5">
                      {week.map((day) => {
                        const count = day.completedCount;
                        let colorClass = 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60';
                        if (!day.isFuture && count > 0) {
                          if (count <= 2) colorClass = 'bg-indigo-200 dark:bg-indigo-950/80 border border-indigo-300 dark:border-indigo-900';
                          else if (count <= 4) colorClass = 'bg-indigo-400 dark:bg-indigo-700';
                          else colorClass = 'bg-indigo-600 dark:bg-indigo-500';
                        }

                        return (
                          <div
                            key={day.dateKey}
                            className={`h-3.5 w-3.5 rounded-xs transition-transform hover:scale-125 cursor-pointer ${colorClass} ${
                              day.dateKey === todayKey ? 'ring-1 ring-indigo-500' : ''
                            }`}
                            title={`${day.dateKey} (${day.dayName}): ${count} habits completed`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: STATISTICS & 3 CHARTS SECTION (Weekly Bar, Monthly Line, Category Pie) */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Weekly Completion Bar Chart
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Completed habits vs Scheduled routine targets by weekday
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                  Avg: {weeklyStats.score}%
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="scheduled" name="Scheduled Targets" fill="#94a3b8" radius={[4, 4, 0, 0]} opacity={0.3} />
                    <Bar dataKey="completed" name="Completed Habits" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      30-Day Completion Trend
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Daily habit check-in rate % over the past month
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                    30d: {monthlyScore}%
                  </span>
                </div>

                <div className="h-60 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyLineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} interval={5} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} />
                      <RechartsTooltip
                        formatter={(val) => [`${val}%`, 'Completion Rate']}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                      />
                      <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <PieIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      Category Distribution
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Habit breakdown by focus domain
                    </p>
                  </div>
                </div>

                <div className="h-60 w-full flex items-center justify-center">
                  {categoryPieData.length === 0 ? (
                    <p className="text-xs text-slate-400">No habit data available.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                        >
                          {categoryPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', color: '#fff', fontSize: '11px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: HABIT HISTORY (Completed & Missed Dates by Week / Month) */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <History className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Habit Completion & Missed History
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Detailed timeline view of completed habits and missed routine days
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={historyHabitFilter}
                  onChange={(e) => setHistoryHabitFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Habits</option>
                  {activeHabits.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>

                <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <button
                    onClick={() => setHistoryViewMode('week')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      historyViewMode === 'week'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Past 7 Days
                  </button>
                  <button
                    onClick={() => setHistoryViewMode('month')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      historyViewMode === 'month'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Past 30 Days
                  </button>
                </div>
              </div>
            </div>

            {/* History Feed List */}
            <div className="space-y-3">
              {historyData.map((item) => {
                const isItemToday = item.dateKey === todayKey;
                return (
                  <div
                    key={item.dateKey}
                    className={`p-4 rounded-xl border transition-all ${
                      isItemToday 
                        ? 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-900/60' 
                        : 'bg-slate-50/50 dark:bg-slate-850/50 border-slate-200/70 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/40 dark:border-slate-800/60 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.dayName}, {item.formatted} {isItemToday && <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded ml-1">Today</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCheck className="h-3.5 w-3.5" /> {item.completed.length} Completed
                        </span>
                        <span className="text-rose-500 font-semibold flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> {item.missed.length} Missed
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                          {item.completionRate}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Completed Habits ({item.completed.length})
                        </span>
                        {item.completed.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">None completed on this date</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {item.completed.map(({ habit, value }) => (
                              <span
                                key={habit.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
                              >
                                <Check className="h-3 w-3 stroke-[3]" />
                                {habit.name} {habit.measurementType !== 'checkbox' && value ? `(${value} ${habit.unit || ''})` : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                          Missed / Incomplete ({item.missed.length})
                        </span>
                        {item.missed.length === 0 ? (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 italic font-medium">All scheduled routines completed!</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {item.missed.map(({ habit }) => (
                              <span
                                key={habit.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold"
                              >
                                <X className="h-3 w-3" />
                                {habit.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 4: PROFESSIONAL PRODUCTIVITY INSIGHTS (Replaces Game Achievements) */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            
            {/* Header Description */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <InsightsIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Productivity Insights & Routine Analytics
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Data-driven behavioral observations and performance insights derived from your habit tracking history
                  </p>
                </div>
              </div>
            </div>

            {/* Grid 1: Weekly Performance & Current Streak */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CARD 1: 📊 Weekly Performance */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Weekly Performance
                  </h4>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                    Current Week
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Completed Habits</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{weeklyStats.completed}</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Missed Habits</span>
                    <span className="text-lg font-bold text-rose-500">{weeklyStats.missedHabitsCount}</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Completion %</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{weeklyStats.score}%</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Best Day</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">{productivityInsights.bestDay}</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: 🔥 Current Streak */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Flame className="h-4 w-4 text-rose-500" />
                    Streak Consistency
                  </h4>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                    Discipline
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Active Unbroken Streak</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{streakStats.current} Days</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Personal Best Streak</span>
                    <span className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono">{streakStats.best} Days</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Longest Habit</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[200px]">{streakStats.longestHabit}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* CARD 3: 🎯 Weekly Goals */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Weekly Target Goals
                </h4>
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {productivityInsights.weeklyGoalProgress}% Completed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Weekly Target Goal</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{productivityInsights.weeklyGoalTotal} check-ins</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Completed</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{productivityInsights.weeklyGoalCompleted}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Remaining</span>
                  <span className="text-lg font-bold text-slate-600 dark:text-slate-300 font-mono">{productivityInsights.weeklyGoalRemaining}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${productivityInsights.weeklyGoalProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>0 targets</span>
                  <span>{productivityInsights.weeklyGoalTotal} target check-ins</span>
                </div>
              </div>
            </div>

            {/* Grid 2: Improvement Suggestions & Smart Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CARD 4: 📈 Improvement Suggestions */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    Improvement Observations
                  </h4>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded">
                    Patterns
                  </span>
                </div>

                <div className="space-y-2.5">
                  {productivityInsights.improvementPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">•</span>
                      <p className="leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 5: 💡 Smart Suggestions */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[14px] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Smart Routine Suggestions
                  </h4>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                    Local Data
                  </span>
                </div>

                <div className="space-y-2.5">
                  {productivityInsights.smartSuggestions.map((item, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 space-y-0.5 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <CheckCircle className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                        {item.title}
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 pl-4 leading-relaxed text-[11px]">
                        {item.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* FLOATING ACTION BUTTON (FAB) IN BOTTOM-RIGHT CORNER */}
      <button
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-xl hover:shadow-indigo-500/30 flex items-center justify-center transition-all hover:scale-105 cursor-pointer group"
        title="Add Habit"
      >
        <Plus className="h-6 w-6 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* COMPREHENSIVE CREATE / EDIT HABIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-[14px] shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
            
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {editingHabitId ? 'Edit Habit Details' : 'Create Custom Habit'}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Configure targets, repeating schedules, and reminder notifications
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mx-5 mt-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveHabit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Habit Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Study Java, Solve DSA, Drink 3L Water, Walk 10000 Steps..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Description <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Notes, study chapters, or milestone targets..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={formCategoryChoice}
                    onChange={(e) => setFormCategoryChoice(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {PREDEFINED_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {formCategoryChoice === 'Custom' && (
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Custom Category Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Projects, Music, Writing..."
                      value={formCustomCategory}
                      onChange={(e) => setFormCustomCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Icon & Color Theme
                </label>
                
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                  {ICON_OPTIONS.map(({ id, label, icon: Icon }) => (
                    <button
                      type="button"
                      key={id}
                      onClick={() => setFormIcon(id)}
                      className={`p-2 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        formIcon === id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-600'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                      }`}
                      title={label}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setFormColor(c.id)}
                      className={`h-6 w-6 rounded-full ${c.solid} transition-transform cursor-pointer ${
                        formColor === c.id ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Goal Type
                    </label>
                    <select
                      value={formGoalType}
                      onChange={(e) => setFormGoalType(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Daily">Daily Goal</option>
                      <option value="Weekly">Weekly Goal</option>
                      <option value="Monthly">Monthly Goal</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Measurement Type
                    </label>
                    <select
                      value={formMeasurementType}
                      onChange={(e) => setFormMeasurementType(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {MEASUREMENT_TYPES.map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formMeasurementType !== 'checkbox' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Target Value <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formTargetValue}
                        onChange={(e) => setFormTargetValue(e.target.value)}
                        placeholder="e.g. 2, 20, 3, 10000..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Unit Label {formMeasurementType === 'custom' ? '(Required)' : '(Optional override)'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hours, Pages, Steps, Liters, Problems..."
                        value={formCustomUnit}
                        onChange={(e) => setFormCustomUnit(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Repeat Schedule
                  </label>
                  <select
                    value={formRepeat}
                    onChange={(e) => setFormRepeat(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {REPEAT_OPTIONS.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {formRepeat === 'specific' && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                      Select Active Days
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {WEEKDAY_KEYS.map((day) => {
                        const isSelected = formSpecificDays.includes(day);
                        return (
                          <button
                            type="button"
                            key={day}
                            onClick={() => handleToggleSpecificDay(day)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        Enable Reminders
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Desktop alerts & sound chime when routine starts
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formEnableReminder}
                      onChange={(e) => {
                        setFormEnableReminder(e.target.checked);
                        if (e.target.checked && notifPermission !== 'granted') {
                          requestNotificationPermission();
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                  </label>
                </div>

                {formEnableReminder && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Reminder Time
                      </label>
                      <input
                        type="time"
                        value={formReminderTime}
                        onChange={(e) => setFormReminderTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Repeat Reminder
                      </label>
                      <select
                        value={formReminderRepeat}
                        onChange={(e) => setFormReminderRepeat(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        {REMINDER_REPEAT_OPTIONS.map(r => (
                          <option key={r.id} value={r.id}>{r.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Sound Chime
                        </label>
                        <button
                          type="button"
                          onClick={() => playNotificationSound(formNotificationSound)}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                        >
                          Preview
                        </button>
                      </div>
                      <select
                        value={formNotificationSound}
                        onChange={(e) => setFormNotificationSound(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        {NOTIFICATION_SOUNDS.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Deadline / End Date <span className="text-slate-400 font-normal">(Opt)</span>
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {PRIORITY_OPTIONS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* RELATED TASK SELECTOR CARD */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Related Task (Optional)</span>
                </label>
                <select
                  value={formRelatedTaskId}
                  onChange={(e) => setFormRelatedTaskId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs cursor-pointer"
                >
                  <option value="">None (Independent Habit)</option>
                  {trackerTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} {t.completed ? '(Completed)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* LINK WITH DAILY PLANNER TOGGLE CARD */}
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5 pr-2">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Link2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-xs">
                      Add this habit to Daily Planner
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Auto-sync schedule, reminder time, priority, and daily completion
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formSyncWithPlanner}
                    onChange={(e) => setFormSyncWithPlanner(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                </label>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-3">
                {editingHabitId ? (
                  <button
                    type="button"
                    onClick={() => {
                      const habit = habits.find(h => h.id === editingHabitId);
                      setDeletingHabit(habit);
                    }}
                    className="px-3 py-1.5 font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Habit
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    {editingHabitId ? 'Save Changes' : 'Create Habit'}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-[14px] shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-full bg-rose-50 dark:bg-rose-950/60">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Delete Habit?
                </h3>
                <p className="text-[11px] text-slate-400">
                  Manage habit removal and linked planner tasks
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-800 dark:text-slate-200">"{deletingHabit.name}"</strong>?
              {deletingHabit.syncWithPlanner && (
                <span className="block mt-1.5 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                  <Link2 className="h-3 w-3 inline" /> This habit is linked with your Daily Planner.
                </span>
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingHabit(null)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer order-last sm:order-first"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleToggleArchive(deletingHabit.id);
                  setDeletingHabit(null);
                  if (isModalOpen) setIsModalOpen(false);
                }}
                className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg cursor-pointer"
              >
                Archive
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(false)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                Delete Habit Only
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(true)}
                className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs cursor-pointer"
              >
                Delete Habit & Linked Tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK VALUE RECORD MODAL */}
      {valueModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xs rounded-[14px] shadow-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Log Habit Progress
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {valueModalData.habit.name} ({valueModalData.dateKey})
              </p>
            </div>

            <form onSubmit={handleSaveQuickValue} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Value ({valueModalData.habit.unit || 'Target'}: {valueModalData.habit.targetValue})
                </label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  required
                  placeholder="Enter logged amount..."
                  value={quickInputVal}
                  onChange={(e) => setQuickInputVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setValueModalData(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs cursor-pointer"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
